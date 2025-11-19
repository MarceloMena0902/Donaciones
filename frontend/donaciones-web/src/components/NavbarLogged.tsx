import { Bell, LogOut, Menu, Send, User, MapPin, ListChecks } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { firestoreDb } from "../firebaseConfig";
import axios from "axios";
import Swal from "sweetalert2";


type Notificacion = {
  id: string;
  message: string;        // contenido visible
  preview?: string;       // mensaje REAL del usuario
  requesterId?: string;
  donationId?: string;
  type?: string;
  date: string;
  read: boolean;
};


const NavbarLogged = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [requesterName, setRequesterName] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ⭐ Nuevo modal para solicitud
  const [showSolicitudModal, setShowSolicitudModal] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const [activeRequest, setActiveRequest] = useState<any | null>(null);

   const normalizeDate = (createdAt: any) => {
  try {
    if (!createdAt) return "";

    let date;

    if (createdAt._seconds) {
      date = new Date(createdAt._seconds * 1000);
    } else {
      date = new Date(createdAt);
    }

    // Convertir a hora Boliviana
    return date.toLocaleString("es-BO", {
      timeZone: "America/La_Paz",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  } catch {
    return "";
  }
};

    const removeDuplicateNotifications = (array: any[]) => {
    return Array.from(
      new Map(array.map(n => [`${n.message}-${n.date}`, n])).values()
    );
  };

useEffect(() => {
  if (!user?.uid) return;
   
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/notifications/${user.uid}`);

      const parsed: Notificacion[] = res.data.map((n: any) => ({
        id: n.id,
        message: n.content,        // el título visible
        preview: n.preview,        // el mensaje REAL
        requesterId: n.requesterId,
        donationId: n.donationId,
        type: n.type,
        date: normalizeDate(n.createdAt),
        read: n.read || false,
      }));



      const filtered = removeDuplicateNotifications(parsed);
      setNotifications(filtered);
    } catch (error) {
      console.log("Error cargando notificaciones:", error);
    }
  };

  fetchNotifications();
  const interval = setInterval(fetchNotifications, 2000);

  return () => clearInterval(interval);
}, [user]);


  const unreadCount = notifications.filter((n) => !n.read).length;

  // ======================
  // Cerrar dropdowns al hacer click fuera
  // ======================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const markNotificationAsRead = async (notifId: string) => {
  try {
    await axios.put(`http://localhost:4000/api/notifications/${notifId}/read`);
  } catch (err) {
    console.log("Error marcando notificación como leída:", err);
  }
};
const aceptarSolicitud = async () => {
  if (!activeRequest || !user) return;

  await markNotificationAsRead(activeRequest.id);
  setShowSolicitudModal(false);

  const requesterId = activeRequest.requesterId;   // quien escribió
  const donorId = user.uid;                        // el dueño de la donación
  const requesterNameValue = requesterName;           // ya lo tienes
  const donorName = user.displayName || "Usuario";

  // 1️⃣ Buscar si ya existe un chat entre los dos
  const q = query(
    collection(firestoreDb, "chats"),
    where("participants", "array-contains", donorId)
  );

  const existing = await getDocs(q);

  let chatId = null;

  existing.forEach(docSnap => {
    const chat = docSnap.data();
    if (chat.participants.includes(requesterId)) {
      chatId = docSnap.id;
    }
  });

  // 2️⃣ Si no existe, crear el chat
  if (!chatId) {
    const newChat = await addDoc(collection(firestoreDb, "chats"), {
      participants: [donorId, requesterId],
      names: {
        [donorId]: donorName,
        [requesterId]: requesterName
      },
      createdAt: serverTimestamp()
    });
    chatId = newChat.id;
  }

  // 3️⃣ Redirigir al chat REAL
  navigate(`/chats`);
};

const rechazarSolicitud = async () => {
  if (!activeRequest) return;

  await markNotificationAsRead(activeRequest.id);
  setShowSolicitudModal(false);
};


  const toggleNotifications = () => {
    if (!notifOpen) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
    setNotifOpen(!notifOpen);
  };

  // ======================
  // Al hacer clic en una notificación
  // ======================
  const handleNotificationClick = async (notif: Notificacion) => {
    setActiveRequest(notif);
    setPreviewMessage(notif.preview || notif.message);
  // Traer nombre del usuario que envió la solicitud
    if (notif.requesterId) {
      try {
        const res = await axios.get(`http://localhost:4000/api/users/${notif.requesterId}`);
        setRequesterName(res.data.name || "Usuario");
      } catch {
        setRequesterName("Usuario");
      }
    } else {
      setRequesterName("Usuario");
    }

    setShowSolicitudModal(true);
};


  return (
    <>
      {/* ==========================
          NAVBAR
      ========================== */}
      <nav className="w-full bg-white shadow-md border-b border-[#e5dacb] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        {/* LOGO */}
        <Link to="/dashboard" className="text-2xl font-extrabold text-[#121212]">
          <span className="text-[#826c43]">Cochabamba</span> Comparte
        </Link>

        <div className="flex items-center gap-6">

          {/* 🔔 NOTIFICACIONES */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={toggleNotifications}
              className="relative hover:scale-110 transition"
            >
              <Bell className="text-[#826c43]" size={24} />

              {unreadCount > 0 && !notifOpen && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-[#e5dacb] p-4 animate-fadeIn">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Notificaciones
                </h4>

                <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm">
                      No hay nuevas notificaciones.
                    </p>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={i}
                        onClick={() => handleNotificationClick(n)}
                        className="p-3 rounded-xl border border-[#e5dacb] bg-[#f8f4ed] shadow-sm cursor-pointer hover:bg-[#efe9e0] transition"
                      >
                        <p className="text-[#4a4a4a] font-medium text-sm">
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-500">{n.date}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ✈️ MENSAJES */}
          <button
            onClick={() => navigate("/chats")}
            className="hover:scale-110 transition"
          >
            <Send className="text-[#826c43]" size={24} />
          </button>

          {/* ☰ MENÚ */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hover:scale-110 transition"
            >
              <Menu className="text-[#826c43]" size={28} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-[#e5dacb] p-4 animate-fadeIn">
                <Link
                  to="/perfil"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f5efe4] transition text-gray-700"
                >
                  <User size={20} className="text-[#826c43]" /> Ver Perfil
                </Link>

                <Link
                  to="/mapa-donantes"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f5efe4] transition text-gray-700"
                >
                  <MapPin size={20} className="text-[#826c43]" /> Mapa de Donaciones
                </Link>

                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f5efe4] transition text-gray-700"
                >
                  <ListChecks size={20} className="text-[#826c43]" /> Mis Donaciones
                </Link>

                <div className="border-t border-[#e8dccb] mt-3 pt-3">
                  <button
                    onClick={() => {
                      logout();
                      navigate("/mapa-donantes", { replace: true });
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition font-semibold"
                  >
                    <LogOut size={20} /> Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ==========================
    MODAL DE SOLICITUD
========================== */}
{showSolicitudModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-[#e5dacb] relative animate-slideUp">

      {/* Línea curva */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-1 rounded-full bg-gradient-to-r from-[#826c43] to-[#e66748]" />

      {/* Icono */}
      <div className="w-16 h-16 mx-auto mb-4 bg-[#f2e9db] rounded-full flex items-center justify-center shadow-lg">
        <Send size={32} className="text-[#826c43]" />
      </div>

      <h2 className="text-2xl font-bold text-[#121212] mb-2">
        Nueva solicitud 💬
      </h2>

      <p className="text-gray-700 mb-4">
        Un usuario quiere contactar contigo sobre tu donación.
      </p>

      {/* ⭐ BURBUJA DEL MENSAJE */}
      <div className="bg-[#f8f4ed] p-4 rounded-xl shadow-md border border-[#e5dacb] mb-6">
        <p className="text-[#4a4a4a] text-sm leading-relaxed">
          <strong>Mensaje recibido de {requesterName}:</strong> 
        </p>
        <p className="mt-1 text-[#40352a] font-medium">
          “{previewMessage}”
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          onClick={aceptarSolicitud}
          className="w-full py-3 bg-gradient-to-r from-[#826c43] to-[#e66748] 
          text-white rounded-xl shadow hover:scale-105 transition font-semibold"
        >
          Aceptar
        </button>

        <button
          onClick={rechazarSolicitud}
          className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl 
          hover:bg-gray-300 transition font-semibold"
        >
          Rechazar
        </button>
      </div>

    </div>
  </div>
)}

    </>
  );
};

export default NavbarLogged;
