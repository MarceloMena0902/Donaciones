import { useParams, useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  Calendar,
  Utensils,
  Package,
  Info,
  MapPin,
} from "lucide-react";
import NavbarLogged from "../components/NavbarLogged";
import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000/api/donations";
const USERS_API = "http://localhost:4000/api/users";

const DonationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState<any | null>(null);
  const [donorData, setDonorData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // ⭐ MODALES
  const [showPreChat, setShowPreChat] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ⭐ Mensaje seleccionado
  const [selectedMessage, setSelectedMessage] = useState("");

  const predefinedMessages = [
    "Hola, estoy interesado en tu donación ❤️",
    "¿Podrías darme más información sobre la donación?",
    "¿Está aún disponible esta donación?",
    "¿Podemos coordinar la entrega?",
  ];

  // ⭐ Donaciones estáticas
  const staticDonations = [
    {
      id: "STATIC1",
      description: "Caja de manzanas verdes frescas 🍏",
      expirationDate: "2025-02-10",
      type: "Perecedero",
      quantity: 8,
      unit: "kg",
      status: "Disponible",
      userId: "donante1@test.com",
      location: {
        lat: -17.3801,
        lng: -66.1634,
        address: "Zona Recoleta, Cochabamba",
      },
    },
    {
      id: "STATIC2",
      description: "Paquetes de fideos surtidos 🍝",
      expirationDate: "2025-05-22",
      type: "No perecedero",
      quantity: 12,
      unit: "unidad",
      status: "Pendiente",
      userId: "donante2@test.com",
      location: {
        lat: -17.3959,
        lng: -66.1452,
        address: "Av Ayacucho, Cercado",
      },
    },
  ];

  // =========================
  // 1. Cargar donación
  // =========================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`);
        setDonation(res.data);
      } catch {
        const local = staticDonations.find((d) => d.id === id);
        setDonation(local || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // =========================
  // 2. Cargar usuario (o datos fake)
  // =========================
  useEffect(() => {
    if (!donation?.userId) return;

    const loadUser = async () => {
      try {
        const res = await axios.get(`${USERS_API}/${donation.userId}`);
        setDonorData(res.data);
      } catch {
        setDonorData({
          id: donation.userId,
          name: "Usuario de prueba",
          email: donation.userId,
          phone: "70000000",
        });
      }
    };

    loadUser();
  }, [donation]);

  // =========================
  // SOLO FRONTEND — no manda nada al backend
  // =========================
  const handleSendPreMessage = () => {
    if (!selectedMessage) return;

    console.log("Mensaje enviado (FRONTEND): ", selectedMessage);

    setShowPreChat(false);
    setShowSuccessModal(true);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f2eb]">
        <div className="animate-spin border-t-4 border-[#826c43] border-solid rounded-full h-14 w-14"></div>
      </div>
    );

  if (!donation)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        Donación no encontrada ❌
      </div>
    );

  const donorName = donorData?.name || "Donante";
  const donorEmail = donorData?.email || "No especificado";
  const donorPhone = donorData?.phone || "No especificado";

  return (
    <div className="min-h-screen bg-[#f7f2eb]">
      <NavbarLogged />

      {/* ⭐ MODAL PRE-CHAT */}
      {/* ⭐ MODAL PRE-CHAT */}
{showPreChat && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50"
    onClick={() => setShowPreChat(false)}
  >
    <div
      className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-[#e4d7c5] relative"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[65%] h-1 rounded-full bg-gradient-to-r from-[#826c43] to-[#e66748]" />

      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        onClick={() => setShowPreChat(false)}
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold text-[#121212] mb-4">
        Enviar mensaje rápido
      </h2>

      <p className="text-gray-600 mb-6">Selecciona un mensaje:</p>

      {/* ⭐ LISTA DE MENSAJES — ahora solo seleccionan, NO envían */}
      <div className="space-y-3 mb-6">
        {predefinedMessages.map((msg, i) => (
          <button
            key={i}
            onClick={() => setSelectedMessage(msg)}
            className={`w-full text-left px-4 py-3 rounded-xl border ${
              selectedMessage === msg
                ? "bg-[#e8dccf] border-[#826c43]"
                : "bg-[#faf7f3] border-[#e4d7c5]"
            } hover:bg-[#f2e7dd] transition shadow-sm text-[#4b3f2f]`}
          >
            {msg}
          </button>
        ))}
      </div>

      <textarea
        placeholder="Escribe tu propio mensaje..."
        className="w-full px-4 py-3 rounded-xl border border-[#e4d7c5] shadow-sm outline-none bg-[#faf7f3]"
        rows={3}
        value={selectedMessage}
        onChange={(e) => setSelectedMessage(e.target.value)}
      />

      {/* ⭐ AHORA este botón recién envía */}
      <button
        onClick={() => {
          if (!selectedMessage) return;
          setShowPreChat(false);
          setShowSuccessModal(true);
        }}
        disabled={!selectedMessage}
        className="w-full mt-5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] 
          text-white shadow hover:scale-[1.03] transition font-semibold disabled:opacity-50"
      >
        Enviar mensaje
      </button>
    </div>
  </div>
)}


      {/* ⭐ MODAL DE ÉXITO */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-2xl border border-[#e4d7c5] relative text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-1 rounded-full bg-gradient-to-r from-[#826c43] to-[#e66748]" />

            <h2 className="text-2xl font-bold text-[#121212] mb-4">
              Solicitud enviada ✔
            </h2>

            <p className="text-gray-700 mb-6">
              Tu solicitud fue enviada al donante.<br />
              Espera su aprobación.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#826c43] to-[#e66748] text-white shadow font-semibold hover:scale-105 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ⭐ CONTENIDO PRINCIPAL */}
      <div className="pt-24 pb-20 max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-[#121212] mb-2">
          Detalles de la Donación
        </h1>

        <p className="text-gray-600 mb-12">
          Información completa del donante y del alimento donado.
        </p>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-[#e5d8c6] p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#826c43] to-[#e66748]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* INFO DONANTE */}
            <div>
              <h2 className="text-2xl font-bold text-[#1d1d1d] mb-6 flex items-center gap-2">
                <Info size={26} className="text-[#826c43]" />
                Información del Donante
              </h2>

              <div className="space-y-4 text-gray-700">
                <p className="flex items-center gap-3">
                  <Package className="text-[#826c43]" />
                  <span>
                    <strong>Nombre:</strong> {donorName}
                  </span>
                </p>

                <p className="flex items-center gap-3">
                  <Mail className="text-[#826c43]" />
                  <span>
                    <strong>Email:</strong> {donorEmail}
                  </span>
                </p>

                <p className="flex items-center gap-3">
                  <Phone className="text-[#826c43]" />
                  <span>
                    <strong>Teléfono:</strong> {donorPhone}
                  </span>
                </p>
              </div>
            </div>

            {/* INFO PRODUCTO */}
            <div>
              <h2 className="text-2xl font-bold text-[#1d1d1d] mb-6 flex items-center gap-2">
                <Utensils size={26} className="text-[#826c43]" />
                Detalles del Producto
              </h2>

              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Tipo:</strong> {donation.type}
                </p>

                <p>
                  <strong>Cantidad:</strong> {donation.quantity} {donation.unit}
                </p>

                <p>
                  <strong>Descripción:</strong> {donation.description}
                </p>

                {donation.location?.address && (
                  <p className="flex items-center gap-2">
                    <MapPin className="text-[#826c43]" />
                    <strong>Ubicación:</strong> {donation.location.address}
                  </p>
                )}

                {donation.expirationDate && (
                  <p className="flex items-center gap-3">
                    <Calendar className="text-[#826c43]" />
                    <strong>Caducidad:</strong> {donation.expirationDate}
                  </p>
                )}

                <p>
                  <strong>Estado:</strong>{" "}
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                    {donation.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="mt-12 flex gap-4">
            <button
              onClick={() => setShowPreChat(true)}
              className="bg-gradient-to-r from-[#826c43] to-[#e66748] 
                text-white px-6 py-3 rounded-xl shadow hover:scale-105 transition flex items-center gap-2"
            >
              <i className="fas fa-comments"></i>
              Contactar al Donante
            </button>

            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-[#826c43] text-[#826c43] 
                font-semibold hover:bg-[#f7efe5] transition-all"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationView;
