// src/pages/ChatWindow.tsx

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import {
  useSearchParams,
  useNavigate,
  useParams
} from "react-router-dom";
import NavbarLogged from "../components/NavbarLogged";
import { useAuth } from "../context/AuthContext";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import { firestoreDb } from "../firebaseConfig";

const ChatWindow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();

  // chatId desde :chatId o desde ?chat=...
  const chatId =
    (params.chatId as string | undefined) ||
    (searchParams.get("chat") as string | null) ||
    "";

  const otherName = searchParams.get("name") || "Usuario";

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  // autoscroll ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // cargar mensajes de Firestore en tiempo real
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(firestoreDb, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(arr);
    });

    return unsub;
  }, [chatId]);

  // autoscroll cuando llegan mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // enviar mensaje
  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    await addDoc(collection(firestoreDb, "chats", chatId, "messages"), {
      senderId: user.uid,
      content: text.trim(),
      timestamp: serverTimestamp(),
    });

    setText("");
  };

  // enviar con ENTER
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5efe7]">
      <NavbarLogged />

      <div className="pt-24 pb-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* PANEL IZQUIERDO */}
        <div className="col-span-1 bg-white rounded-3xl shadow-xl border p-5 h-[75vh] overflow-y-auto">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare /> Chats
          </h2>

          {/* Un solo chat visible */}
          <div className="mt-4 space-y-3">
            <div className="w-full text-left p-3 rounded-xl border shadow-sm bg-[#ffe5c8]">
              <p className="font-semibold">{otherName}</p>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="col-span-2 bg-white rounded-3xl shadow-xl border p-6 h-[75vh] flex flex-col">

          <h2 className="text-xl font-bold mb-3">
            Conversación con {otherName}
          </h2>

          {/* MENSAJES */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isMine = m.senderId === user?.uid;

              return (
                <div
                  key={m.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl shadow ${
                      isMine
                        ? "bg-gradient-to-r from-[#826c43] to-[#e66748] text-white"
                        : "bg-[#fff8f0] text-gray-800"
                    }`}
                  >
                    <p>{m.content}</p>

                    <p className="text-xs opacity-70 mt-1">
                      {m.timestamp?.toDate
                        ? m.timestamp.toDate().toLocaleTimeString("es-BO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* marcador para AUTOSCROLL */}
            <div ref={messagesEndRef}></div>
          </div>

          {/* INPUT */}
          <div className="mt-4 flex items-center gap-3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
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
