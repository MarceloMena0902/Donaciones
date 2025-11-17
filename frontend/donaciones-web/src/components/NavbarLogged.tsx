import { Bell, LogOut, Menu, Send, User, MapPin, ListChecks } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";


type Notificacion = {
  message: string;
  date: string;
  read: boolean;
};


const NavbarLogged = () => {

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState<Notificacion[]>([
    { message: "Alguien está interesado en tu donación.", date: "Hace 2 horas", read: false },
    { message: "Tu donación está próxima a caducar.", date: "Hace 5 horas", read: false },
    { message: "Tu donación fue reservada por un receptor.", date: "Ayer", read: false },
  ]);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        if (notifOpen) {
          setNotifications(prev => prev.filter(n => !n.read));
        }
        setNotifOpen(false);
      }

      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen, menuOpen]);

  const toggleNotifications = () => {
    if (!notifOpen) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
    setNotifOpen(!notifOpen);
  };

  return (
    <nav className="w-full bg-white shadow-md border-b border-[#e5dacb] px-8 py-4 flex items-center justify-between sticky top-0 z-50">

      {/* LOGO */}
      <Link to="/dashboard" className="text-2xl font-extrabold text-[#121212]">
        <span className="text-[#826c43]">cuba_</span>project
      </Link>

      <div className="flex items-center gap-6">

        {/* 🔔 NOTIFICACIONES */}
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
                    <div key={i} className="p-3 rounded-xl border border-[#e5dacb] bg-[#f8f4ed] shadow-sm">
                      <p className="text-[#4a4a4a] font-medium text-sm">{n.message}</p>
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
  onClick={() => user && navigate(`/chat/${user.uid}?name=Yo`)}
  className="hover:scale-110 transition"
>
  <Send className="text-[#826c43]" size={24} />
</button>



        {/* ☰ MENÚ HAMBURGUESA */}
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

              {/* Logout abajo completamente */}
              <div className="border-t border-[#e8dccb] mt-3 pt-3">
                <button
  onClick={logout}
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
  );
};

export default NavbarLogged;
