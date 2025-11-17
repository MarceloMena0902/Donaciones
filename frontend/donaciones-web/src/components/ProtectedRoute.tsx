import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { user, loading } = useAuth();

  if (loading)
    return <p className="text-center mt-10">Cargando...</p>;

  if (!user)
    return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
