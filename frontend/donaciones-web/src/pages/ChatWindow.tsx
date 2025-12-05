// src/pages/ChatWindow.tsx
import { useState, useRef, useEffect } from "react";
import { Send, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams, useParams, useLocation } from "react-router-dom";
import NavbarLogged from "../components/NavbarLogged";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";

import { firestoreDb } from "../firebaseConfig";

// -------------------------------------------------------------
// Types
// -------------------------------------------------------------
type ChatMessage = {
  id: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  timestamp: any;
};

const USERS_API = "http://localhost:4000/api/users";
const DONATION_API = "http://localhost:4000/api/donations";

// -------------------------------------------------------------
// Component
// -------------------------------------------------------------
const ChatWindow = () => {
  const { user } = useAuth();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const chatId =
    (params.chatId as string) || (searchParams.get("chat") as string) || "";

  const [otherName, setOtherName] = useState("Usuario");
  const [otherPhoto, setOtherPhoto] = useState("");
  const [donation, setDonation] = useState<any | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // -------------------------------------------------------------
  // Obtener IDs
  // -------------------------------------------------------------
  const [donationId, requesterId, donorId] = chatId.split("_");
  const otherId = user?.uid === requesterId ? donorId : requesterId;

  // -------------------------------------------------------------
  // Load usuario
  // -------------------------------------------------------------
  useEffect(() => {
    if (!otherId) return;

    const loadUser = async () => {
      try {
        const res = await axios.get(`${USERS_API}/${otherId}`);
        setOtherName(res.data.name || "Usuario");
        setOtherPhoto(
          res.data.photoUrl ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        );
      } catch {
        setOtherName("Usuario");
      }
    };

    loadUser();
  }, [otherId]);

  // -------------------------------------------------------------
  // Load donación
  // -------------------------------------------------------------
  useEffect(() => {
    if (!donationId) return;

    const loadDonation = async () => {
      try {
        const res = await axios.get(`${DONATION_API}/${donationId}`);
        setDonation(res.data);
      } catch {
        setDonation(null);
      }
    };
    loadDonation();
  }, [donationId]);

  // -------------------------------------------------------------
  // Load mensajes + manejar notificaciones
  // -------------------------------------------------------------
  useEffect(() => {
    if (!chatId || !user?.uid) return;

    const q = query(
      collection(firestoreDb, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ChatMessage[];

      setMessages(arr);

      const lastMsg = arr[arr.length - 1];
      if (!lastMsg) return;

      const chatRef = doc(firestoreDb, "chats", chatId);
      const insideChat = location.pathname === `/chat/${chatId}`;

      // 🔥 Si el mensaje NO es mío
      if (lastMsg.senderId !== user.uid) {
        if (insideChat) {
          // Estoy viendo el chat → marcar como leído
          await updateDoc(chatRef, {
            unreadFor: arrayRemove(user.uid),
          });
        } else {
          // No estoy viendo el chat → generar notificación
          await updateDoc(chatRef, {
            unreadFor: arrayUnion(user.uid),
          });
        }
      }
    });

    return unsub;
  }, [chatId, user, location.pathname]);

  // -------------------------------------------------------------
  // Autoscroll
  // -------------------------------------------------------------
  useEffect(() => {
    setTimeout(scrollToBottom, 50);
  }, [messages]);

  // -------------------------------------------------------------
  // Subir imagen al servidor (Cloudinary a través del backend)
  // -------------------------------------------------------------
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        "http://localhost:4000/api/donations/upload-image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return res.data.url;
    } catch (err) {
      console.log("Error subiendo imagen:", err);
      return null;
    }
  };

  // -------------------------------------------------------------
  // Enviar mensaje (texto o imagen)
  // -------------------------------------------------------------
  const sendMessage = async () => {
    if (!user) return;

    const chatRef = doc(firestoreDb, "chats", chatId);

    // 🔥 1) Si hay una imagen → enviar solo imagen
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) {
        await addDoc(collection(firestoreDb, "chats", chatId, "messages"), {
          senderId: user.uid,
          content: "",
          imageUrl: url,
          timestamp: serverTimestamp(),
        });

        // ❗ Notificación la maneja el listener
        await updateDoc(chatRef, { lastActivity: serverTimestamp() });
      }

      setImageFile(null);
      return;
    }

    // 🔥 2) Texto normal
    if (!text.trim()) return;

    await addDoc(collection(firestoreDb, "chats", chatId, "messages"), {
      senderId: user.uid,
      content: text.trim(),
      timestamp: serverTimestamp(),
    });

    await updateDoc(chatRef, { lastActivity: serverTimestamp() });

    setText("");
  };

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#f5efe7]">
      <NavbarLogged />

      <div className="pt-24 pb-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL IZQUIERDO */}
        <div className="col-span-1 bg-white rounded-3xl shadow-xl border p-5 flex flex-col gap-5 h-fit">
          <div className="flex items-center gap-3">
            <img
              src={
                otherPhoto ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="w-12 h-12 rounded-full object-cover border"
            />
            <h2 className="text-lg font-semibold">{otherName}</h2>
          </div>

          {donation && (
            <>
              {donation.images?.length > 0 && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border bg-[#fff8f0]">
                  <img
                    src={donation.images[activeImageIndex]}
                    className="w-full h-full object-cover"
                  />

                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? donation.images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={() =>
                      setActiveImageIndex(
                        (prev) => (prev + 1) % donation.images.length
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              <div className="space-y-2 text-gray-800 text-sm">
                <p>
                  <strong>Descripción:</strong> {donation.description}
                </p>
                <p>
                  <strong>Cantidad:</strong> {donation.quantity}{" "}
                  {donation.unit}
                </p>
                <p>
                  <strong>Tipo:</strong> {donation.type}
                </p>
                {donation.location?.address && (
                  <p>
                    <strong>Ubicación:</strong> {donation.location.address}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* PANEL DERECHO */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl shadow-xl border p-6 flex flex-col h-[75vh]">
          <h2 className="text-xl font-bold mb-3">
            Conversación con {otherName}
          </h2>

          {/* MENSAJES */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4">
            {messages.map((m) => {
              const isMine = m.senderId === user?.uid;

              const date = m.timestamp?.toDate
                ? m.timestamp
                    .toDate()
                    .toLocaleTimeString("es-BO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                : "";

              return (
                <div key={m.id} className="w-full">
                  <div
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl shadow ${
                        isMine
                          ? "bg-gradient-to-r from-[#826c43] to-[#e66748] text-white"
                          : "bg-[#fff8f0] text-gray-800"
                      }`}
                    >
                      <>
                        {/* Imagen */}
                        {m.imageUrl && (
                          <img
                            src={m.imageUrl}
                            className="w-60 rounded-xl mb-2 shadow-lg border"
                          />
                        )}

                        {/* Texto */}
                        {m.content && <p>{m.content}</p>}
                      </>

                      <p className="text-xs opacity-60 mt-1">{date}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef}></div>
          </div>

          {/* INPUT + IMAGEN */}
          <div className="mt-4 flex items-center gap-3 relative">
            {/* BOTÓN IMAGEN */}
            <button
              onClick={() => imageInputRef.current?.click()}
              className="px-3 py-3 rounded-xl bg-[#f5efe7] border hover:bg-[#e8dfd1] transition shadow"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/1829/1829586.png"
                className="w-6 h-6 opacity-80"
              />
            </button>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />

            {/* INPUT TEXTO — Desactivado si hay imagen */}
            <input
              type="text"
              value={text}
              disabled={!!imageFile}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={
                imageFile ? "Imagen lista para enviar…" : "Escribe un mensaje…"
              }
              className="flex-1 px-4 py-3 border rounded-xl shadow-sm"
            />

            {/* BOTÓN ENVIAR */}
            <button
              onClick={sendMessage}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white shadow"
            >
              <Send />
            </button>

            {/* PREVISUALIZACIÓN DE IMAGEN */}
            {imageFile && (
              <div className="absolute bottom-20 left-0 w-full bg-white p-4 rounded-xl shadow-lg border flex items-center gap-4">
                <img
                  src={URL.createObjectURL(imageFile)}
                  className="w-32 h-32 object-cover rounded-xl border"
                />

                <div className="flex flex-col gap-2">
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl shadow"
                  >
                    Enviar imagen
                  </button>

                  <button
                    onClick={() => {
                      setImageFile(null);
                      if (imageInputRef.current) {
                        imageInputRef.current.value = ""; // 👈 Permite volver a seleccionar la misma imagen
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl shadow"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
