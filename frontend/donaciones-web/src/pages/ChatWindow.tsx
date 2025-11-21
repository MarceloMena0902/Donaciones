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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // -------------------------------------------------------------
  // Obtener IDs
  // -------------------------------------------------------------
  const [donationId, requesterId, donorId] = chatId.split("_");
  const otherId = user?.uid === requesterId ? donorId : requesterId;

  // -------------------------------------------------------------
  // Función para saber si un mensaje pertenece al chat actual
  // -------------------------------------------------------------
  const isMessageFromCurrentChat = (senderId: string) => {
    const currentlyInChat = location.pathname === `/chat/${chatId}`;
    const isSenderOtherPerson = senderId === otherId;

    return currentlyInChat && isSenderOtherPerson;
  };

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
  // Load mensajes + marcar leídos si corresponde
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
  const isInChat = location.pathname === `/chat/${chatId}`;

  if (lastMsg.senderId !== user.uid) {

    if (isInChat) {
      // ❌ No notificar, estoy en su chat
      await updateDoc(chatRef, {
        unreadFor: arrayRemove(user.uid),
      });

    } else {
      // 🔥 Notificar normalmente
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
  // Enviar mensaje
  // -------------------------------------------------------------
  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    const chatRef = doc(firestoreDb, "chats", chatId);

    // Crear mensaje
    await addDoc(collection(firestoreDb, "chats", chatId, "messages"), {
      senderId: user.uid,
      content: text.trim(),
      timestamp: serverTimestamp(),
    });

    // // ✔ Si NO estoy dentro del chat → marcar unread
    // const isInChatNow = location.pathname === `/chat/${chatId}`;

    // if (!isInChatNow) {
    //  await updateDoc(chatRef, {
    //      unreadFor: arrayUnion(otherId),
    //    });
    //  }
    // await updateDoc(chatRef, { lastActivity: serverTimestamp() });
await updateDoc(chatRef, {
      lastActivity: serverTimestamp(),
      unreadFor: arrayUnion(otherId), // <- vuelve a poner al OTRO como no leído
    });
    setText("");
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
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
                <p><strong>Descripción:</strong> {donation.description}</p>
                <p><strong>Cantidad:</strong> {donation.quantity} {donation.unit}</p>
                <p><strong>Tipo:</strong> {donation.type}</p>
                {donation.location?.address && (
                  <p><strong>Ubicación:</strong> {donation.location.address}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* PANEL DERECHO */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl shadow-xl border p-6 flex flex-col h-[75vh]">

          <h2 className="text-xl font-bold mb-3">Conversación con {otherName}</h2>

          {/* MENSAJES */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4">
            {messages.map((m) => {
              const isMine = m.senderId === user?.uid;

              const date = m.timestamp?.toDate
                ? m.timestamp.toDate().toLocaleTimeString("es-BO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <div key={m.id} className="w-full">
                  <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl shadow ${
                        isMine
                          ? "bg-gradient-to-r from-[#826c43] to-[#e66748] text-white"
                          : "bg-[#fff8f0] text-gray-800"
                      }`}
                    >
                      <p>{m.content}</p>
                      <p className="text-xs opacity-60 mt-1">{date}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef}></div>
          </div>

          {/* INPUT */}
          <div className="mt-4 flex items-center gap-3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje…"
              className="flex-1 px-4 py-3 border rounded-xl shadow-sm"
            />

            <button
              onClick={sendMessage}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white shadow"
            >
              <Send />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
