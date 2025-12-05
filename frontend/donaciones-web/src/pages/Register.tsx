// --- IMPORTS ---
import { Mail, Lock, Phone, Home, User, Image } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  registerWithEmail,
  loginWithGoogle,
  loginWithFacebook,
} from "../services/authService";

import { uploadImage } from "../services/cloudinaryService";

const Register = () => {
  const navigate = useNavigate();

  // Estados
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // PREVIEW DE IMAGEN
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim().replace(/\s+/g, ""); // ELIMINA TODOS LOS ESPACIOS
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();
    const cleanPass = password.replace(/\s+/g, ""); // NO PERMITE ESPACIOS
    const cleanPass2 = confirmPassword.replace(/\s+/g, "");

    // Validaciones
    if (!cleanName || !cleanEmail || !cleanPass || !cleanPass2) {
      Swal.fire("Error", "Todos los campos obligatorios deben llenarse.", "error");
      return;
    }

    if (cleanPass !== cleanPass2) {
      Swal.fire("Error", "Las contraseñas no coinciden.", "error");
      return;
    }

    setLoading(true);

    try {
      let photoUrl = "";
      if (photo) photoUrl = await uploadImage(photo);

      await registerWithEmail(
        cleanName,
        cleanEmail,
        cleanPass,
        cleanPhone,
        cleanAddress,
        photoUrl
      );

      Swal.fire({
        title: "Cuenta creada 🎉",
        text: "Tu registro fue exitoso",
        icon: "success",
        confirmButtonColor: "#826c43",
      }).then(() => navigate("/login"));
    } catch (error) {
      console.error("❌ Error en registro:", error);
      Swal.fire("Error", "No se pudo completar el registro", "error");
    } finally {
      setLoading(false);
    }
  };

  // LOGIN SOCIAL
  const handleSocial = async (provider: "Google" | "Facebook") => {
    setLoading(true);

    try {
      if (provider === "Google") await loginWithGoogle();
      else await loginWithFacebook();

      Swal.fire({
        title: "Cuenta creada 🎉",
        text: `Registro exitoso con ${provider}`,
        icon: "success",
      }).then(() => navigate("/dashboard"));
    } catch (err) {
      Swal.fire("Error", `No se pudo registrar con ${provider}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-6 py-16 bg-gradient-to-br from-[#f5efe7] to-[#efe7dc]">

      <div className="relative w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-10 animate-fadeUp">

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#826c43] to-[#e66748]" />

        <h2 className="text-3xl font-extrabold text-[#121212] text-center mb-2">
          Crear Cuenta
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Únete a la comunidad de donantes 🤝
        </p>

        {/* ==== SOCIAL LOGIN ==== */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleSocial("Google")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white border border-[#dccdbb]"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" />
            <span className="font-medium text-gray-700">Registrarse con Google</span>
          </button>

          <button
            onClick={() => handleSocial("Facebook")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#1877f2] text-white"
          >
            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-6 h-6" />
            <span className="font-medium">Registrarse con Facebook</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-[#d6c7b7] flex-1" />
          <p className="text-gray-500 text-sm">O llena tus datos</p>
          <div className="h-px bg-[#d6c7b7] flex-1" />
        </div>

        {/* ============ FORMULARIO ============ */}
        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* Nombre */}
          <Field label="Nombre Completo" icon={<User size={20} className="text-[#826c43]" />}>
            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value.replace(/^\s+/, "")) // NO permitir espacio inicial
              }
              placeholder="Tu nombre completo"
              className="input"
              required
            />
          </Field>

          {/* Correo */}
          <Field label="Correo Electrónico" icon={<Mail size={20} className="text-[#826c43]" />}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                // 1️⃣ ELIMINA TODOS LOS ESPACIOS, incluso si los pega
                const cleaned = e.target.value.replace(/\s+/g, "");

                setEmail(cleaned);
              }}
              onKeyDown={(e) => {
                // 2️⃣ BLOQUEA el espacio desde el teclado
                if (e.key === " ") e.preventDefault();
              }}
              onPaste={(e) => {
                // 3️⃣ BLOQUEA pegar si contiene espacios
                const text = e.clipboardData.getData("text");
                if (/\s/.test(text)) e.preventDefault();
              }}
              placeholder="correo@ejemplo.com"
              className="input"
              required
            />

          </Field>

          {/* Contraseña */}
          <Field label="Contraseña" icon={<Lock size={20} className="text-[#826c43]" />}>
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value.replace(/\s+/g, "")) // NO espacios permitidos
              }
              placeholder="••••••••"
              className="input"
              required
            />
          </Field>

          {/* Confirmar Contraseña */}
          <Field label="Confirmar Contraseña" icon={<Lock size={20} className="text-[#826c43]" />}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value.replace(/\s+/g, "")) // NO espacios permitidos
              }
              placeholder="Repite tu contraseña"
              className="input"
              required
            />
          </Field>

          {/* Teléfono */}
          <Field label="Teléfono" icon={<Phone size={20} className="text-[#826c43]" />}>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} // solo números
              placeholder="Ej: 76452345"
              className="input"
            />
          </Field>

          {/* Dirección */}
          <Field label="Dirección" icon={<Home size={20} className="text-[#826c43]" />}>
            <input
              type="text"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value.replace(/^\s+/, "")) // No espacio al inicio
              }
              placeholder="Tu dirección"
              className="input"
            />
          </Field>

          {/* FOTO */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Foto de Perfil
            </label>

            <div className="flex items-center gap-3 bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm">
              <Image size={20} className="text-[#826c43]" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="cursor-pointer"
              />
            </div>

            {preview && (
              <div className="mt-3 flex justify-center">
                <img
                  src={preview}
                  className="w-28 h-28 rounded-full object-cover shadow-md border border-[#dccdbb]"
                />
              </div>
            )}
          </div>

          {/* BOTÓN REGISTRAR */}
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>

          <p className="text-center mt-4 text-gray-600 text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-[#e66748] font-semibold hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;

// COMPONENTE FIELD
const Field = ({ label, icon, children }: any) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <div className="flex items-center gap-3 bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm focus-within:border-[#e66748] transition-all">
      {icon}
      {children}
    </div>
  </div>
);
