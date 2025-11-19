import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 🔥 Bloqueo del botón ATRÁS cuando no hay usuario
  useEffect(() => {
    if (!user) {
      window.history.pushState(null, "", window.location.href);

      const handlePopState = () => {
        // Cada vez que alguien toca ATRÁS, lo enviamos al mapa
        window.location.replace("/mapa-donantes");
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [user]);

  // Pantalla de carga
  if (loading) {
    return <p className="text-center mt-10">Cargando...</p>;
  }

  // Si NO está logueado → redirige a login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
