import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Mail, Phone, Calendar, Utensils, Package, Info, MapPin } from "lucide-react";
import NavbarLogged from "../components/NavbarLogged";
import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000/api/donations";
const USERS_API = "http://localhost:4000/api/users";
const CHAT_API = "http://localhost:4000/api/messages/createChat";

const DonationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState<any | null>(null);
  const [donorData, setDonorData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // 1. Cargar la donación
  // =========================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`);
        setDonation(res.data);
      } catch (err) {
        console.log("❌ Error cargando donación:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // =========================
  // 2. Cargar datos del donante
  // =========================
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!donation?.userId) return;

        const res = await axios.get(`${USERS_API}/${donation.userId}`);
        setDonorData(res.data);
      } catch (err) {
        console.log("❌ Error cargando datos del donante:", err);
      }
    };

    loadUser();
  }, [donation]);

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

  // =========================
  // Datos obtenidos del usuario real
  // =========================
  const donorName = donorData?.name || "Donante";
  const donorEmail = donorData?.email || "No especificado";
  const donorPhone = donorData?.phone || "No especificado";

  const handleCreateChat = async () => {
    if (!donorData?.id) {
      console.log("❌ donorData.id no está listo");
      return;
    }

    // generamos chatId entre ambos
    const currentUserId = localStorage.getItem("uid") || "";
    const otherUserId = donorData.id;
    const chatId = [currentUserId, otherUserId].sort().join("_");

    try {
      await axios.post(CHAT_API, { chatId });
    } catch (err) {
      console.log("❌ Error creando chat:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f2eb]">
      <NavbarLogged />

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
                  <span><strong>Nombre:</strong> {donorName}</span>
                </p>

                <p className="flex items-center gap-3">
                  <Mail className="text-[#826c43]" />
                  <span><strong>Email:</strong> {donorEmail}</span>
                </p>

                <p className="flex items-center gap-3">
                  <Phone className="text-[#826c43]" />
                  <span><strong>Teléfono:</strong> {donorPhone}</span>
                </p>
              </div>
            </div>

            {/* INFO DEL PRODUCTO */}
            <div>
              <h2 className="text-2xl font-bold text-[#1d1d1d] mb-6 flex items-center gap-2">
                <Utensils size={26} className="text-[#826c43]" />
                Detalles del Producto
              </h2>

              <div className="space-y-4 text-gray-700">
                <p><strong>Tipo:</strong> {donation.type}</p>

                <p>
                  <strong>Cantidad:</strong> {donation.quantity} {donation.unit}
                </p>

                <p><strong>Descripción:</strong> {donation.description}</p>

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

            {donorData && (
              <Link
                to={`/chat/${donorData.id}?name=${donorName}`}
                onClick={handleCreateChat}
                className="bg-gradient-to-r from-[#826c43] to-[#e66748] 
                text-white px-6 py-3 rounded-xl shadow hover:scale-105 
                transition flex items-center gap-2"
              >
                <i className="fas fa-comments"></i> Contactar al Donante
              </Link>
            )}

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
