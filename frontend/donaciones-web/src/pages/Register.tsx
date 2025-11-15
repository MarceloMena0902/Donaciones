import { Mail, Lock, Phone, Home, User, Image, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSocial = (provider: string) => {
    console.log("Login con:", provider);
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center px-6 py-16"
      style={{
        background: "linear-gradient(135deg, #f5efe7, #efe7dc)",
      }}
    >
      {/* CARD */}
      <div className="relative w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_50px_rgba(0,0,0,0.18)] border border-white/60 p-10 overflow-hidden animate-fadeUp">

        {/* Línea superior */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#826c43] to-[#e66748]" />

        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#e66748]/30 to-[#826c43]/20 rounded-full blur-3xl animate-pulseSlow"></div>

        {/* TÍTULO */}
        <h2 className="text-3xl font-extrabold text-[#121212] text-center mb-2">
          Crear Cuenta
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Únete a la comunidad de donantes 🤝
        </p>

        {/* SOCIAL LOGIN */}
        <div className="space-y-3 mb-8">
          {/* Google */}
          <button
            onClick={() => handleSocial("Google")}
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

          {/* Facebook */}
          <button
            onClick={() => handleSocial("Facebook")}
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

        {/* FORM */}
        <form className="space-y-6">

          {/* Nombre */}
          <Field label="Nombre Completo" icon={<User size={20} className="text-[#826c43]" />}>
            <input type="text" placeholder="Tu nombre completo" className="input" />
          </Field>

          {/* Correo */}
          <Field label="Correo Electrónico" icon={<Mail size={20} className="text-[#826c43]" />}>
            <input type="email" placeholder="nombre@ejemplo.com" className="input" />
          </Field>

          {/* Contraseña */}
          <Field label="Contraseña" icon={<Lock size={20} className="text-[#826c43]" />}>
            <input type="password" placeholder="••••••••" className="input" />
          </Field>

          {/* Confirmar contraseña */}
          <Field label="Confirmar Contraseña" icon={<Lock size={20} className="text-[#826c43]" />}>
            <input type="password" placeholder="Repite tu contraseña" className="input" />
          </Field>

          {/* Teléfono */}
          <Field label="Teléfono" icon={<Phone size={20} className="text-[#826c43]" />}>
            <input type="text" placeholder="Ej: 76452345" className="input" />
          </Field>

          {/* Dirección */}
          <Field label="Dirección" icon={<Home size={20} className="text-[#826c43]" />}>
            <input type="text" placeholder="Tu dirección" className="input" />
          </Field>

          {/* Foto */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Foto de Perfil</label>
            <div className="flex items-center gap-3 bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm transition">

              <Image size={20} className="text-[#826c43]" />

              <input
                type="file"
                accept="image/*"
                className="w-full text-gray-600"
                onChange={handleImage}
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

          {/* Tipo de usuario */}
          <Select label="Tipo de Usuario" options={["Donante", "Receptor"]} />

          {/* Rol */}
          <Select label="Rol" options={["Usuario", "Donante", "Voluntario"]} />

          {/* Submit */}
          <button className="submit-btn">Crear Cuenta</button>

          {/* Ir a LOGIN */}
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

/* -------------------------
   SUB COMPONENTES
------------------------- */

const Field = ({ label, icon, children }: any) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <div className="flex items-center gap-3 bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm focus-within:border-[#e66748] transition-all">
      {icon}
      {children}
    </div>
  </div>
);

const Select = ({ label, options }: any) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>

    <div className="relative">
      <select className="appearance-none w-full bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm outline-none text-gray-700 focus:border-[#e66748] transition">
        <option value="">Seleccione…</option>
        {options.map((o: string) => (
          <option value={o} key={o}>
            {o}
          </option>
        ))}
      </select>

      <ChevronDown className="absolute right-4 top-3.5 text-gray-500" size={20} />
    </div>
  </div>
);
