import { useState, useRef, useEffect } from "react";
import NavbarLogged from "../components/NavbarLogged";
import { Edit3, Save, Camera, Lock, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const API_URL = "http://localhost:4000/api/users";

const ProfileView = () => {
  const { user, loading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  // 🔥 TODOS LOS USESTATE VAN AQUÍ ARRIBA ‼️
  const [profile, setProfile] = useState<any | null>(null);
  const [originalProfile, setOriginalProfile] = useState<any | null>(null);

  const [editing, setEditing] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });

  const [isOldPassVerified, setIsOldPassVerified] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);

  // 🔥 Estos *DEBEN* ir antes del useEffect que los usa
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const [passMatch, setPassMatch] = useState<boolean | null>(null);

  // ✅ AHORA recién puede ir este useEffect
  useEffect(() => {
    if (!showPassModal) {
      setPasswordData({
        oldPass: "",
        newPass: "",
        confirmPass: "",
      });

      setIsOldPassVerified(false);

      setPasswordErrors({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false,
      });

      setPassMatch(null);
    }
  }, [showPassModal]);


    

  // =====================================================
  // 🔥 CARGAR PERFIL DESDE BACKEND
  // =====================================================
  useEffect(() => {
    const loadUser = async () => {
      if (!user) return;

      try {
        const res = await axios.get(`${API_URL}/${user.uid}`);

        const info = {
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone || "",
          address: res.data.address || "",
          avatar:
            res.data.photoUrl ||
            user.photoURL ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        };

        setProfile(info);
        setOriginalProfile(info);
      } catch (err) {
        console.log("❌ Error cargando perfil:", err);
      }
    };

    loadUser();
  }, [user]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Cargando perfil...
      </div>
    );
  }

  // =====================================================
  // 🔥 VALIDACIONES
  // =====================================================

  const validateName = (value: string) => {
    let error = "";

    if (value.length < 3) error = "Debe tener al menos 3 caracteres";
    if (value.length > 40) error = "No puede tener más de 40 caracteres";
    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(value))
      error = "Solo se permiten letras y espacios";

    setErrors((prev) => ({ ...prev, name: error }));
  };

  const validatePhone = (value: string) => {
    let error = "";
    if (!/^\d+$/.test(value)) error = "Solo números";
    if (value.length !== 8) error = "Debe tener 8 dígitos";
    setErrors((prev) => ({ ...prev, phone: error }));
  };

  const validateAddress = (value: string) => {
    let error = "";
    if (value.length < 3) error = "Debe tener al menos 3 caracteres";
    if (value.length > 60) error = "No puede exceder 60 caracteres";
    setErrors((prev) => ({ ...prev, address: error }));
  };

  // =====================================================
  // 🔥 CONTROL DE INPUTS
  // =====================================================

  const handleNameChange = (e: any) => {
    let value = e.target.value;
    value = value.replace(/\s+/g, " ");
    value = value.replace(/^\s+/, "");
    value = value.replace(/\s+$/, "");
    validateName(value);
    setProfile((prev: any) => ({ ...prev, name: value }));
  };

  const handlePhoneChange = (e: any) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 8);
    validatePhone(value);
    setProfile((prev: any) => ({ ...prev, phone: value }));
  };

  const handleAddressChange = (e: any) => {
    let value = e.target.value;
    value = value.replace(/\s+/g, " ");
    value = value.replace(/^\s+/, "");
    value = value.replace(/\s+$/, "");
    validateAddress(value);
    setProfile((prev: any) => ({ ...prev, address: value }));
  };

  // =====================================================
  // 🔥 AVATAR (PREVIEW)
  // =====================================================
  const handlePhoto = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewAvatarFile(file);
    const preview = URL.createObjectURL(file);
    setProfile((prev: any) => ({ ...prev, avatar: preview }));
  };

  // =====================================================
  // 🔥 GUARDAR CAMBIOS
  // =====================================================
  const saveProfile = async () => {
    if (errors.name || errors.phone || errors.address) {
      Swal.fire("Error", "Corrige los campos inválidos", "error");
      return;
    }

    try {
      let photoUrl = profile.avatar;

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

      await axios.put(`${API_URL}/${user!.uid}`, {
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

      setOriginalProfile(profile);
      setEditing(false);
    } catch (err) {
      console.log("❌ Error al actualizar perfil:", err);
      Swal.fire("Error", "No se pudo actualizar el perfil", "error");
    }
  };

  // =====================================================
  // 🔥 CANCELAR EDICIÓN
  // =====================================================
  const cancelEditing = () => {
    setProfile(originalProfile);
    setErrors({ name: "", phone: "", address: "" });
    setEditing(false);
    setNewAvatarFile(null);
  };
    // 🔥 LIMPIAR CAMPOS DE CONTRASEÑA CUANDO SE CIERRA EL MODAL




  // =====================================================
  // 🔥 VALIDAR CONTRASEÑA ACTUAL
  // =====================================================
  const verifyOldPassword = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser)
      return Swal.fire("Error", "No estás autenticado", "error");

    try {
      const credential = EmailAuthProvider.credential(
        profile.email,
        passwordData.oldPass
      );

      await reauthenticateWithCredential(currentUser, credential);

      Swal.fire({
        icon: "success",
        title: "Contraseña verificada",
        text: "Ahora puedes ingresar una nueva contraseña",
        timer: 1500,
        showConfirmButton: false,
      });

      setIsOldPassVerified(true);
    } catch (error) {
      Swal.fire("Error", "La contraseña actual es incorrecta", "error");
    }
  };

  // =====================================================
  //  CAMBIO DE CONTRASEÑA
  // =====================================================
