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

  // ============================
  // ESTADOS DE FORMULARIO
  // ============================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ============================
  // ERRORES POR CAMPO
  // ============================
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  // ============================
  // VALIDADORES
  // ============================
  const validateName = (v: string) =>
    v.trim().length === 0 ? "El nombre es obligatorio." : "";

  const validateEmail = (v: string) => {
    if (!v) return "El correo es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Correo no válido.";
    return "";
  };

  const validatePassword = (v: string) => {
    if (!v) return "La contraseña es obligatoria.";
    if (v.length < 6) return "Debe tener mínimo 6 caracteres.";
    return "";
  };

  const validateConfirmPassword = (v: string) => {
    if (v !== password) return "Las contraseñas no coinciden.";
    return "";
  };

  const validatePhone = (v: string) => {
    if (v && v.length < 7) return "Número de teléfono no válido, debe tener 8 dígitos.";
    return "";
  };

  const validateAddress = (v: string) => {
    if (v.trim() === "") return "";
    if (v.length < 3) return "Dirección demasiado corta.";
    return "";
  };

  // ============================
  // PREVIEW FOTO
  // ============================
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ============================
  // MANEJO SUBMIT
  // ============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones finales antes de enviar
    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
      phone: validatePhone(phone),
      address: validateAddress(address),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err !== "")) {
      Swal.fire("Error", "Por favor corrige los campos marcados.", "error");
      return;
    }

    setLoading(true);

    try {
      let photoUrl = "";
      if (photo) photoUrl = await uploadImage(photo);

      await registerWithEmail(
        name.trim(),
        email.trim(),
        password.trim(),
        phone.trim(),
        address.trim(),
        photoUrl
      );

      Swal.fire({
        title: "Cuenta creada 🎉",
        text: "Tu registro fue exitoso",
        icon: "success",
        confirmButtonColor: "#826c43",
      }).then(() => navigate("/login"));
    } catch (error) {
      Swal.fire("Error", "No se pudo completar el registro", "error");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // VALIDACIÓN EN TIEMPO REAL
  // ============================
  const handleBlur = (field: string) => {
    let value = "";
    let error = "";

    switch (field) {
      case "name":
        value = name;
        error = validateName(value);
        break;

      case "email":
        value = email;
        error = validateEmail(value);
        break;

      case "password":
        value = password;
        error = validatePassword(value);
        // También validar confirmación si ya hay algo escrito
        if (confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: validateConfirmPassword(confirmPassword),
          }));
        }
        break;

      case "confirmPassword":
        value = confirmPassword;
        error = validateConfirmPassword(value);
        break;

      case "phone":
        value = phone;
        error = validatePhone(value);
        break;

      case "address":
        value = address;
        error = validateAddress(value);
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // ============================
  // UI PRINCIPAL
  // ============================
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

        {/* SOCIAL LOGIN */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => loginWithGoogle()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white border border-[#dccdbb]"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" />
            <span className="font-medium text-gray-700">Registrarse con Google</span>
          </button>

          <button
            onClick={() => loginWithFacebook()}
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

        {/* ============================
            FORMULARIO
        ============================ */}
        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* Nombre */}
          <Field label="Nombre Completo" icon={<User size={20} className="text-[#826c43]" />} error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/^\s+/, ""))}
              onBlur={() => handleBlur("name")}
              placeholder="Tu nombre completo"
              className="input w-full"
            />
          </Field>

          {/* Email */}
          <Field label="Correo Electrónico" icon={<Mail size={20} className="text-[#826c43]" />} error={errors.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                const clean = e.target.value.replace(/\s+/g, "");
                setEmail(clean);
              }}
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
              onPaste={(e) => {
                if (/\s/.test(e.clipboardData.getData("text"))) e.preventDefault();
              }}
              onBlur={() => handleBlur("email")}
              placeholder="correo@ejemplo.com"
              className="input w-full"
            />
          </Field>

          {/* Contraseña */}
          <Field label="Contraseña" icon={<Lock size={20} className="text-[#826c43]" />} error={errors.password}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\s+/g, ""))}
              onBlur={() => handleBlur("password")}
              placeholder="••••••••"
              className="input w-full"
            />
          </Field>

          {/* Confirmar Contraseña */}
          <Field
            label="Confirmar Contraseña"
            icon={<Lock size={20} className="text-[#826c43]" />}
            error={errors.confirmPassword}
          >
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value.replace(/\s+/g, ""))
              }
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Repite tu contraseña"
              className="input w-full"
            />
          </Field>

          {/* Teléfono */}
          <Field label="Teléfono" icon={<Phone size={20} className="text-[#826c43]" />} error={errors.phone}>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              onBlur={() => handleBlur("phone")}
              placeholder="Ej: 76452345"
              className="input w-full"
            />
          </Field>

          {/* Dirección */}
          <Field label="Dirección" icon={<Home size={20} className="text-[#826c43]" />} error={errors.address}>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value.replace(/^\s+/, ""))}
              onBlur={() => handleBlur("address")}
              placeholder="Tu dirección"
              className="input w-full"
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

          {/* BOTÓN SUBMIT */}
          <button type="submit" disabled={loading} className="submit-btn">
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

// ============================
// COMPONENTE FIELD ACTUALIZADO
// ============================
const Field = ({ label, icon, error, children }: any) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>

    <div
      className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 shadow-sm transition-all
      ${error ? "border-red-500" : "border-[#dccdbb] focus-within:border-[#e66748]"}`}
    >
      {icon}
      {children}
    </div>

    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);
