import { useState, useRef, useEffect } from "react";
import NavbarLogged from "../components/NavbarLogged";
import { Edit3, Save, Camera, Lock, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "http://localhost:4000/api/users";

const ProfileView = () => {
  const { user, loading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  // =====================================================
  // 🔥 TODOS LOS HOOKS VAN AQUÍ ARRIBA (ANTES DE LOS RETURN)
  // =====================================================

  const [profile, setProfile] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });

  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);

  // =====================================================
  // 🔥 1. Cargar datos completos desde tu backend
  // =====================================================
  useEffect(() => {
    const loadUser = async () => {
      if (!user) return;

      try {
        const res = await axios.get(`${API_URL}/${user.uid}`);

        setProfile({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone || "",
          address: res.data.address || "",
          avatar:
            res.data.photoUrl ||
            user.photoURL ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        });
      } catch (err) {
        console.log("❌ Error cargando perfil:", err);
      }
    };

    loadUser();
  }, [user]);

  // =====================================================
  // ⏳ LOADING / NO USER
  // =====================================================

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Cargando perfil...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        No has iniciado sesión.
      </div>
    );
  }

  // =====================================================
  // 🔥 2. Cambiar avatar (solo preview)
  // =====================================================
  const handlePhoto = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewAvatarFile(file);
    const preview = URL.createObjectURL(file);

    setProfile((prev: any) => ({
      ...prev,
      avatar: preview,
    }));
  };

  // =====================================================
  // 🔥 3. Guardar perfil en el backend
  // =====================================================
  const saveProfile = async () => {
    if (!user || !profile) return;

    try {
      let photoUrl = profile.avatar;

      // Subir foto a Cloudinary si se seleccionó una nueva
      if (newAvatarFile) {
        const formData = new FormData();
        formData.append("image", newAvatarFile);

        const uploadRes = await axios.post(
          "http://localhost:4000/api/donations/upload-image",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        photoUrl = uploadRes.data.url;
      }

      await axios.put(`${API_URL}/${user.uid}`, {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        photoUrl,
      });

      Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditing(false);
    } catch (err) {
      console.log("❌ Error al actualizar perfil:", err);
      Swal.fire("Error", "No se pudo actualizar el perfil", "error");
    }
  };

  // =====================================================
  // 🔥 4. Guardar nueva contraseña
  // =====================================================
  const handlePasswordChange = () => {
    if (passwordData.newPass !== passwordData.confirmPass) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    Swal.fire("Listo", "Contraseña actualizada (pendiente backend)", "success");
    setShowPassModal(false);
  };

  // =====================================================
  // 🎨 UI COMPLETA (sin cambios)
  // =====================================================
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

          {/* CAMPOS */}
          <div className="mt-10 space-y-6">
            {/* Nombre */}
            <div>
              <p className="font-semibold text-gray-700 mb-1">Nombre completo</p>
              <input
                type="text"
                disabled={!editing}
                value={profile.name}
                onChange={(e) =>
                  setProfile((prev: any) => ({ ...prev, name: e.target.value }))
                }
                className={`w-full px-4 py-3 rounded-xl border ${
                  editing ? "bg-white border-[#e4d7c5]" : "bg-[#faf6f1]"
                } shadow-sm`}
              />
            </div>

            {/* Email */}
            <div>
              <p className="font-semibold text-gray-700 mb-1">Correo electrónico</p>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-4 py-3 rounded-xl border bg-[#faf6f1] text-gray-600 shadow-sm"
              />
            </div>

            {/* Teléfono */}
            <div>
              <p className="font-semibold text-gray-700 mb-1">Número de teléfono</p>
              <input
                type="text"
                disabled={!editing}
                value={profile.phone}
                onChange={(e) =>
                  setProfile((prev: any) => ({ ...prev, phone: e.target.value }))
                }
                className={`w-full px-4 py-3 rounded-xl border ${
                  editing ? "bg-white border-[#e4d7c5]" : "bg-[#faf6f1]"
                } shadow-sm`}
              />
            </div>

            {/* Dirección */}
            <div>
              <p className="font-semibold text-gray-700 mb-1">Dirección</p>
              <input
                type="text"
                disabled={!editing}
                value={profile.address}
                onChange={(e) =>
                  setProfile((prev: any) => ({ ...prev, address: e.target.value }))
                }
                className={`w-full px-4 py-3 rounded-xl border ${
                  editing ? "bg-white border-[#e4d7c5]" : "bg-[#faf6f1]"
                } shadow-sm`}
              />
            </div>
          </div>

          {/* CAMBIAR CONTRASEÑA */}
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
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-[#e4d7c5] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
              onClick={() => setShowPassModal(false)}
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-[#121212] mb-6 flex items-center gap-2">
              <Lock /> Cambiar Contraseña
            </h2>

            <div className="space-y-5">
              <input
                type="password"
                placeholder="Contraseña actual"
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    oldPass: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-[#e4d7c5] shadow-sm"
              />

              <input
                type="password"
                placeholder="Nueva contraseña"
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPass: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-[#e4d7c5] shadow-sm"
              />

              <input
                type="password"
                placeholder="Confirmar contraseña"
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPass: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-[#e4d7c5] shadow-sm"
              />

              <button
                onClick={handlePasswordChange}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white shadow font-semibold"
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