const handlePasswordChange = async () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return Swal.fire("Error", "No estás autenticado", "error");
  }

  if (!isOldPassVerified) {
    return Swal.fire("Error", "Debes validar la contraseña actual", "error");
  }

  if (
    !passwordErrors.length ||
    !passwordErrors.upper ||
    !passwordErrors.lower ||
    !passwordErrors.number ||
    !passwordErrors.special
  ) {
    return Swal.fire(
      "Error",
      "La nueva contraseña no cumple los requisitos",
      "error"
    );
  }

  if (passwordData.newPass !== passwordData.confirmPass) {
    return Swal.fire("Error", "Las contraseñas no coinciden", "error");
  }

  try {
    // 🔥 1. Cambiar contraseña
    await updatePassword(currentUser, passwordData.newPass);

    // 🔥 2. Mostrar éxito COMPLETO antes del logout automático
    await Swal.fire({
      icon: "success",
      title: "Contraseña actualizada",
      text: "Vuelve a iniciar sesión con tu nueva contraseña.",
      timer: 1400,
      showConfirmButton: false,
    });

    // 🔥 3. Cerrar sesión manual (evita errores de UI por estado desincronizado)
    await auth.signOut();

    // 🔥 4. Redirigir manualmente después del modal
    window.location.href = "/login";

  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo actualizar la contraseña", "error");
  }
};

  //  Validación en tiempo real de la nueva contraseña
const validateNewPassword = (value: string) => {
  // No permitir espacios
  if (/\s/.test(value)) return; 

  const validations = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };

  setPasswordErrors(validations);

  setPasswordData((prev) => ({
    ...prev,
    newPass: value,
  }));

  // Validar coincidencia con confirmación
  setPassMatch(
    value.length > 0 && passwordData.confirmPass.length > 0
      ? value === passwordData.confirmPass
      : null
  );
};

