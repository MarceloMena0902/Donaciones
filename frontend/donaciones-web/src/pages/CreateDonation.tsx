// src/pages/CreateDonation.tsx
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

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

import NavbarLogged from "../components/NavbarLogged";

// Fix Leaflet marker icons
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

const CreateDonation = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<DonationForm>({
    tipo: "",
    fechaCaducidad: "",
    descripcion: "",
    cantidad: 0,
    unidad: "",
    direccion: "",
    lat: null,
    lng: null,
  });

  const [images, setImages] = useState<File[]>([]);
  const today = new Date().toISOString().split("T")[0];

  const API_URL = "http://localhost:4000/api/donations";

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Cargando usuario...
      </div>
    );

  // ----------------------------------------------------------------
  // 1️⃣ Reverse geocoding (obtener dirección AUTOMÁTICA del pin)
  // ----------------------------------------------------------------
  const LocationSelector = () => {
    useMapEvents({
      click: async (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          const address = data.display_name || "Dirección no encontrada";

          setForm((prev) => ({
            ...prev,
            lat,
            lng,
            direccion: address,
          }));
        } catch (err) {
          console.log("Error obteniendo dirección:", err);
        }
      },
    });

    return null;
  };

  // ----------------------------------------------------------------
  // 2️⃣ Manejo de nuevas imágenes (máx 5)
  // ----------------------------------------------------------------
  const handleImageUpload = (files: FileList) => {
    const selected = Array.from(files);
    const total = images.length;
    const slots = 5 - total;

    if (slots <= 0) return;

    setImages([...images, ...selected.slice(0, slots)]);
  };

  // ----------------------------------------------------------------
  // 3️⃣ Subir imágenes → Cloudinary vía backend
  // ----------------------------------------------------------------
  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const img of images) {
      const formData = new FormData();
      formData.append("image", img);

      const res = await axios.post(
        "http://localhost:4000/api/donations/upload-image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      urls.push(res.data.url);
    }

    return urls;
  };

  // ----------------------------------------------------------------
  // 4️⃣ Enviar donación al backend
  // ----------------------------------------------------------------
  const submitDonation = async (e: any) => {
    e.preventDefault();

    if (!form.tipo || !form.descripcion || !form.unidad || !form.lat || !form.lng) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Completa los campos requeridos.",
        confirmButtonColor: "#e66748",
      });
      return;
    }

    try {
      // 🔥 Primero subir imágenes
      const imageUrls = await uploadImages();

      const donationToSend = {
        userId: user.uid,
        type: form.tipo,
        description: form.descripcion,
        quantity: form.cantidad,
        unit: form.unidad,
        location: {
          address: form.direccion,
          lat: form.lat,
          lng: form.lng,
        },
        expirationDate: form.fechaCaducidad || null,
        images: imageUrls,
      };

      await axios.post(API_URL, donationToSend);

      Swal.fire({
        icon: "success",
        title: "Donación creada",
        text: "Se registró correctamente 🎉",
        confirmButtonColor: "#826c43",
      }).then(() => (window.location.href = "/dashboard"));
    } catch (err: any) {
      console.log("Error:", err);

      Swal.fire({
        icon: "error",
        title: "Error al crear donación",
        text: "Revisa los datos o intenta nuevamente",
        confirmButtonColor: "#e66748",
      });
    }
  };

  // ----------------------------------------------------------------
  // 5️⃣ UI
  // ----------------------------------------------------------------
  return (
    <>
      <NavbarLogged />

      <div className="min-h-screen w-full bg-[#f5efe7] pt-10 pb-10">
        <div className="max-w-5xl mx-auto mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#e5dacb]">
            <h1 className="text-4xl font-extrabold text-gray-800 flex items-center gap-3">
              <Heart className="text-[#826c43]" />
              Crear Nueva Donación
            </h1>
            <p className="text-gray-600 mt-2">
              Comparte alimentos y ayuda a tu comunidad ❤️
            </p>
          </div>
        </div>

        <form
          onSubmit={submitDonation}
          className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-10 border"
        >
          {/* ---------------------- INFORMACIÓN ---------------------- */}
          <section className="mb-10 bg-[#faf6f1] border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-5 flex gap-2 items-center">
              <Info className="text-[#826c43]" /> Información Básica
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo */}
              <div>
                <label className="font-semibold mb-2 flex gap-2 items-center">
                  <Apple size={18} /> Tipo de alimento
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="">Seleccione...</option>
                  <option value="Perecedero">Perecedero</option>
                  <option value="No perecedero">No perecedero</option>
                  <option value="Preparado">Preparado</option>
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="font-semibold mb-2 flex gap-2 items-center">
                  <Calendar size={18} /> Fecha de caducidad
                </label>
                <input
                  type="date"
                  min={today}            // 🔥 evita elegir fechas pasadas
                  value={form.fechaCaducidad}
                  onChange={(e) =>
                    setForm({ ...form, fechaCaducidad: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-6">
              <label className="font-semibold mb-2 flex gap-2 items-center">
                <Info size={18} /> Descripción
              </label>
              <textarea
                rows={4}
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            {/* Cantidad + Unidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="font-semibold mb-2 flex gap-2 items-center">
                  <Weight size={18} /> Cantidad
                </label>
                <input
                  type="number"
                  value={form.cantidad}
                  min={1}
                  onChange={(e) =>
                    setForm({ ...form, cantidad: Number(e.target.value) })
                  }
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="font-semibold mb-2 flex gap-2 items-center">
                  <Ruler size={18} /> Unidad
                </label>
                <select
                  value={form.unidad}
                  onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="">Seleccione...</option>
                  {unidades.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ---------------------- UBICACIÓN ---------------------- */}
          <section className="mb-10 bg-[#faf6f1] border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-5 flex gap-2 items-center">
              <MapPin className="text-[#826c43]" /> Ubicación
            </h2>

            <label className="font-semibold">Dirección (automática)</label>
            <input
              type="text"
              value={form.direccion}
              readOnly
              className="w-full border rounded-xl px-4 py-3 mb-4 bg-gray-100"
            />

            <div className="rounded-xl overflow-hidden border shadow">
              <MapContainer
                center={[-17.3895, -66.1568]}
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
              Selecciona un punto en el mapa para obtener la dirección exacta.
            </p>
          </section>

          {/* ---------------------- IMÁGENES ---------------------- */}
          <section className="mb-10 bg-[#faf6f1] border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-5 flex gap-2 items-center">
              <FileImage className="text-[#826c43]" /> Imágenes
            </h2>

            <div
              className="border-2 border-dashed border-[#826c43] rounded-xl p-10 text-center cursor-pointer"
              onClick={() => document.getElementById("imageInput")?.click()}
            >
              <CloudUpload size={55} className="mx-auto text-[#826c43]" />
              <p className="font-semibold mt-2">
                Arrastra imágenes o haz clic aquí
              </p>
              <p className="text-sm text-gray-500">(máximo 5 imágenes)</p>
            </div>

            <input
              id="imageInput"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files!)}
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
                      className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length > 0 && (
              <p className="text-sm">
                {images.length} / 5 imágenes
              </p>
            )}
          </section>

          {/* ---------------------- BOTONES ---------------------- */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
            <button
              type="submit"
              className="bg-gradient-to-r from-[#826c43] to-[#e66748] text-white px-8 py-3 rounded-xl shadow-lg"
            >
              Crear Donación
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = "/dashboard")}
              className="bg-gray-300 px-8 py-3 rounded-xl shadow"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateDonation;
