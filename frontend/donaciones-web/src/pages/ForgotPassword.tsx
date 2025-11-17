import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, X } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Email temporal (luego vendrá del backend)
  const email = "usuario@ejemplo.com";

  // Código de 6 campos
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  // Modal cambiar contraseña
  const [showPassModal, setShowPassModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPass: "",
    confirmPass: "",
  });

  // Manejar cambio en los inputs del código
  const handleChange = (value: string, index: number) => {
    if (/^\d$/.test(value) || value === "") {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Avanzar automáticamente
      if (value !== "" && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  // Retroceder automáticamente con Backspace
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Verificar código
  const verifyCode = () => {
    const full = code.join("");

    if (full.length < 6) {
      alert("Debes ingresar los 6 dígitos.");
      return;
    }

    // Aquí iría la validación real con el backend
    setShowPassModal(true);
  };

  // Guardar nueva contraseña
  const handleSavePassword = () => {
    if (!passwordData.newPass || !passwordData.confirmPass) {
      alert("Completa ambos campos.");
      return;
    }

    if (passwordData.newPass !== passwordData.confirmPass) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    // Aquí conectarás al backend para guardar
    alert("Contraseña cambiada (mock).");

    setShowPassModal(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f5efe7] flex items-center justify-center px-4">

      {/* CARD PRINCIPAL */}
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-10 border border-[#dccdbb] relative animate-fadeUp">

        {/* Línea decorativa */}
<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[94.3%] h-1 bg-gradient-to-r from-[#826c43] to-[#e66748] rounded-t-3xl" />

        <h2 className="text-3xl font-extrabold text-[#121212] text-center mb-4">
          Verificación de Código
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Hemos enviado un código de verificación a:
          <br />
          <span className="font-semibold text-[#826c43]">{email}</span>
        </p>

        {/* CÓDIGO DE VERIFICACIÓN */}
        <div className="flex justify-between gap-3 mb-8">
          {code.map((digit, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              ref={(el) => {
                if (el) inputsRef.current[i] = el;
              }}
              className="w-12 h-14 rounded-xl border border-[#dccdbb] text-xl font-bold text-center shadow-sm outline-none bg-[#faf6f1] focus:border-[#826c43]"
            />
          ))}
        </div>

        <button
          onClick={verifyCode}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white font-semibold shadow-lg hover:scale-[1.03] transition"
        >
          Confirmar Código
        </button>

      </div>

      {/* MODAL CAMBIAR CONTRASEÑA */}
      {showPassModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50 animate-fadeIn"
          onClick={() => setShowPassModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-[#e4d7c5] relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* BOTÓN DE CERRAR */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
              onClick={() => setShowPassModal(false)}
            >
              <X size={22} />
            </button>

            {/* TÍTULO */}
            <h2 className="text-2xl font-bold text-[#121212] mb-6 flex items-center gap-2">
              <Lock /> Cambiar Contraseña
            </h2>

            {/* FORM */}
            <div className="space-y-5">

              <div>
                <p className="font-semibold text-gray-700 mb-1">Nueva contraseña</p>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-[#e4d7c5] bg-white shadow-sm outline-none"
                  value={passwordData.newPass}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPass: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-1">Confirmar contraseña</p>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-[#e4d7c5] bg-white shadow-sm outline-none"
                  value={passwordData.confirmPass}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPass: e.target.value,
                    }))
                  }
                />
              </div>

              <button
                onClick={handleSavePassword}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white shadow hover:scale-[1.03] transition font-semibold"
              >
                Guardar Contraseña
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ForgotPassword;
