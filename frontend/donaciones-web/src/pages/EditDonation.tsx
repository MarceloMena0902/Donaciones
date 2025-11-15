// src/pages/EditDonation.tsx
import NavbarLogged from "../components/NavbarLogged";
import {
  CloudUpload,
  MapPin,
  Info,
  FileImage,
  X,
  Weight,
  Ruler,
  Calendar,
  Apple,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Fix Leaflet marker
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

type DonationForm = {
  tipo: string;
  fechaCaducidad: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  direccion: string;
  lat: number | null;
  lng: number | null;
};

const unidades = ["kg", "L", "unidad", "caja"];

// Mock inicial DONACIÓN YA EXISTENTE
const initialDonation: DonationForm = {
  tipo: "Perecedero",
  fechaCaducidad: "2025-12-15",
  descripcion:
    "Caja de manzanas rojas en excelente estado, ideales para repartir hoy.",
  cantidad: 5,
  unidad: "kg",
  direccion: "Av. Heroínas 123, Cochabamba",
  lat: -17.3895,
  lng: -66.1568,
};

const EditDonation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<DonationForm>(initialDonation);
  const [images, setImages] = useState<File[]>([]);

  const LocationSelector = () => {
    useMapEvents({
      click: (e) => {
        setForm((prev) => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
      },
    });
    return null;
  };

  const handleImageUpload = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 5);
    setImages(newFiles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.tipo || !form.descripcion || !form.unidad || !form.lat || !form.lng) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Por favor completa toda la información requerida.",
        confirmButtonColor: "#e66748",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Donación actualizada",
      text: "La donación ha sido modificada correctamente 🎉",
      confirmButtonColor: "#826c43",
    }).then(() => {
      navigate("/dashboard");
    });
  };

  return (
    <>
      <NavbarLogged />

      <div className="min-h-screen w-full bg-[#f5efe7] px-6 py-10 pt-24 animate-fadeIn relative overflow-hidden">
        {/* Partículas */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.2]">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-[#826c43] rounded-full animate-float"
              style={{
                width: 4,
                height: 4,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* HEADER */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#e5dacb] mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#826c43] to-[#e66748]" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 flex items-center gap-3">
              <Heart className="text-[#826c43]" />
              Editar Donación
            </h1>
            <p className="text-gray-600 mt-2">Actualiza la información de tu donación existente.</p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-8 border border-[#e5dacb]"
          >
            {/* INFO BÁSICA */}
            <section className="mb-8 bg-[#faf6f1] border border-[#e5dacb] rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-5">
                <Info className="text-[#826c43]" /> Información Básica
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Apple size={18} /> Tipo de alimento
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Perecedero">🥬 Perecedero</option>
                    <option value="No perecedero">🥫 No perecedero</option>
                    <option value="Preparado">🍲 Preparado</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Calendar size={18} /> Fecha de caducidad
                  </label>
                  <input
                    type="date"
                    value={form.fechaCaducidad}
                    onChange={(e) =>
                      setForm({ ...form, fechaCaducidad: e.target.value })
                    }
                    className="w-full bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <Info size={18} /> Descripción
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe los alimentos que estás donando..."
                  className="w-full bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm"
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Weight size={18} /> Cantidad
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.cantidad}
                    onChange={(e) =>
                      setForm({ ...form, cantidad: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Ruler size={18} /> Unidad de medida
                  </label>
                  <select
                    value={form.unidad}
                    onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                    className="w-full bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm"
                  >
                    <option value="">Seleccione...</option>
                    {unidades.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* UBICACIÓN */}
            <section className="mb-8 bg-[#faf6f1] border border-[#e5dacb] rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-5">
                <MapPin className="text-[#826c43]" /> Ubicación
              </h2>

              <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                Dirección
              </label>
              <input
                type="text"
                placeholder="Ej: Av. Heroínas 123, Cochabamba"
                className="w-full bg-white border border-[#dccdbb] rounded-xl px-4 py-3 shadow-sm mb-4"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              />

              <div className="rounded-xl overflow-hidden shadow-md border border-[#dccdbb]">
                <MapContainer
                  center={[
                    form.lat ?? -17.3895,
                    form.lng ?? -66.1568,
                  ]}
                  zoom={13}
                  style={{ height: "350px", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationSelector />
                  {form.lat && form.lng && (
                    <Marker position={[form.lat, form.lng]} />
                  )}
                </MapContainer>
              </div>

              <p className="text-sm text-gray-600 mt-3">
                Haz clic en el mapa para actualizar la ubicación exacta.
              </p>
            </section>

            {/* IMÁGENES */}
            <section className="mb-8 bg-[#faf6f1] border border-[#e5dacb] rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-5">
                <FileImage className="text-[#826c43]" /> Imágenes de la donación
              </h2>

              <div
                className="border-2 border-dashed border-[#826c43] rounded-xl p-10 text-center cursor-pointer hover:bg-[#f0e8dd] transition"
                onClick={() => document.getElementById("imageInputEdit")?.click()}
              >
                <CloudUpload size={55} className="mx-auto text-[#826c43] mb-3" />
                <p className="font-semibold text-gray-700">
                  Arrastra nuevas imágenes aquí
                </p>
                <p className="text-gray-500 text-sm">
                  o haz clic para seleccionar archivos (máx. 5)
                </p>
              </div>

              <input
                id="imageInputEdit"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              />

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        className="w-full h-32 object-cover rounded-xl shadow"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImages(images.filter((_, idx) => idx !== i))
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ACCIONES */}
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#826c43] to-[#e66748] text-white px-8 py-3 rounded-xl shadow-lg hover:scale-[1.03] transition"
              >
                <Heart size={18} /> Guardar cambios
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex items-center justify-center gap-2 bg-gray-300 text-gray-800 px-8 py-3 rounded-xl shadow-md hover:scale-[1.03] transition"
              >
                <ArrowLeft size={18} /> Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditDonation;
