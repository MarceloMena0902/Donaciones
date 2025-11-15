import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { MapPin, Crosshair, Utensils, Mail } from "lucide-react";
import Navbar from "../components/Navbar"; // ⭐ IMPORTA TU NAVBAR
import "leaflet/dist/leaflet.css";

const mockDonations = [
  {
    id: 1,
    latitud: -17.3895,
    longitud: -66.1568,
    donorNombre: "Juan Pérez",
    donorEmail: "juan@mail.com",
    tipoAlimento: "Arroz",
    cantidad: 5,
    unidadMedida: "kg",
    descripcion: "Arroz en buen estado",
    estado: "Disponible",
  },
  {
    id: 2,
    latitud: -17.38,
    longitud: -66.14,
    donorNombre: "Maria Lopez",
    donorEmail: "maria@mail.com",
    tipoAlimento: "Leche",
    cantidad: 3,
    unidadMedida: "L",
    descripcion: "Leche entera",
    estado: "Pendiente",
  },
];

const getMarkerColor = (estado: string) => {
  switch (estado) {
    case "Disponible":
      return "#22c55e";
    case "Pendiente":
      return "#f97316";
    case "Entregado":
      return "#3b82f6";
    default:
      return "#6b7280";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 700);
  }, []);

  return (
    <div className="bg-[#f5efe7] min-h-screen w-full">
      {/* ⭐ NAVBAR SIEMPRE ARRIBA */}
      <Navbar />

      <div className="pt-6 px-10">
        {/* HEADER */}
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-[#e4d7c5] mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#826c43] to-[#e66748]" />

          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#826c43] to-[#e66748] bg-clip-text text-transparent flex items-center gap-3">
            <MapPin size={45} /> Mapa de Donantes
          </h1>

          <p className="text-gray-600 text-lg mt-0">
            Encuentra donaciones de alimentos cerca de tu ubicación.
          </p>

          <div className="mt-3 bg-[#fff8f0] px-8 py-4 rounded-2xl shadow flex w-fit items-center gap-4 border border-[#e4d7c5]">
            <span className="text-4xl font-bold text-[#e66748]">
              {mockDonations.length}
            </span>
            <p className="text-gray-600 text-sm uppercase tracking-wide">
              Donaciones Disponibles
            </p>
          </div>
        </div>

        {/* CONTROLES */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-[#e4d7c5] flex justify-between flex-wrap gap-4 mb-6">
          <button
            className="flex items-center gap-2 bg-[#826c43] text-white px-5 py-3 rounded-xl shadow hover:bg-[#6d5938] transition-all hover:-translate-y-1"
            onClick={() => window.location.reload()}
          >
            <Crosshair size={20} /> Centrar en Cochabamba
          </button>

          <div className="flex gap-8 text-gray-700 text-sm items-center">
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-green-600" /> Disponible
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-orange-500" /> Pendiente
            </span>
            <span className="flex items-center gap-2">
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
            className="h-[700px] w-full"
          >
            <CenterCochabamba />

            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {mockDonations.map((d) => (
              <Marker
                key={d.id}
                position={[d.latitud, d.longitud]}
                icon={L.divIcon({
                  html: `
                    <div style="
                      background:${getMarkerColor(d.estado)};
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
                  <div className="font-bold text-[#826c43] text-lg">{d.donorNombre}</div>
                  <div className="text-sm">
                    <Mail size={14} className="inline mr-1" /> {d.donorEmail}
                  </div>
                  <div className="text-sm">
                    <Utensils size={14} className="inline mr-1" /> {d.tipoAlimento}
                  </div>
                  <div className="text-sm">Cantidad: {d.cantidad} {d.unidadMedida}</div>
                  <div className="text-sm">Estado: {d.estado}</div>
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
