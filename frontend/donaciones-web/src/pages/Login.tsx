import { Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  const handleSocial = (provider: string) => {
    console.log("Login con:", provider);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5efe7] to-[#efe7dc] px-4 py-16">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-white/60 p-10 relative overflow-hidden animate-fadeUp">

        {/* Línea superior */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#826c43] to-[#e66748]" />

        <h2 className="text-3xl font-extrabold text-[#121212] text-center mb-2">
          Iniciar Sesión
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Bienvenido nuevamente ❤️
        </p>

        {/* SOCIAL BUTTONS */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleSocial("Google")}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white border border-[#dccdbb] shadow hover:scale-[1.02] transition"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" />
            <span className="font-medium text-gray-700">Continuar con Google</span>
          </button>

          <button
            onClick={() => handleSocial("Facebook")}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#1877f2] text-white shadow hover:scale-[1.02] transition"
          >
            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-6 h-6" />
            <span className="font-medium">Continuar con Facebook</span>
          </button>
        </div>

        {/* SEPARADOR */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-[#d6c7b7] flex-1" />
          <p className="text-gray-500 text-sm">O usa tu correo</p>
          <div className="h-px bg-[#d6c7b7] flex-1" />
        </div>

        {/* FORM */}
        <form className="space-y-6">
          {/* EMAIL */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Correo Electrónico</label>
            <div className="flex items-center gap-3 bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm">
              <Mail size={20} className="text-[#826c43]" />
              <input type="email" placeholder="nombre@ejemplo.com" className="w-full bg-transparent outline-none" />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Contraseña</label>
            <div className="flex items-center gap-3 bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm">
              <Lock size={20} className="text-[#826c43]" />
              <input type="password" placeholder="••••••••" className="w-full bg-transparent outline-none" />
            </div>
          </div>

          {/* SUBMIT */}
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white font-semibold shadow-lg hover:scale-[1.02] transition">
            INICIAR SESIÓN
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="text-[#e66748] font-semibold hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
