import {
  Bell,
  LogOut,
  Menu,
  Send,
  User,
  MapPin,
  ListChecks,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  doc,
  setDoc,
} from "firebase/firestore";
import { firestoreDb } from "../firebaseConfig";
import axios from "axios";

type Notificacion = {
  id: string;
  message: string;
  preview?: string;
  requesterId?: string;
  donationId?: string;
  type?: string;
  date: string;
  read: boolean;
  chatCreated?: boolean;
  chatDocId?: string;
};

const NavbarLogged = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  // 🔥 RETORNO SEGURO – NUNCA BREAK DE HOOKS
  if (loading || !user || !user.uid) {
    return (
      <nav className="w-full bg-white shadow-md border-b border-[#e5dacb] px-8 py-4">
        <span className="text-[#826c43] font-semibold">Cargando...</span>
      </nav>
    );
  }

  // =====================
  //  🔥 HOOKS CORRECTOS
  // =====================

  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [requesterName, setRequesterName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [showSolicitudModal, setShowSolicitudModal] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const [activeRequest, setActiveRequest] = useState<Notificacion | null>(null);
  const [donorResponse, setDonorResponse] = useState("");

  const [hasUnreadChats, setHasUnreadChats] = useState(false);

  // =====================
  // NORMALIZAR FECHAS
  // =====================
  const normalizeDate = (createdAt: any) => {
    try {
      if (!createdAt) return "";

      const date = createdAt._seconds
        ? new Date(createdAt._seconds * 1000)
        : new Date(createdAt);

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

  const removeDuplicateNotifications = (arr: any[]) => {
    if (!Array.isArray(arr)) return [];
    return Array.from(new Map(arr.map((n) => [`${n.message}-${n.date}`, n])).values());
  };

  // =====================
  // 🔥 FETCH NOTIFICACIONES
  // =====================
  useEffect(() => {
    if (!user?.uid) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/notifications/${user.uid}`
        );

        if (!Array.isArray(res.data)) {
          setNotifications([]);
          return;
        }

        const parsed = res.data.map((n: any) => ({
          id: n.id,
          message: n.content,
          preview: n.preview,
          requesterId: n.requesterId,
          donationId: n.donationId,
          type: n.type,
          date: normalizeDate(n.createdAt),
          read: n.read || false,
          chatDocId: n.chatId || undefined,
          chatCreated: !!n.chatId,
        }));

        setNotifications(removeDuplicateNotifications(parsed));
      } catch (error) {
        console.log("❌ Error cargando notificaciones:", error);
        setNotifications([]); // evita romper render
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 2000);
    return () => clearInterval(interval);
  }, [user?.uid]);

  // =====================
  // CONTADOR SEGURO
  // =====================
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  // =====================
  // CLICK AFUERA
  // =====================
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

  // =====================
  // MARCAR LEÍDA
  // =====================
  const markNotificationAsRead = async (id: string) => {
    try {
      await axios.put(`http://localhost:4000/api/notifications/${id}/read`);
    } catch (err) {
      console.log("Error marcando como leído:", err);
    }
  };

  // =====================
  // ACEPTAR SOLICITUD
  // =====================
  const aceptarSolicitud = async () => {
    if (!activeRequest || !user) return;
    if (!donorResponse.trim()) return;

    await markNotificationAsRead(activeRequest.id);

    const requesterId = activeRequest.requesterId!;
    const donorId = user.uid;
    const donationId = activeRequest.donationId!;

    const chatId = `${donationId}_${requesterId}_${donorId}`;
    const chatRef = doc(firestoreDb, "chats", chatId);

    const existing = await getDocs(
      query(collection(firestoreDb, "chats"), where("chatId", "==", chatId))
    );

    if (existing.empty) {
      await setDoc(chatRef, {
        chatId,
        donationId,
        participants: [donorId, requesterId],
        names: {
          requester: requesterName || "Usuario",
          donor: user.displayName || "Donante",
        },
        createdAt: serverTimestamp(),
        unreadFor: [requesterId],
      });

      await addDoc(collection(firestoreDb, "chats", chatId, "messages"), {
        senderId: requesterId,
        content: activeRequest.preview || activeRequest.message,
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(firestoreDb, "chats", chatId, "messages"), {
        senderId: donorId,
        content: donorResponse.trim(),
        timestamp: serverTimestamp(),
      });
    }

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === activeRequest.id ? { ...n, chatCreated: true, chatDocId: chatId } : n
      )
    );

    setActiveRequest((prev) =>
      prev ? { ...prev, chatCreated: true, chatDocId: chatId } : prev
    );

    setShowSolicitudModal(false);
    setDonorResponse("");

    navigate(`/chat/${chatId}`);
  };

  // =====================
  // RECHAZAR SOLICITUD
  // =====================
  const rechazarSolicitud = async () => {
    if (!activeRequest) return;
    await markNotificationAsRead(activeRequest.id);
    setShowSolicitudModal(false);
    setDonorResponse("");
  };

  const toggleNotifications = () => {
    if (!notifOpen) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
    setNotifOpen(!notifOpen);
  };

  const handleChatsClick = () => navigate("/chats");

  // =====================
  // CHATS NO LEÍDOS
  // =====================
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(firestoreDb, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      let unread = false;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.unreadFor?.includes(user.uid)) unread = true;
      });

      setHasUnreadChats(unread);
    });

    return () => unsub();
  }, [user?.uid]);

  // =====================
  // UI FINAL
  // =====================
  return (
    <>
      <nav className="w-full bg-white shadow-md border-b border-[#e5dacb] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/dashboard" className="text-2xl font-extrabold text-[#121212]">
          <span className="text-[#826c43]">Cochabamba</span> Comparte
        </Link>

        <div className="flex items-center gap-6">
          {/* NOTIFICACIONES */}
          <div className="relative" ref={notifRef}>
            <button onClick={toggleNotifications} className="relative hover:scale-110 transition">
              <Bell className="text-[#826c43]" size={24} />
              {unreadCount > 0 && !notifOpen && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-[#e5dacb] p-4 animate-fadeIn">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Notificaciones</h4>

                <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm">No hay nuevas notificaciones.</p>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setActiveRequest(n);
                          setPreviewMessage(n.preview || n.message);
                          setShowSolicitudModal(true);
                        }}
                        className="p-3 rounded-xl border border-[#e5dacb] bg-[#f8f4ed] shadow-sm cursor-pointer hover:bg-[#efe9e0] transition"
                      >
                        <p className="text-[#4a4a4a] font-medium text-sm">{n.message}</p>
                        <p className="text-xs text-gray-500">{n.date}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CHATS */}
          <div className="relative">
            <button onClick={handleChatsClick} className="hover:scale-110 transition">
              <Send
                className={hasUnreadChats ? "text-[#e66748]" : "text-[#826c43]"}
                size={24}
              />
              {hasUnreadChats && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow">
                  !
                </span>
              )}
            </button>
          </div>

          {/* MENÚ */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="hover:scale-110 transition">
              <Menu className="text-[#826c43]" size={28} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-[#e5dacb] p-4 animate-fadeIn">
                <Link
                  to="/perfil"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f5efe4] transition text-gray-700"
                >
                  <User size={20} className="text-[#826c43]" />
                  Ver Perfil
                </Link>

                <Link
                  to="/mapa-donantes"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f5efe4] transition text-gray-700"
                >
                  <MapPin size={20} className="text-[#826c43]" />
                  Mapa de Donaciones
                </Link>

                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f5efe4] transition text-gray-700"
                >
                  <ListChecks size={20} className="text-[#826c43]" />
                  Mis Donaciones
                </Link>

                <div className="border-t border-[#e8dccb] mt-3 pt-3">
                  <button
                    onClick={() => {
                      logout();
                      navigate("/mapa-donantes", { replace: true });
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition font-semibold"
                  >
                    <LogOut size={20} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MODAL */}
      {showSolicitudModal && activeRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-[#e5dacb] relative animate-slideUp">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-1 rounded-full bg-gradient-to-r from-[#826c43] to-[#e66748]" />

            <div className="w-16 h-16 mx-auto mb-4 bg-[#f2e9db] rounded-full flex items-center justify-center shadow-lg">
              <Send size={32} className="text-[#826c43]" />
            </div>

            <h2 className="text-2xl font-bold text-[#121212] mb-2">Nueva solicitud 💬</h2>
            <p className="text-gray-700 mb-4">Un usuario quiere contactar contigo sobre tu donación.</p>

            <div className="bg-[#f8f4ed] p-4 rounded-xl shadow-md border border-[#e5dacb] mb-6">
              <p className="text-[#4a4a4a] text-sm">
                <strong>Mensaje recibido:</strong>
              </p>
              <p className="mt-1 text-[#40352a] font-medium">“{previewMessage}”</p>
            </div>

            {activeRequest.chatCreated && activeRequest.chatDocId ? (
              <button
                onClick={() => navigate(`/chat/${activeRequest.chatDocId}`)}
                className="w-full py-3 bg-gradient-to-r from-[#826c43] to-[#e66748] text-white rounded-xl shadow hover:scale-105 transition font-semibold"
              >
                Ir al chat
              </button>
            ) : (
              <>
                <textarea
                  value={donorResponse}
                  onChange={(e) => setDonorResponse(e.target.value)}
                  className="w-full border border-[#e5dacb] rounded-xl px-3 py-2 mb-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#e66748]"
                  rows={3}
                  placeholder="Escribe aquí tu mensaje..."
                />

                <div className="flex gap-4">
                  <button
                    onClick={aceptarSolicitud}
                    disabled={!donorResponse.trim()}
                    className={`w-full py-3 rounded-xl shadow font-semibold transition ${
                      donorResponse.trim()
                        ? "bg-gradient-to-r from-[#826c43] to-[#e66748] text-white hover:scale-105"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Aceptar
                  </button>

                  <button
                    onClick={rechazarSolicitud}
                    className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                  >
                    Rechazar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarLogged;
