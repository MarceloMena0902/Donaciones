import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import {
  onAuthStateChanged,
  signOut,
  type User
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Mantener sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 🔥 Logout real + bloqueo de botón atrás
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("token");

    // BORRAR HISTORIAL para que el botón ATRÁS no regrese
    navigate("/mapa-donantes", { replace: true });

    // Forzar a borrar cache de historial
    window.history.pushState(null, "", window.location.href);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");

  return context;
};
