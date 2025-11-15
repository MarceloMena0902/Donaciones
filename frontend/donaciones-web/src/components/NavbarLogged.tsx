import { Bell, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

type Notificacion = {
  message: string;
  date: string;
};

const NavbarLogged = () => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // EJEMPLO: integrar API luego
  const [notifications, setNotifications] = useState<Notificacion[]>([]);

  return (
    <nav className="w-full bg-white shadow-md border-b border-[#e5dacb] px-8 py-4 flex items-center justify-between sticky top-0 z-50">

      {/* Logo */}
      <Link to="/dashboard" className="text-2xl font-extrabold text-[#121212]">
        <span className="text-[#826c43]">cuba_</span>project
      </Link>

      {/* Links */}
      <div className="flex items-center gap-8">

        <Link
          to="/mapa-donantes"
          className="font-medium text-gray-700 hover:text-[#826c43] transition"
        >
          MapaDonantes
        </Link>

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="relative hover:scale-110 transition"
          >
            <Bell className="text-[#826c43]" size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl rounded-xl border border-[#e5dacb] p-3 animate-fade-in">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">
                Notificaciones
              </h4>

              <div className="max-h-64 overflow-y-auto space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm">
                    No hay notificaciones.
                  </p>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#f6f1e8] text-gray-700">
                      <p className="text-sm">{n.message}</p>
                      <p className="text-xs text-gray-500">{n.date}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition font-medium">
          <LogOut size={20} /> Logout
        </button>

      </div>
    </nav>
  );
};

export default NavbarLogged;
