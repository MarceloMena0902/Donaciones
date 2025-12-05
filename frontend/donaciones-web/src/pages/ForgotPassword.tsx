import { useState } from "react";
import { Mail } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const clean = email.trim();

    if (!clean) {
      Swal.fire("Error", "Ingresa tu correo.", "error");
      return;
    }

    if (!clean.includes("@")) {
      Swal.fire("Error", "Correo inválido.", "error");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, clean);

      Swal.fire(
        "Correo enviado",
        "Te enviamos un enlace para restablecer tu contraseña.",
        "success"
      ).then(() => {
        // 🔥 REDIRIGIR AL LOGIN
        window.location.href = "/login";
      });
    } catch (error: any) {
      console.log(error);
      Swal.fire("Error", "No se pudo enviar el correo.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5efe7] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-10 border border-[#dccdbb] relative animate-fadeUp">
        
        <h2 className="text-3xl font-extrabold text-[#121212] text-center mb-4">
          Recuperar Contraseña
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>

        <label className="block text-gray-700 font-medium mb-1">
          Correo electrónico
        </label>
        <div className="flex items-center gap-3 bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm">
          <Mail size={20} className="text-[#826c43]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.replace(/\s+/g, ""))}
            className="w-full bg-transparent outline-none"
            placeholder="nombre@ejemplo.com"
          />
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white font-semibold shadow-lg hover:scale-[1.03] transition"
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
