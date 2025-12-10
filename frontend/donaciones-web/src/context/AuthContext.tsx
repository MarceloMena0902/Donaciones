import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import {
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserSessionPersistence,
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

  // 🔥 Canal para sincronizar sesión entre pestañas
  const channel = new BroadcastChannel("auth-sync");

  useEffect(() => {
    // persistencia SOLO para la sesión de ESTA ventana
    setPersistence(auth, browserSessionPersistence).catch(console.error);
  }, []);

  // 🔥 Firebase detecta cambios de sesión
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);

      // Cuando una pestaña se loguea, notifica al resto
      if (firebaseUser) channel.postMessage({ type: "LOGIN_SYNC" });
    });

    return unsub;
  }, []);

  // 🔥 Escuchar señales de otras pestañas
  useEffect(() => {
    channel.onmessage = (event) => {
      if (event.data.type === "LOGIN_SYNC") {
        // Forzar a que Firebase sincronice sesión desde otra pestaña
        setUser(auth.currentUser);
      }

      if (event.data.type === "LOGOUT_SYNC") {
        setUser(null);
        navigate("/mapa-donantes", { replace: true });
      }
    };
  }, []);

  // 🔥 Logout completo
  const logout = async () => {
    await signOut(auth);
    setUser(null);

    // Notificar a todas las pestañas
    channel.postMessage({ type: "LOGOUT_SYNC" });

    navigate("/mapa-donantes", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
