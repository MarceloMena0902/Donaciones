import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  File as FileIcon,
  MessageSquare,
  X,
} from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import NavbarLogged from "../components/NavbarLogged";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// Firebase Realtime Database
import { realtimeDb } from "../firebaseConfig";
import { ref, onValue, push, set } from "firebase/database";

const API_URL = "http://localhost:4000/api/messages";

const ChatWindow = () => {
  const { user } = useAuth(); // usuario logueado

  // Este ID viene de DonationView: userId del donante
  const { id: otherUserId } = useParams();
  const [searchParams] = useSearchParams();
  const donorName = searchParams.get("name");
console.log("🟥 DEBUG ChatWindow ----------------");
console.log("user.uid =", user?.uid);
console.log("otherUserId =", otherUserId);
console.log("donorName =", donorName);
console.log("----------------------------------");
  // ---------------------------------------------------------
  // CHAT ID entre ambos UIDs
  // ---------------------------------------------------------
  const chatId =
    user && otherUserId ? [user.uid, otherUserId].sort().join("_") : null;

  // ---------------------------------------------------------
  // ESTADOS
  // ---------------------------------------------------------
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<any | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------
  // 1) CARGAR HISTORIAL DESDE BACKEND
  // ---------------------------------------------------------
  const loadHistory = async () => {
    if (!chatId) return;

    try {
      const res = await axios.get(`${API_URL}/${chatId}`);
      const data = res.data || {};

      const formatted = Object.values(data).map((msg: any) => ({
        id: msg.timestamp,
        sender: msg.senderId === user?.uid ? "me" : "them",
        type: "text",
        content: msg.content,
        time: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(formatted);
    } catch (err) {
      console.log("❌ Error cargando historial:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [chatId]);

  // ---------------------------------------------------------
  // 2) ESCUCHAR MENSAJES EN TIEMPO REAL
  // ---------------------------------------------------------
  useEffect(() => {
    if (!chatId) return;

    const chatRef = ref(realtimeDb, `chats/${chatId}`);

    return onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const formatted = Object.values(data).map((msg: any) => ({
        id: msg.timestamp,
        sender: msg.senderId === user?.uid ? "me" : "them",
        type: "text",
        content: msg.content,
        time: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(formatted);
    });
  }, [chatId]);

  // ---------------------------------------------------------
  // 3) Adjuntar archivo
  // ---------------------------------------------------------
  const handleFile = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview({
      raw: file,
      type: "file",
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
    });
  };

  // ---------------------------------------------------------
  // 4) ENVIAR MENSAJE
  // ---------------------------------------------------------
  const sendMessage = async () => {
    if (!chatId) {
      console.log("❌ chatId es null – no se puede enviar mensaje");
      return;
    }

    if (!text && !preview) {
      console.log("❌ mensaje vacío");
      return;
    }

    const newMessage = {
      chatId,
      senderId: user?.uid,
      receiverId: otherUserId, // usuario donante REAL
      content: preview ? preview.name : text,
      timestamp: Date.now(),
    };

    console.log("🔥 ENVIANDO MENSAJE:", newMessage);

    try {
      // Guardar en Firebase realtime
      const chatRef = ref(realtimeDb, `chats/${chatId}`);
      const newMsgRef = push(chatRef);
      await set(newMsgRef, newMessage);

      // Limpiar input
      setText("");
      setPreview(null);

      // Guardar historial en backend (opcional)
      await axios.post(API_URL, newMessage);
    } catch (err) {
      console.log("❌ Error enviando mensaje:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5efe7]">
      <NavbarLogged />

      <div className="pt-24 pb-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PANEL IZQUIERDO */}
        <div className="col-span-1 bg-white rounded-3xl shadow-xl border p-5 h-[75vh] flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare /> Chat con
          </h2>

          <div className="mt-2 bg-[#fff5e5] p-3 rounded-xl text-lg font-semibold text-[#826c43]">
            {donorName}
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="col-span-2 bg-white rounded-3xl shadow-xl border p-6 h-[75vh] flex flex-col">

          {/* MENSAJES */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[65%] p-3 rounded-2xl shadow ${
                    msg.sender === "me"
                      ? "bg-gradient-to-r from-[#826c43] to-[#e66748] text-white"
                      : "bg-[#fff8f0] text-gray-800"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* PREVIEW */}
          {preview && (
            <div className="my-4 flex items-center gap-4 bg-[#fff1e0] p-3 rounded-xl border">
              <div className="flex items-center gap-2">
                <FileIcon />
                <div>
                  <p>{preview.name}</p>
                  <p className="text-sm">{preview.size}</p>
                </div>
              </div>

              <button
                onClick={() => setPreview(null)}
                className="text-red-600 hover:scale-125 transition"
              >
                <X size={22} />
              </button>
            </div>
          )}

          {/* INPUT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="p-3 rounded-xl border bg-[#fff8f0] hover:bg-[#ffe6d1] transition"
            >
              <Paperclip />
            </button>

            <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />

            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-xl shadow-sm outline-none"
            />

            <button
              onClick={sendMessage}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white shadow hover:scale-[1.05]"
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
