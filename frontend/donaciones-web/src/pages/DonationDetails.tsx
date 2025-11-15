// src/pages/DonationDetails.tsx
import NavbarLogged from "../components/NavbarLogged";
import { useParams, Link } from "react-router-dom";
import {
  Heart,
  Utensils,
  Weight,
  Ruler,
  MapPin,
  Calendar,
  Info,
  Image as ImageIcon,
  ArrowLeft,
  Edit,
} from "lucide-react";
import { useState } from "react";

type Donation = {
  id: number;
  tipoAlimento: string;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  estado: "Disponible" | "Pendiente" | "Entregada";
  ubicacion: string;
  fechaCaducidad: string;
  lat: number;
  lng: number;
  imagenes: string[];
};

const mockDonation: Donation = {
  id: 1,
  tipoAlimento: "Manzanas rojas frescas",
  descripcion:
    "Caja de manzanas rojas en excelente estado, ideales para consumo inmediato.",
  cantidad: 5,
  unidadMedida: "kg",
  estado: "Disponible",
  ubicacion: "Av. Heroínas 123, Cochabamba",
  fechaCaducidad: "2025-12-15",
  lat: -17.3895,
  lng: -66.1568,
  imagenes: [
    "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=800&q=80",
  ],
};

const DonationDetails = () => {
  const { id } = useParams();
  const donation = mockDonation; // Como estamos en mock, tomamos esta única donación

  const [modalImage, setModalImage] = useState<string | null>(null);

  const estadoColor =
    donation.estado === "Disponible"
      ? "bg-green-500"
      : donation.estado === "Pendiente"
      ? "bg-yellow-500"
      : "bg-blue-500";

  return (
    <>
      <NavbarLogged />

      <div className="min-h-screen w-full bg-[#f5efe7] px-6 py-10 pt-24 relative overflow-hidden">
        {/* Partículas suaves */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.18]">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-[#826c43] rounded-full animate-float"
              style={{
                width: 4,
                height: 4,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* HEADER */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#e5dacb] mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#826c43] to-[#e66748]" />

            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 flex items-center gap-3">
              <Heart className="text-[#826c43] w-10 h-10" />
              Detalles de la Donación
            </h1>
            <p className="text-gray-600 mt-2">
              Información completa de tu donación registrada.
            </p>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#e5dacb] p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Info principal */}
              <div className="lg:col-span-2 space-y-5">
                {/* Tipo de alimento */}
                <InfoCard
                  icon={<Utensils />}
                  label="Tipo de alimento"
                  value={donation.tipoAlimento}
                />

                {/* Cantidad */}
                <InfoCard
                  icon={<Weight />}
                  label="Cantidad"
                  value={`${donation.cantidad} ${donation.unidadMedida}`}
                />

                {/* Descripción */}
                <InfoCard
                  icon={<Info />}
                  label="Descripción"
                  value={donation.descripcion}
                  large
                />

                {/* Ubicación */}
                <InfoCard
                  icon={<MapPin />}
                  label="Ubicación"
                  value={donation.ubicacion}
                />

                {/* Fecha + estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InfoCard
                    icon={<Calendar />}
                    label="Fecha de caducidad"
                    value={donation.fechaCaducidad}
                  />

                  <div className="flex items-stretch">
                    <div className="flex-1 bg-[#faf6f1] border border-[#e5dacb] rounded-xl p-4 flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#826c43] to-[#e66748] flex items-center justify-center text-white">
                        <Info />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Estado
                        </p>
                        <span
                          className={`inline-flex mt-1 px-3 py-1 text-sm font-semibold text-white rounded-full ${estadoColor}`}
                        >
                          {donation.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Imágenes */}
              <div className="bg-[#faf6f1] border border-[#e5dacb] rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <ImageIcon className="text-[#826c43]" />
                  Imágenes
                </h3>

                {donation.imagenes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {donation.imagenes.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setModalImage(img)}
                        className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                      >
                        <img
                          src={img}
                          alt={`Imagen donación ${i + 1}`}
                          className="w-full h-28 object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition">
                          Ver
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <ImageIcon className="w-10 h-10 mb-2" />
                    <p className="text-sm">No hay imágenes asociadas</p>
                  </div>
                )}
              </div>
            </div>

            {/* BOTONES ACCIÓN */}
            <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
              <Link
                to={`/donations/${donation.id}/editar`}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#826c43] to-[#e66748] text-white px-8 py-3 rounded-xl shadow-lg hover:scale-[1.03] transition"
              >
                <Edit size={18} />
                Editar Donación
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-8 py-3 rounded-xl shadow-md hover:scale-[1.03] transition"
              >
                <ArrowLeft size={18} />
                Volver al listado
              </Link>
            </div>
          </div>
        </div>

        {/* MODAL IMAGEN */}
        {modalImage && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full mx-4 p-4 relative">
              <button
                onClick={() => setModalImage(null)}
                className="absolute top-3 right-3 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-black/80 transition"
              >
                ✕
              </button>
              <img
                src={modalImage}
                alt="Imagen ampliada"
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DonationDetails;

// Subcomponente bonito para tarjetas de info
const InfoCard = ({
  icon,
  label,
  value,
  large,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  large?: boolean;
}) => (
  <div className="bg-[#faf6f1] border border-[#e5dacb] rounded-xl p-4 flex gap-4 items-start shadow-sm">
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#826c43] to-[#e66748] flex items-center justify-center text-white shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-gray-800 font-medium mt-1 ${
          large ? "text-base" : "text-sm"
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);
