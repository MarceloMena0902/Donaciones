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
  const [photoName, setPhotoName] = useState("");

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
    if (v.length < 8) return "Debe tener mínimo 8 caracteres.";
    if (!/[A-Z]/.test(v)) return "Debe incluir una letra mayúscula.";
    if (!/[a-z]/.test(v)) return "Debe incluir una letra minúscula.";
    if (!/[0-9]/.test(v)) return "Debe incluir un número.";
    if (!/[^A-Za-z0-9]/.test(v)) return "Debe incluir un carácter especial.";
    return "";
  };

  const validateConfirmPassword = (v: string) => {
    if (v !== password) return "Las contraseñas no coinciden.";
    return "";
  };

  const validatePhone = (v: string) => {
    if (v && v.length < 8)
      return "Número de teléfono no válido, debe tener 8 dígitos.";
    return "";
  };

  const validateAddress = (v: string) => {
    if (v.trim() === "") return "";
    if (v.length < 3) return "Dirección demasiado corta.";
    return "";
  };

  // ============================
  // REGLAS DINÁMICAS CONTRASEÑA
  // ============================
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const [passMatch, setPassMatch] = useState<boolean | null>(null);

  // ============================
  // PREVIEW FOTO
  // ============================
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
      setPhotoName(file.name);
    } else {
      setPhoto(null);
      setPreview(null);
      setPhotoName("");
    }
  };


  // ============================
  // --- SUBMIT ---
  // ============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
      phone: validatePhone(phone),
      address: validateAddress(address),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e !== "")) {
      Swal.fire("Error", "Por favor corrige los campos marcados.", "error");
      return;
    }

    if (
      !passwordRules.length ||
      !passwordRules.upper ||
      !passwordRules.lower ||
      !passwordRules.number ||
      !passwordRules.special
    ) {
      Swal.fire("Error", "La contraseña no cumple los requisitos.", "error");
      return;
    }

    if (!passMatch) {
      Swal.fire("Error", "Las contraseñas no coinciden.", "error");
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
    } catch (err) {
      Swal.fire("Error", "No se pudo completar el registro.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // BLUR CONTROLADO (SIN DOBLES MENSAJES)
  // ============================
  const handleBlur = (field: string) => {
    let error = "";

    if (field === "password") {
      if (password.length === 0) error = "La contraseña es obligatoria.";
    }

    if (field === "confirmPassword") {
      if (confirmPassword.length === 0)
        error = "Debes confirmar tu contraseña.";
    }

    if (field === "name") error = validateName(name);
    if (field === "email") error = validateEmail(email);
    if (field === "phone") error = validatePhone(phone);
    if (field === "address") error = validateAddress(address);

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // ============================
  // LIVE PASSWORD
  // ============================
  const validatePasswordLive = (value: string) => {
    if (/\s/.test(value)) return;

    const clean = value.trim();
    setPassword(clean);

    const checks = {
      length: clean.length >= 8,
      upper: /[A-Z]/.test(clean),
      lower: /[a-z]/.test(clean),
      number: /[0-9]/.test(clean),
      special: /[^A-Za-z0-9]/.test(clean),
    };

    setPasswordRules(checks);

    if (clean.length === 0) {
      setPassMatch(null);
      return;
    }

    if (confirmPassword.length > 0) {
      setPassMatch(clean === confirmPassword);
    }
  };

  // ============================
  // LIVE CONFIRM PASSWORD
  // ============================
  const validateConfirmPasswordLive = (value: string) => {
    const clean = value.trim();
    setConfirmPassword(clean);

    if (clean.length === 0) {
      setPassMatch(null);
      return;
    }

    setPassMatch(clean === password);
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

        {/* FORM */}
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
          <Field
            label="Contraseña"
            icon={<Lock size={20} className="text-[#826c43]" />}
            error={errors.password}
            disableError={true}   // 🔥 evita doble mensaje
          >
            <input
              type="password"
              value={password}
              onChange={(e) => validatePasswordLive(e.target.value)}
              onBlur={() => handleBlur("password")}
              placeholder="••••••••"
              className="input w-full"
            />
          </Field>


          {/* Reglas dinámicas */}
          {password.length > 0 && (
            <div className="mt-2 text-sm space-y-1 ml-1">
              <p className={passwordRules.length ? "text-green-600" : "text-red-600"}>• Mínimo 8 caracteres</p>
              <p className={passwordRules.upper ? "text-green-600" : "text-red-600"}>• Una letra mayúscula</p>
              <p className={passwordRules.lower ? "text-green-600" : "text-red-600"}>• Una letra minúscula</p>
              <p className={passwordRules.number ? "text-green-600" : "text-red-600"}>• Un número</p>
              <p className={passwordRules.special ? "text-green-600" : "text-red-600"}>• Un carácter especial (!, @, #, &, %, etc.)</p>
            </div>
          )}

          {/* Error obligatorio */}
          {errors.password && password.length === 0 && (
            <p className="text-red-600 text-sm mt-1 ml-1">{errors.password}</p>
          )}

          {/* Confirmar Contraseña */}
          <Field
            label="Confirmar Contraseña"
            icon={<Lock size={20} className="text-[#826c43]" />}
            error={errors.confirmPassword}
            disableError={true}   // 🔥 evita doble mensaje
          >
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => validateConfirmPasswordLive(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Repite tu contraseña"
              className="input w-full"
            />
          </Field>


          {/* Mensajes dinámicos */}
          {confirmPassword.length > 0 && passMatch === false && (
            <p className="text-red-600 text-sm mt-1 ml-1">Las contraseñas no coinciden</p>
          )}

          {confirmPassword.length > 0 && passMatch === true && (
            <p className="text-green-600 text-sm mt-1 ml-1">Las contraseñas coinciden</p>
          )}

          {/* Obligatorio confirmación */}
          {errors.confirmPassword && confirmPassword.length === 0 && (
            <p className="text-red-600 text-sm mt-1 ml-1">{errors.confirmPassword}</p>
          )}

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

            <div
              className="
                flex flex-col sm:flex-row sm:items-center gap-2
                bg-white border border-[#dccdbb]
                rounded-xl px-4 py-3 shadow-sm
              "
            >
              <div className="flex items-center gap-3">
                <Image size={20} className="text-[#826c43]" />

                {/* Botón custom + input oculto */}
                <label className="cursor-pointer">
                  <span
                    className="
                      inline-flex items-center justify-center
                      px-4 py-2 rounded-lg
                      border border-[#dccdbb]
                      text-sm font-medium text-[#826c43]
                      hover:bg-[#f5efe7] transition
                    "
                  >
                    Elegir imagen
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Nombre del archivo (línea completa, sin corte) */}
              <span className="text-xs text-gray-500 sm:ml-2 break-all">
                {photoName || "Ninguna imagen seleccionada"}
              </span>
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
// COMPONENTE FIELD
// ============================
const Field = ({ label, icon, error, children, disableError }: any) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>

    <div
      className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 shadow-sm transition-all
      ${error && !disableError ? "border-red-500" : "border-[#dccdbb] focus-within:border-[#e66748]"}`}
    >
      {icon}
      {children}
    </div>

    {/* Mostrar error solo si disableError NO está activo */}
    {!disableError && error && (
      <p className="text-red-600 text-sm mt-1">{error}</p>
    )}
  </div>
);

