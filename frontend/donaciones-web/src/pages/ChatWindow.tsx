// src/pages/ChatWindow.tsx
import { useState, useRef, useEffect } from "react";
import { Send, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
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
  deleted?: boolean;
  edited?: boolean;
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

  // ---------------------------
  // ESTADOS PARA EDITAR MENSAJE
  // ---------------------------
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null);

  // ---------------------------
  // CONTROL EXACTO DE LA VISTA ACTUAL
  // ---------------------------
  const [isInsideChat, setIsInsideChat] = useState(false);

  useEffect(() => {
    setIsInsideChat(location.pathname === `/chat/${chatId}`);
  }, [location.pathname, chatId]);

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
  // Load mensajes + manejar unreadFor
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
        ...(d.data() as any),
      })) as ChatMessage[];

      setMessages(arr);

      const lastMsg = arr[arr.length - 1];
      if (!lastMsg) return;

      const chatRef = doc(firestoreDb, "chats", chatId);

      if (lastMsg.senderId !== user.uid) {
        if (isInsideChat) {
          await updateDoc(chatRef, {
            unreadFor: arrayRemove(user.uid),
          });
        } else {
          await updateDoc(chatRef, {
            unreadFor: arrayUnion(user.uid),
          });
        }
      }
    });

    return unsub;
  }, [chatId, user?.uid, isInsideChat]);

  // -------------------------------------------------------------
  // Autoscroll
  // -------------------------------------------------------------
  useEffect(() => {
    setTimeout(scrollToBottom, 60);
  }, [messages]);

  // -------------------------------------------------------------
  // Subir imagen
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
  // ENVIAR MENSAJE
  // -------------------------------------------------------------
  const sendMessage = async () => {
    if (!user || !chatId) return;

    const chatRef = doc(firestoreDb, "chats", chatId);

    // Enviar imagen
    if (imageFile) {
      const url = await uploadImage(imageFile);

      if (url) {
        await addDoc(collection(firestoreDb, "chats", chatId, "messages"), {
          senderId: user.uid,
          content: "",
          imageUrl: url,
          timestamp: serverTimestamp(),
          deleted: false,
          edited: false,
        });

        await updateDoc(chatRef, {
          lastActivity: serverTimestamp(),
          unreadFor: arrayUnion(otherId),
        });
      }

      setImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    // Enviar texto
    if (!text.trim()) return;

    await addDoc(collection(firestoreDb, "chats", chatId, "messages"), {
      senderId: user.uid,
      content: text.trim(),
      imageUrl: "",
      timestamp: serverTimestamp(),
      deleted: false,
      edited: false,
    });

    await updateDoc(chatRef, {
      lastActivity: serverTimestamp(),
      unreadFor: arrayUnion(otherId),
    });

    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // -------------------------------------------------------------
  // EDITAR MENSAJE
  // -------------------------------------------------------------
  const startEditing = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setEditingText(msg.content || "");
    setEditingImageFile(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
    setEditingImageFile(null);
  };

  const saveEdit = async (msg: ChatMessage) => {
    const msgRef = doc(firestoreDb, "chats", chatId, "messages", msg.id);

    let newImageUrl = msg.imageUrl || "";

    if (editingImageFile) {
      const url = await uploadImage(editingImageFile);
      if (url) newImageUrl = url;
    }

    await updateDoc(msgRef, {
      content: editingText,
      imageUrl: newImageUrl,
      edited: true,
    });

    cancelEditing();
  };

  // -------------------------------------------------------------
  // ELIMINAR MENSAJE
  // -------------------------------------------------------------
  const deleteMessage = async (msg: ChatMessage) => {
    const ref = doc(firestoreDb, "chats", chatId, "messages", msg.id);
    await updateDoc(ref, {
      deleted: true,
      content: "",
      imageUrl: "",
      edited: false,
    });
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

              const bubbleStyles =
                "max-w-[75%] p-3 rounded-2xl shadow relative";

              const bubbleColors = isMine
                ? "bg-gradient-to-r from-[#826c43] to-[#e66748] text-white"
                : "bg-[#fff8f0] text-gray-800";

              return (
                <div key={m.id} className={`w-full ${isMine ? "text-right" : ""}`}>
                  <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    
                    <div className={`${bubbleStyles} ${bubbleColors} group`}>

                      {/* Botón de más opciones */}
                      {isMine && !m.deleted && editingId !== m.id && (
                        <button
                          className="absolute -top-2 -right-2 p-1 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition"
                          onClick={() => startEditing(m)}
                        >
                          <MoreVertical size={16} />
                        </button>
                      )}

                      {/* -------- MENSAJE ELIMINADO -------- */}
                      {m.deleted ? (
                        <p className="italic opacity-70">Mensaje eliminado</p>
                      ) : (
                        <>
                          {/* -------- EDITANDO TEXTO ---------- */}
                          {editingId === m.id && !m.imageUrl && (
                            <div className="space-y-2">
                              <input
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full px-2 py-1 rounded bg-white text-black"
                              />

                              {/* Botones */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEdit(m)}
                                  className="px-3 py-1 bg-green-600 text-white rounded"
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-1 bg-gray-400 rounded"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => deleteMessage(m)}
                                  className="px-3 py-1 bg-red-600 text-white rounded"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          )}

                          {/* -------- EDITANDO IMAGEN ---------- */}
                          {editingId === m.id && m.imageUrl && (
                            <div className="space-y-2">
                              <img
                                src={
                                  editingImageFile
                                    ? URL.createObjectURL(editingImageFile)
                                    : m.imageUrl
                                }
                                className="w-40 rounded-xl border"
                              />

                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  e.target.files?.length &&
                                  setEditingImageFile(e.target.files[0])
                                }
                              />

                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEdit(m)}
                                  className="px-3 py-1 bg-green-600 text-white rounded"
                                >
                                  Guardar
                                </button>

                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-1 bg-gray-400 rounded"
                                >
                                  Cancelar
                                </button>

                                <button
                                  onClick={() => deleteMessage(m)}
                                  className="px-3 py-1 bg-red-600 text-white rounded"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          )}

                          {/* -------- MENSAJE NORMAL -------- */}
                          {editingId !== m.id && (
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
                          )}
                        </>
                      )}

                      {/* PIE DE MENSAJE */}
                      <p className="text-xs opacity-60 mt-1">
                        {date} {m.edited && !m.deleted && "(editado)"}
                      </p>
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

            {/* INPUT TEXTO */}
            <input
              type="text"
              value={text}
              disabled={!!imageFile}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
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

            {/* PREVISUALIZACIÓN DE IMAGEN A ENVIAR */}
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
                      if (imageInputRef.current)
                        imageInputRef.current.value = "";
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