//  Validación de confirmación
const validateConfirmPassword = (value: string) => {
  setPasswordData((prev) => ({ ...prev, confirmPass: value }));

  setPassMatch(value === passwordData.newPass);
};
const handleEnterKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
  if (e.key !== "Enter") return;

  // Si AÚN no se validó → validar primero
  if (!isOldPassVerified) {
    if (passwordData.oldPass.trim().length > 0) {
      verifyOldPassword();
    }
    return;
  }

  // Si YA se validó → intentar guardar
  handlePasswordChange();
};


  // =====================================================
  //  UI COMPLETO
  // =====================================================
  return (
    <div className="min-h-screen bg-[#f5efe7] pb-20 relative">
      <NavbarLogged />

      <div className="pt-24 max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 border relative">
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
                  className="absolute bottom-2 right-2 bg-[#826c43] text-white p-2 rounded-full shadow hover:bg-[#e66748]"
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
              <div className="flex gap-4 mt-4">
                <button
                  onClick={saveProfile}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white shadow hover:scale-105"
                >
                  <Save size={18} /> Guardar
                </button>

                <button
                  onClick={cancelEditing}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl border border-[#826c43] text-[#826c43] hover:bg-[#f0e6d8]"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* CAMPOS */}
          <div className="mt-10 space-y-6">

            {/* Nombre */}
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Nombre completo
              </p>
              <input
                type="text"
                disabled={!editing}
                value={profile.name}
                onChange={handleNameChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  editing ? "bg-white border-[#e4d7c5]" : "bg-[#faf6f1]"
                } shadow-sm`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Correo electrónico
              </p>
              <input
                type="email"
                disabled
                value={profile.email}
                readOnly
                className="w-full px-4 py-3 rounded-xl border bg-[#faf6f1] text-gray-600 shadow-sm cursor-not-allowed"
              />
            </div>

            {/* Teléfono */}
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Número de teléfono
              </p>
              <input
                type="text"
                disabled={!editing}
                value={profile.phone}
                onChange={handlePhoneChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  editing ? "bg-white border-[#e4d7c5]" : "bg-[#faf6f1]"
                } shadow-sm`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <p className="font-semibold text-gray-700 mb-1">Dirección</p>
              <input
                type="text"
                disabled={!editing}
                value={profile.address}
                onChange={handleAddressChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  editing ? "bg-white border-[#e4d7c5]" : "bg-[#faf6f1]"
                } shadow-sm`}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* 🔐 CAMBIAR CONTRASEÑA */}
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

      {/* ===================================================== */}
      {/* 🔐 MODAL CAMBIO DE CONTRASEÑA */}
      {/* ===================================================== */}
      {showPassModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50"
          onMouseDown={(e) =>{if (e.target === e.currentTarget) setShowPassModal(false)}}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border relative"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;

              e.preventDefault();
              e.stopPropagation();

              if (!isOldPassVerified) {
                // Solo validar si el campo NO está vacío
                if (passwordData.oldPass.trim().length > 0) {
                  verifyOldPassword();
                }
                return;
              }

              // Ya verificada → intentar guardar
              handlePasswordChange();
            }}
            tabIndex={0}
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

              {/* Contraseña actual */}
              <input
                type="password"
                placeholder="Contraseña actual"
                value={passwordData.oldPass}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    oldPass: e.target.value,
                  }))
                }
                disabled={isOldPassVerified}
                className="w-full px-4 py-3 rounded-xl border border-[#e4d7c5] shadow-sm"
              />

              <button
                onClick={verifyOldPassword}
                disabled={isOldPassVerified}
                className={`w-full py-2 rounded-xl font-semibold transition 
                  ${isOldPassVerified 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#826c43] text-white hover:scale-105"}
                `}
              >
                Validar contraseña actual
              </button>


              {/* Nueva contraseña */}
              <input
                type="password"
                placeholder="Nueva contraseña"
                disabled={!isOldPassVerified}
                style={{ opacity: isOldPassVerified ? 1 : 0.4 }}
                value={passwordData.newPass}
                onChange={(e) => validateNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e4d7c5] shadow-sm"
              />

              {/* Indicadores en tiempo real */}
              {isOldPassVerified && passwordData.newPass.length > 0 && (
                <div className="mt-2 text-sm space-y-1">
                  <p className={passwordErrors.length ? "text-green-600" : "text-red-600"}>
                    • Mínimo 8 caracteres
                  </p>
                  <p className={passwordErrors.upper ? "text-green-600" : "text-red-600"}>
                    • Una letra mayúscula
                  </p>
                  <p className={passwordErrors.lower ? "text-green-600" : "text-red-600"}>
                    • Una letra minúscula
                  </p>
                  <p className={passwordErrors.number ? "text-green-600" : "text-red-600"}>
                    • Un número
                  </p>
                  <p className={passwordErrors.special ? "text-green-600" : "text-red-600"}>
                    • Un carácter especial (!, @, #, &, %, etc.)
                  </p>
                </div>
              )}



              {/* Confirmar */}
              <input
                type="password"
                placeholder="Confirmar contraseña"
                disabled={!isOldPassVerified}
                style={{ opacity: isOldPassVerified ? 1 : 0.4 }}
                value={passwordData.confirmPass}
                onChange={(e) => validateConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e4d7c5] shadow-sm"
              />

              {/* Indicador en tiempo real */}
              {passMatch === false && (
                <p className="text-red-600 text-sm mt-1">Las contraseñas no coinciden</p>
              )}

              {passMatch === true && (
                <p className="text-green-600 text-sm mt-1">Las contraseñas coinciden</p>
              )}


              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={!isOldPassVerified}
                className={`w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow transition 
                  ${
                    isOldPassVerified
                      ? "bg-gradient-to-r from-[#826c43] to-[#e66748] text-white hover:scale-105"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
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
