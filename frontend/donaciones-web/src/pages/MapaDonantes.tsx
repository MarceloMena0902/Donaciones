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
import "leaflet/dist/leaflet.css";

// ⭐ MOCK de donaciones
const mockDonations = [
  {
    id: 1,
    latitud: -17.3895,
    longitud: -66.1568,
    donorNombre: "Juan Pérez",
    donorEmail: "juan@mail.com",
    tipoAlimento: "Perecedero",
    alimento: "Arroz",
    fechaCaducidad: "2025-12-15",
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
    tipoAlimento: "No perecedero",
    alimento: "Leche",
    fechaCaducidad: "2026-01-02",
    cantidad: 3,
    unidadMedida: "L",
    descripcion: "Leche entera",
    estado: "Pendiente",
  },
  {
    id: 3,
    latitud: -17.383,
    longitud: -66.155,
    donorNombre: "Carlos Duran",
    donorEmail: "carlos@mail.com",
    tipoAlimento: "Preparado",
    alimento: "Sopa de pollo",
    fechaCaducidad: "2024-11-27",
    cantidad: 2,
    unidadMedida: "unidad",
    descripcion: "Sopa recién preparada",
    estado: "Disponible",
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

  // ⭐ FILTROS
  const [categoria, setCategoria] = useState("Todos");

  const filtradas =
    categoria === "Todos"
      ? mockDonations
      : mockDonations.filter((d) => d.tipoAlimento === categoria);

  useEffect(() => {
    setTimeout(() => setLoading(false), 700);
  }, []);

  return (
    <div className="bg-[#f5efe7] min-h-screen w-full">
      <Navbar />

      <div className="pt-6 px-10">

        {/* HEADER */}
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-[#e4d7c5] mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[92%] h-1 mx-auto 
            bg-gradient-to-r from-[#826c43] to-[#e66748] rounded-t-3xl" />

          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#826c43] to-[#e66748] 
            bg-clip-text text-transparent flex items-center gap-3">
            <MapPin size={45} /> Mapa de Donantes
          </h1>

          <p className="text-gray-600 text-lg mt-0">
            Encuentra donaciones de alimentos cerca de tu ubicación.
          </p>

          <div className="mt-3 bg-[#fff8f0] px-8 py-4 rounded-2xl shadow flex w-fit items-center gap-4 border border-[#e4d7c5]">
            <span className="text-4xl font-bold text-[#e66748]">
              {filtradas.length}
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

          {/* FILTROS POR CATEGORIA */}
          <div className="flex items-center gap-3">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="bg-[#fff8f0] border border-[#e4d7c5] px-4 py-3 rounded-xl shadow text-gray-700 font-medium"
            >
              <option value="Todos">Todas las categorías</option>
              <option value="Perecedero">Perecederos</option>
              <option value="No perecedero">No perecederos</option>
              <option value="Preparado">Preparados</option>
            </select>
          </div>

          {/* LEYENDA */}
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

            {filtradas.map((d) => (
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
                  <div style={{
                    width: "260px",
                    background: "#fff8f0",
                    borderRadius: "18px",
                    padding: "14px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    border: "1px solid #e4d7c5",
                    fontFamily: "Inter, sans-serif",
                  }}>
                    
                    {/* NOMBRE */}
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
                      {d.donorNombre}
                    </div>

                    {/* FECHA CADUCIDAD */}
                    <p style={{
                      margin: "6px 0",
                      color: "#4b3f2f",
                      fontSize: "14px"
                    }}>
                      <Calendar size={14} className="inline mr-1 text-[#826c43]" />
                      <strong>Caduca:</strong> {d.fechaCaducidad}
                    </p>

                    {/* EMAIL */}
                    <p style={{ margin: "6px 0", color: "#4b3f2f", fontSize: "14px" }}>
                      <Mail size={14} className="inline mr-1 text-[#826c43]" />
                      <strong>Email:</strong> {d.donorEmail}
                    </p>

                    {/* TIPO */}
                    <p style={{ margin: "6px 0", color: "#4b3f2f", fontSize: "14px" }}>
                      <Utensils size={14} className="inline mr-1 text-[#826c43]" />
                      <strong>Tipo:</strong> {d.tipoAlimento}
                    </p>

                    {/* CANTIDAD */}
                    <p style={{ margin: "6px 0", color: "#4b3f2f", fontSize: "14px" }}>
                      <strong>Cantidad:</strong> {d.cantidad} {d.unidadMedida}
                    </p>

                    {/* ESTADO */}
                    <div style={{ marginTop: "10px" }}>
                      <span
                        style={{
                          background:
                            d.estado === "Disponible"
                              ? "#22c55e"
                              : d.estado === "Pendiente"
                              ? "#f97316"
                              : "#3b82f6",
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {d.estado}
                      </span>
                    </div>

                    {/* DESCRIPCION */}
                    <p style={{
                      marginTop: "8px",
                      color: "#4b3f2f",
                      fontSize: "14px",
                      lineHeight: "1.3"
                    }}>
                      <strong>Descripción:</strong> {d.descripcion}
                    </p>

                    {/* BOTON */}
                    <a
                      href={`/donation/${d.id}`}
                      style={{
                        display: "block",
                        marginTop: "14px",
                        background: "linear-gradient(to right,#826c43,#e66748)",
                        padding: "10px",
                        textAlign: "center",
                        borderRadius: "10px",
                        color: "white",
                        fontWeight: "600",
                        textDecoration: "none",
                      }}
                    >
                      Ver Detalles
                    </a>

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
