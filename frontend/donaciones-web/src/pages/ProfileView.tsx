import { useState, useRef } from "react";
import NavbarLogged from "../components/NavbarLogged";
import { Edit3, Save, Camera, Lock, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ProfileView = () => {
  const { user, loading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  // Mientras carga Firebase, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Cargando perfil...
      </div>
    );
  }

  // Si no hay usuario logueado
  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        No has iniciado sesión.
      </div>
    );
  }

  // Estado inicial basado en el usuario real
  const [profile, setProfile] = useState({
    name: user.displayName || "",
    email: user.email || "",
    phone: "",
    avatar:
      user.photoURL ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png", // default avatar
  });

  const [editing, setEditing] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });

  // Cambiar foto (solo visual)
  const handlePhoto = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, avatar: preview }));
  };

  // Guardar perfil (aún no incluye backend)
  const saveProfile = () => {
    setEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPass !== passwordData.confirmPass) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    alert("Contraseña actualizada ✨ (pronto se conecta al backend)");
    setShowPassModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f5efe7] pb-20 relative">
      <NavbarLogged />

      <div className="pt-24 max-w-4xl mx-auto px-6">

        {/* CARD PRINCIPAL */}
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-[#e4d7c5] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#826c43] to-[#e66748]" />

          {/* FOTO */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={profile.avatar}
                className="w-40 h-40 rounded-full border-4 border-[#e4d7c5] object-cover shadow-xl"
              />

              {editing && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-[#826c43] hover:bg-[#e66748] text-white p-2 rounded-full shadow"
                >
                  <Camera size={18} />
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhoto}
              />
            </div>

            <h1 className="text-3xl font-bold mt-6 text-[#121212]">
              {profile.name}
            </h1>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="mt-4 flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white shadow hover:scale-105 transition"
              >
                <Edit3 size={18} /> Editar Perfil
              </button>
            ) : (
              <button
                onClick={saveProfile}
                className="mt-4 flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white shadow hover:scale-105 transition"
              >
                <Save size={18} /> Guardar Cambios
              </button>
            )}
          </div>

          {/* CAMPOS PERFIL */}
          <div className="mt-10 space-y-6">
            <div>
              <p className="font-semibold text-gray-700 mb-1">Nombre completo</p>
              <input
                type="text"
                disabled={!editing}
                value={profile.name}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, name: e.target.value }))
                }
                className={`w-full px-4 py-3 rounded-xl border ${
                  editing ? "bg-white border-[#e4d7c5]" : "bg-[#faf6f1] text-gray-600"
                } shadow-sm outline-none`}
              />
            </div>

            <div>
              <p className="font-semibold text-gray-700 mb-1">Correo electrónico</p>
              <input
                type="email"
                disabled={true} // email no editable aquí
                value={profile.email}
                className="w-full px-4 py-3 rounded-xl border bg-[#faf6f1] text-gray-600 shadow-sm outline-none"
              />
            </div>

            <div>
              <p className="font-semibold text-gray-700 mb-1">Número de teléfono</p>
              <input
                type="text"
                disabled={!editing}
                value={profile.phone}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, phone: e.target.value }))
                }
                className={`w-full px-4 py-3 rounded-xl border ${
                  editing ? "bg-white border-[#e4d7c5]" : "bg-[#faf6f1] text-gray-600"
                } shadow-sm outline-none`}
              />
            </div>
          </div>

          {/* BOTÓN CAMBIAR CONTRASEÑA */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setShowPassModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#826c43] text-[#826c43] hover:bg-[#f0e6d8] transition font-semibold"
            >
              <Lock size={18} /> Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CONTRASEÑA */}
      {showPassModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50"
          onClick={() => setShowPassModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-[#e4d7c5] relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* BOTÓN X */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
              onClick={() => setShowPassModal(false)}
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-[#121212] mb-6 flex items-center gap-2">
              <Lock /> Cambiar Contraseña
            </h2>

            {/* FORM */}
            <div className="space-y-5">
              <div>
                <p className="font-semibold text-gray-700 mb-1">Contraseña actual</p>
                <input
                  type="password"
                  value={passwordData.oldPass}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      oldPass: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#e4d7c5] bg-white shadow-sm outline-none"
                />
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-1">Nueva contraseña</p>
                <input
                  type="password"
                  value={passwordData.newPass}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPass: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#e4d7c5] bg-white shadow-sm outline-none"
                />
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-1">Confirmar contraseña</p>
                <input
                  type="password"
                  value={passwordData.confirmPass}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPass: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#e4d7c5] bg-white shadow-sm outline-none"
                />
              </div>

              <button
                onClick={handlePasswordChange}
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

export default ProfileView;
