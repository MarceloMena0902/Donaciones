import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { MapPin, Crosshair, Utensils, Mail, Calendar } from "lucide-react";
import Navbar from "../components/Navbar";
import NavbarLogged from "../components/NavbarLogged";
import { useAuth } from "../context/AuthContext";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
type FirestoreTimestamp = {
  _seconds: number;
  _nanoseconds: number;
};
// Convierte segundos UNIX (UTC) a fecha "YYYY-MM-DD" en horario de Bolivia (UTC-4)
const toBoliviaDateString = (seconds: number): string => {
  const utcMs = seconds * 1000;

  // Bolivia = UTC-4  → desplazamos -4 horas
  const boliviaOffsetMinutes = -4 * 60;
  const boliviaMs = utcMs + boliviaOffsetMinutes * 60 * 1000;

  const d = new Date(boliviaMs);

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`; // "YYYY-MM-DD"
};

const normalizeExpiration = (exp: any): string => {
  if (!exp) return "";

  if (typeof exp === "string") {
    // "2025-12-09" o "2025-12-09T04:00:00.000Z"
    return exp.slice(0, 10);
  }

  if (
    typeof exp === "object" &&
    exp !== null &&
    "_seconds" in exp &&
    typeof (exp as FirestoreTimestamp)._seconds === "number"
  ) {
    const seconds = (exp as FirestoreTimestamp)._seconds;
    return toBoliviaDateString(seconds);
  }
  return "";
};

const API_URL = "http://localhost:4000/api/donations";


const getMarkerColor = (estado: string) => {
  switch (estado) {
    case "Disponible":
      return "#22c55e"; // verde
    case "Pendiente":
      return "#f97316"; // naranja
    case "Entregado":
    case "Entregada":
      return "#3b82f6"; // azul
    default:
      return "#6b7280"; // gris
  }
};


const CenterCochabamba = () => {
  const map = useMap();
  useEffect(() => {
    map.setView([-17.3895, -66.1568], 12);
  }, []);
  return null;
};

const MapaDonantes = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState("Todos");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { user, loading: authLoading } = useAuth();

const navigate = useNavigate();
  // ⭐ Donaciones estáticas para pruebas
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
        address: "Zona Recoleta, Cochabamba"
      }
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
        address: "Av Ayacucho, Cercado"
      }
    }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(API_URL);

        const backendDonations = Array.isArray(res.data) ? res.data : [];

        // ⭐ UNIR DONACIONES DEL BACKEND + ESTÁTICAS
        const finalData = [...backendDonations, ...staticDonations];

        setDonations(finalData);
      } catch (error) {
        console.error("Error cargando donaciones:", error);

        // si falla el backend, usar solo las estáticas
        setDonations(staticDonations);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);
    const filtradas =
    categoria === "Todos"
      ? donations
      : donations.filter((d) => d.type === categoria);


  // ⭐ FILTRO REAL PARA OCULTAR VENCIDAS
  // ⭐ FILTRO REAL PARA OCULTAR VENCIDAS (USANDO LA PAZ - BOLIVIA)
  const isExpired = (expiration: any) => {
    // Normalizar la fecha de expiración a "YYYY-MM-DD"
    const expStr = normalizeExpiration(expiration);
    if (!expStr) return false;

    // Hoy en Bolivia en formato "YYYY-MM-DD"
    const todayString = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/La_Paz",
    });

    // Si la fecha de caducidad es anterior a hoy → vencida
    return expStr < todayString;
  };

   const donacionesConUbicacion = filtradas.filter(
   (d) =>
     d.location &&
     typeof d.location.lat === "number" &&
     typeof d.location.lng === "number" &&
     !isExpired(d.expirationDate) && // 👈 NO mostrar vencidas
     d.status !== "Cancelada" 
 );
// const donacionesConUbicacion = filtradas.filter(
//   (d) =>
//     d.location &&
//     typeof d.location.lat === "number" &&
//     typeof d.location.lng === "number"
// );
// ===============================
// CORRECCIÓN FECHAS (EVITA CAMBIO DE DÍA)
// ===============================
// ===============================
// FORMATEO DE FECHAS PARA MOSTRAR
// ===============================
const toLocalDate = (exp: any) => {
  const str = normalizeExpiration(exp); // "YYYY-MM-DD"
  if (!str) return null;

  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day); // fecha local sin UTC raro
};

const formatExpiration = (exp: any) => {
  const d = toLocalDate(exp);
  if (!d) return "Sin fecha";

  return d.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/La_Paz",
  });
};



const nextImage = (images: string[]) => {
  setActiveImageIndex((prev) => (prev + 1) % images.length);
};

const prevImage = (images: string[]) => {
  setActiveImageIndex((prev) =>
    prev === 0 ? images.length - 1 : prev - 1
  );
};

  return (
    <div className="bg-[#f5efe7] min-h-screen w-full">
      {authLoading ? <Navbar /> : user?.uid ? <NavbarLogged /> : <Navbar />}

      <div className="pt-6 px-10">

        {/* HEADER */}
        <div className="bg-white p-5 md:p-8 lg:p-10 rounded-3xl shadow-xl border border-[#e4d7c5] mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[92%] h-1 mx-auto 
            bg-gradient-to-r from-[#826c43] to-[#e66748] rounded-t-3xl" />

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#826c43] to-[#e66748] 
            bg-clip-text text-transparent flex items-center gap-3">
            <MapPin size={45} /> Mapa de Donantes
          </h1>

          <p className="text-gray-600 text-lg mt-0">
            Encuentra donaciones de alimentos cerca de tu ubicación.
          </p>

          <div className="mt-3 bg-[#fff8f0] px-8 py-4 rounded-2xl shadow flex w-fit items-center gap-4 border border-[#e4d7c5]">
            <span className="text-4xl font-bold text-[#e66748]">
              {donacionesConUbicacion.length}
            </span>
            <p className="text-gray-600 text-sm uppercase tracking-wide">
              Donaciones Encontradas
            </p>
          </div>
        </div>

        {/* CONTROLES */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-[#e4d7c5] flex justify-between items-center flex-wrap gap-4 mb-6">

          {/* Centrar */}
          <button
            className="flex items-center gap-2 bg-[#826c43] text-white px-5 py-3 rounded-xl shadow hover:bg-[#6d5938] transition-all hover:-translate-y-1"
            onClick={() => window.location.reload()}
          >
            <Crosshair size={20} /> Centrar en Cochabamba
          </button>

          {/* FILTROS */}
          <div className="flex items-center gap-3">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="bg-[#fff8f0] border border-[#e4d7c5] px-4 py-3 rounded-xl shadow text-gray-700 font-medium"
            >
              <option value="Todos">Todas las categorías</option>
              <option value="Perecedero">Perecedero</option>
              <option value="No perecedero">No perecedero</option>
              <option value="Preparado">Preparado</option>
            </select>
          </div>

          {/* LEYENDA */}
          <div className="flex flex-wrap gap-3 md:gap-8 text-gray-700 text-sm items-center w-full md:w-auto justify-center md:justify-start">
            <span className="flex items-center gap-1 md:gap-2">
              <MapPin size={16} className="text-green-600" /> Disponible
            </span>
            <span className="flex items-center gap-1 md:gap-2">
              <MapPin size={16} className="text-orange-500" /> Pendiente
            </span>
            <span className="flex items-center gap-1 md:gap-2">
              <MapPin size={16} className="text-blue-500" /> Entregado
            </span>
          </div>
        </div>

        {/* MAPA */}
        <div className="relative shadow-2xl rounded-3xl overflow-hidden border border-[#e4d7c5]">

          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur flex flex-col items-center justify-center z-50">
              <div className="animate-spin rounded-full border-t-4 border-[#826c43] border-solid h-12 w-12" />
              <p className="mt-4 text-gray-700">Cargando donaciones...</p>
            </div>
          )}

          <MapContainer
            center={[-17.3895, -66.1568]}
            zoom={12}
            zoomControl={false}
            className="w-full h-[450px] md:h-[600px] lg:h-[700px]"
          >
            <CenterCochabamba />

            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* PINES REALES Y ESTÁTICOS */}
            {donacionesConUbicacion.map((d) => (
              <Marker
                key={d.id}
                position={[d.location.lat, d.location.lng]}
                icon={L.divIcon({
                  html: `
                    <div style="
                      background:${getMarkerColor(d.status)};
                      width:32px;height:32px;
                      border-radius:50%;
                      border:3px solid white;
                      display:flex;
                      justify-content:center;
                      align-items:center;
                      box-shadow:0 3px 8px rgba(0,0,0,.25);
                    ">
                      <i class="fas fa-heart" style="color:white;font-size:14px;"></i>
                    </div>
                  `,
                })}
              >
                <Popup>
                  <div style={{
                    width: "min(260px, 80vw)",
                    background: "#fff8f0",
                    borderRadius: "18px",
                    padding: "14px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    border: "1px solid #e4d7c5",
                    fontFamily: "Inter, sans-serif",
                  }}>

                    <div style={{
                      background: "linear-gradient(to right, #826c43, #e66748)",
                      color: "white",
                      padding: "10px",
                      borderRadius: "12px",
                      marginBottom: "10px",
                      textAlign: "center",
                      fontWeight: "700",
                      fontSize: "17px",
                    }}>
                      {d.description}
                    </div>
                    {d.images && d.images.length > 0 && (
                      <div
                        style={{
                          width: "100%",
                          height: "120px",
                          maxHeight: "35vw",
                          borderRadius: "12px",
                          overflow: "hidden",
                          position: "relative",
                          marginBottom: "12px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {/* Imagen actual */}
                        <img
                          src={d.images[activeImageIndex]}
                          alt="donacion"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />

                        {/* Flecha izquierda */}
                        <button
                          onClick={() => prevImage(d.images)}
                          style={{
                            position: "absolute",
                            left: "5px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "rgba(0,0,0,0.45)",
                            color: "white",
                            border: "none",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          ‹
                        </button>

                        {/* Flecha derecha */}
                        <button
                          onClick={() => nextImage(d.images)}
                          style={{
                            position: "absolute",
                            right: "5px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "rgba(0,0,0,0.45)",
                            color: "white",
                            border: "none",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        >
                          ›
                        </button>
                      </div>
                    )}

                    <p style={{ margin: "6px 0", color: "#4b3f2f", fontSize: "14px" }}>
                      <Calendar size={14} className="inline mr-1 text-[#826c43]" />
                      <strong>Caduca:</strong> {formatExpiration(d.expirationDate)}

                    </p>

                    <p style={{ margin: "6px 0", color: "#4b3f2f", fontSize: "14px" }}>
                      <Utensils size={14} className="inline mr-1 text-[#826c43]" />
                      <strong>Tipo:</strong> {d.type}
                    </p>

                    <p style={{ margin: "6px 0", color: "#4b3f2f", fontSize: "14px" }}>
                      <strong>Cantidad:</strong> {d.quantity} {d.unit}
                    </p>

                    <div style={{ marginTop: "10px" }}>
                      <span
                        style={{
                          background:
                            d.status === "Disponible"
                              ? "#22c55e"
                              : d.status === "Pendiente"
                              ? "#f97316"
                              : "#3b82f6",
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {d.status}
                      </span>
                    </div>

<button
  onClick={() => {
    if (!user) {
      navigate("/login");  // ⛔ NO logueado → login
    } else {
      navigate(`/donation/${d.id}`); // ✔ Logueado → ver detalles
    }
  }}
  style={{
    display: "block",
    marginTop: "14px",
    background: "linear-gradient(to right,#826c43,#e66748)",
    padding: "10px",
    textAlign: "center",
    borderRadius: "10px",
    color: "white",
    fontWeight: "600",
    width: "100%",
    border: "none",
    cursor: "pointer",
  }}
>
  Ver Detalles
</button>


                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapaDonantes;
