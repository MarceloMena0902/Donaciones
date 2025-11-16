import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  File as FileIcon,
  MessageSquare,
  X,
} from "lucide-react";
import { useParams } from "react-router-dom";
import NavbarLogged from "../components/NavbarLogged";

const ChatWindow = () => {
const { id } = useParams();

// limpiar ID si viene con query (999?name=Jesus)
const rawId = id?.split("?")[0];
  const query = new URLSearchParams(window.location.search);
  const donorName = query.get("name"); // nombre opcional
const chatID = Number(rawId);

  // -------------------------------
  // LISTA DE CHATS (mock INICIAL)
  // -------------------------------
  const [chats, setChats] = useState([
    { id: 1, name: "Jesús Espejo", lastMsg: "Gracias por escribir", unread: 2 },
    { id: 2, name: "María Lopez", lastMsg: "Perfecto, te aviso", unread: 0 },
    { id: 3, name: "Carlos Méndez", lastMsg: "¿Cuándo puedes pasar?", unread: 5 },
  ]);

  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  // -------------------------------------------
  // 🔥 ABRIR O CREAR CHAT AUTOMÁTICAMENTE
  // -------------------------------------------
useEffect(() => {
  if (!rawId) return;

  const existing = chats.find((c) => c.id === chatID);

  if (existing) {
    setSelectedChat(chatID);
  } else {
    const newChat = {
      id: chatID,
      name: donorName || `Contacto ${chatID}`,
      lastMsg: "Aún no hay mensajes",
      unread: 0,
    };

    setChats((prev) => [...prev, newChat]);
    setSelectedChat(chatID);
  }
}, [rawId, donorName, chats.length]);



  // -------------------------------
  // MENSAJES
  // -------------------------------
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      chatId: 1,
      sender: "donor",
      type: "text",
      content: "Hola, ¿en qué puedo ayudarte?",
      time: "09:45 AM",
    },
  ]);

  const [text, setText] = useState("");
  const [preview, setPreview] = useState<any | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // -------------------------------
  // Adjuntar archivo
  // -------------------------------
  const handleFile = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    let type = "file";
    let previewUrl = null;

    if (file.type.startsWith("image/")) {
      type = "image";
      previewUrl = URL.createObjectURL(file);
    } else if (file.type.startsWith("video/")) {
      type = "video";
      previewUrl = URL.createObjectURL(file);
    }

    setPreview({
      raw: file,
      type,
      preview: previewUrl,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
    });
  };

  // -------------------------------
  // Enviar mensaje
  // -------------------------------
  const sendMessage = () => {
    if (!text && !preview) return;

    const newMsg = {
      id: Date.now(),
      chatId: selectedChat,
      sender: "me",
      type: preview?.type || "text",
      content: preview?.preview || text,
      name: preview?.name,
      size: preview?.size,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setText("");
    setPreview(null);
  };

  return (
    <div className="min-h-screen bg-[#f5efe7]">
      <NavbarLogged />

      <div className="pt-24 pb-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* PANEL IZQUIERDO */}
        <div className="col-span-1 bg-white rounded-3xl shadow-xl border border-[#e4d7c5] p-5 h-[75vh] flex flex-col">
          <h2 className="text-xl font-bold text-[#121212] mb-4 flex items-center gap-2">
            <MessageSquare /> Tus Chats
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full p-4 rounded-2xl shadow border flex justify-between items-center transition 
                  ${
                    selectedChat === chat.id
                      ? "bg-gradient-to-r from-[#826c43]/20 to-[#e66748]/20 border-[#e66748]"
                      : "bg-[#fff8f0] border-[#e4d7c5] hover:bg-[#ffeeda]"
                  }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-800">{chat.name}</p>
                  <p className="text-sm text-gray-600">{chat.lastMsg}</p>
                </div>

                {chat.unread > 0 && (
                  <span className="bg-[#e66748] text-white text-sm w-7 h-7 flex items-center justify-center rounded-full font-bold shadow">
                    {chat.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="col-span-2 bg-white rounded-3xl shadow-xl border border-[#e4d7c5] p-6 h-[75vh] flex flex-col">

          {/* PLACEHOLDER SI NO HAY CHAT */}
          {!selectedChat && (
            <div className="flex flex-col items-center justify-center h-full opacity-80">
              <h2 className="text-3xl font-bold text-[#121212] mb-2">
                cuba_project
              </h2>
              <p className="text-gray-600 text-center max-w-md leading-relaxed">
                Envía y recibe mensajes con otros donantes y receptores.
                Conecta, coordina y ayuda a que las donaciones lleguen a quienes más lo necesitan.
              </p>
            </div>
          )}

          {/* CHAT ABIERTO */}
          {selectedChat && (
            <>
              {/* HEADER */}
              <div className="pb-4 border-b border-[#e4d7c5] mb-4">
                <h2 className="text-2xl font-bold text-[#121212]">
                  {chats.find((c) => c.id === selectedChat)?.name}
                </h2>
              </div>

              {/* MENSAJES */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages
                  .filter((m) => m.chatId === selectedChat)
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "me"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[65%] p-3 rounded-2xl shadow 
                          ${
                            msg.sender === "me"
                              ? "bg-gradient-to-r from-[#826c43] to-[#e66748] text-white"
                              : "bg-[#fff8f0] text-gray-800"
                          }`}
                      >
                        {msg.type === "text" && <p>{msg.content}</p>}

                        {msg.type === "image" && (
                          <img
                            src={msg.content}
                            className="rounded-xl max-h-64"
                          />
                        )}

                        {msg.type === "video" && (
                          <video controls className="rounded-xl max-h-64">
                            <source src={msg.content} />
                          </video>
                        )}

                        {msg.type === "file" && (
                          <div className="flex items-center gap-3">
                            <FileIcon />
                            <div>
                              <p className="font-semibold">{msg.name}</p>
                              <p className="text-sm opacity-70">{msg.size}</p>
                            </div>
                          </div>
                        )}

                        <p className="text-xs opacity-60 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* PREVIEW */}
              {preview && (
                <div className="my-4 flex items-center gap-4 bg-[#fff1e0] p-3 rounded-xl border border-[#e4d7c5]">
                  {preview.type === "image" && (
                    <img src={preview.preview} className="h-20 rounded-lg" />
                  )}
                  {preview.type === "video" && (
                    <video src={preview.preview} className="h-20 rounded-lg" />
                  )}
                  {preview.type === "file" && (
                    <div className="flex items-center gap-2">
                      <FileIcon />
                      <div>
                        <p>{preview.name}</p>
                        <p className="text-sm">{preview.size}</p>
                      </div>
                    </div>
                  )}
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
                  className="p-3 rounded-xl border border-[#e4d7c5] bg-[#fff8f0] hover:bg-[#ffe6d1] transition"
                >
                  <Paperclip />
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,application/pdf,.zip,.doc,.docx"
                  onChange={handleFile}
                />

                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 px-4 py-3 border border-[#e4d7c5] rounded-xl bg-white shadow-sm outline-none"
                />

                <button
                  onClick={sendMessage}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white shadow hover:scale-[1.05] transition"
                >
                  <Send />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
