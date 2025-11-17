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

  // 🔹 Estados controlados
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Manejo de imagen local (solo previsualización)
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  // 🔹 Registro normal (correo + contraseña)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        title: "Error",
        text: "Las contraseñas no coinciden",
        icon: "error",
        confirmButtonColor: "#e66748",
      });
      return;
    }

    setLoading(true);

    try {
      let photoUrl = "";
  if (photo) photoUrl = await uploadImage(photo);


      await registerWithEmail(name, email, password, phone, address, photoUrl);

      Swal.fire({
        title: "Cuenta creada 🎉",
        text: "Tu registro fue exitoso",
        icon: "success",
        confirmButtonColor: "#826c43",
      }).then(() => navigate("/login"));
    } catch (error) {
      console.error("❌ Error en registro:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo completar el registro",
        icon: "error",
        confirmButtonColor: "#e66748",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Registro social (Google o Facebook)
  const handleSocial = async (provider: "Google" | "Facebook") => {
    setLoading(true);
    try {
      if (provider === "Google") await loginWithGoogle();
      else await loginWithFacebook();

      Swal.fire({
        title: "Cuenta creada 🎉",
        text: `Registro exitoso con ${provider}`,
        icon: "success",
        confirmButtonColor: "#826c43",
      }).then(() => navigate("/dashboard"));
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: `No se pudo registrar con ${provider}`,
        icon: "error",
        confirmButtonColor: "#e66748",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center px-6 py-16"
      style={{
        background: "linear-gradient(135deg, #f5efe7, #efe7dc)",
      }}
    >
      <div className="relative w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_50px_rgba(0,0,0,0.18)] border border-white/60 p-10 overflow-hidden animate-fadeUp">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#826c43] to-[#e66748]" />

        <h2 className="text-3xl font-extrabold text-[#121212] text-center mb-2">
          Crear Cuenta
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Únete a la comunidad de donantes 🤝
        </p>

        {/* 🔹 Social Login */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleSocial("Google")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white border border-[#dccdbb] shadow-sm hover:scale-[1.02] transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-6 h-6"
            />
            <span className="font-medium text-gray-700">
              Registrarse con Google
            </span>
          </button>

          <button
            onClick={() => handleSocial("Facebook")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#1877f2] text-white shadow-sm hover:scale-[1.02] transition"
          >
            <img
              src="https://www.svgrepo.com/show/475647/facebook-color.svg"
              className="w-6 h-6"
            />
            <span className="font-medium">Registrarse con Facebook</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-[#d6c7b7] flex-1" />
          <p className="text-gray-500 text-sm">O llena tus datos</p>
          <div className="h-px bg-[#d6c7b7] flex-1" />
        </div>

        {/* 🔹 FORM */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Field label="Nombre Completo" icon={<User size={20} className="text-[#826c43]" />}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
              className="input"
              required
            />
          </Field>

          <Field label="Correo Electrónico" icon={<Mail size={20} className="text-[#826c43]" />}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="input"
              required
            />
          </Field>

          <Field label="Contraseña" icon={<Lock size={20} className="text-[#826c43]" />}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
              required
            />
          </Field>

          <Field label="Confirmar Contraseña" icon={<Lock size={20} className="text-[#826c43]" />}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="input"
              required
            />
          </Field>

          <Field label="Teléfono" icon={<Phone size={20} className="text-[#826c43]" />}>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 76452345"
              className="input"
            />
          </Field>

          <Field label="Dirección" icon={<Home size={20} className="text-[#826c43]" />}>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Tu dirección"
              className="input"
            />
          </Field>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Foto de Perfil
            </label>
            <div className="flex items-center gap-3 bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm transition">
              <Image size={20} className="text-[#826c43]" />
              <input
  id="photoInput"
  name="file"
  type="file"
  accept="image/*"
  onChange={handleImage}
  className="block cursor-pointer"
/>
            </div>

            {preview && (
              <div className="mt-3 flex justify-center">
                <img
                  src={preview}
                  className="w-28 h-28 rounded-full object-cover shadow-md border border-[#dccdbb] animate-pop"
                />
              </div>
            )}
          </div>

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

// --------------------
// Subcomponente Field
// --------------------
const Field = ({ label, icon, children }: any) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <div className="flex items-center gap-3 bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm focus-within:border-[#e66748] transition-all">
      {icon}
      {children}
    </div>
  </div>
);
