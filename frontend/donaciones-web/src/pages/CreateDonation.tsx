// src/pages/CreateDonation.tsx
import { useState, useRef } from "react";
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

  const [errors, setErrors] = useState({
    tipo: "",
    fechaCaducidad: "",
    descripcion: "",
    cantidad: "",
    unidad: "",
    ubicacion: "",
    images: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const today = new Date().toLocaleDateString('en-CA');  // YYYY-MM-DD real sin UTC

  const API_URL = "http://localhost:4000/api/donations";

  // Refs para scroll
  const tipoRef = useRef<HTMLDivElement | null>(null);
  const fechaRef = useRef<HTMLDivElement | null>(null);
  const cantidadRef = useRef<HTMLDivElement | null>(null);
  const unidadRef = useRef<HTMLDivElement | null>(null);
  const ubicacionRef = useRef<HTMLDivElement | null>(null);
  const descripcionRef = useRef<HTMLDivElement | null>(null);
  const imagesRef = useRef<HTMLDivElement | null>(null);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Cargando usuario...
      </div>
    );

  // ------------------- 1) REVERSE GEOCODING -------------------
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

          setErrors((prev) => ({ ...prev, ubicacion: "" }));
        } catch (err) {
          console.log("Error obteniendo dirección:", err);
        }
      },
    });

    return null;
  };

  // ------------------- 2) Manejo de imágenes -------------------
  const handleImageUpload = (files: FileList) => {
    const selected = Array.from(files);
    const slots = 5 - images.length;
    if (slots <= 0) return;

    setImages([...images, ...selected.slice(0, slots)]);
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  // ------------------- 3) Subir imágenes -------------------
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

  // ------------------- 4) VALIDACIÓN COMPLETA -------------------
  const validateForm = (): boolean => {
    const newErrors = {
      tipo: "",
      fechaCaducidad: "",
      descripcion: "",
      cantidad: "",
      unidad: "",
      ubicacion: "",
      images: "",
    };

    if (!form.tipo) newErrors.tipo = "Debe seleccionar un tipo de alimento.";
    if (!form.fechaCaducidad)
      newErrors.fechaCaducidad = "Debe ingresar una fecha válida.";
    if (form.cantidad <= 0)
      newErrors.cantidad = "La cantidad debe ser mayor a 0.";
    if (!form.unidad) newErrors.unidad = "Debe seleccionar una unidad.";
    if (!form.lat || !form.lng)
      newErrors.ubicacion = "Debe seleccionar una ubicación en el mapa.";
    if (!form.descripcion.trim())
      newErrors.descripcion = "Debe ingresar una descripción.";
    if (images.length === 0)
      newErrors.images = "Debe subir al menos una imagen.";

    setErrors(newErrors);

    // ORDEN DE SCROLL
    if (newErrors.tipo && tipoRef.current)
      tipoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (newErrors.fechaCaducidad && fechaRef.current)
      fechaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (newErrors.cantidad && cantidadRef.current)
      cantidadRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (newErrors.unidad && unidadRef.current)
      unidadRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (newErrors.ubicacion && ubicacionRef.current)
      ubicacionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (newErrors.descripcion && descripcionRef.current)
      descripcionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (newErrors.images && imagesRef.current)
      imagesRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

    return !Object.values(newErrors).some((msg) => msg !== "");
  };

  // ------------------- 5) Submit -------------------
  const submitDonation = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
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
        expirationDate: form.fechaCaducidad,
        images: imageUrls,
      };

      await axios.post(API_URL, donationToSend);

      Swal.fire({
        icon: "success",
        title: "Donación creada",
        text: "Se registró correctamente 🎉",
        confirmButtonColor: "#826c43",
      }).then(() => (window.location.href = "/dashboard"));
    } catch (err) {
      console.log("Error:", err);
      Swal.fire({
        icon: "error",
        title: "Error al crear donación",
        text: "Revisa los datos o intenta nuevamente",
        confirmButtonColor: "#e66748",
      });
    }
  };

  // ------------------- 6) UI -------------------
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
          {/* INFORMACIÓN BÁSICA */}
          <section className="mb-10 bg-[#faf6f1] border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-5 flex gap-2 items-center">
              <Info className="text-[#826c43]" /> Información Básica
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo */}
              <div ref={tipoRef}>
                <label className="font-semibold mb-2 flex gap-2 items-center">
                  <Apple size={18} /> Tipo de alimento
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => {
                    setForm({ ...form, tipo: e.target.value });
                    setErrors({ ...errors, tipo: "" });
                  }}
                  className={`w-full border rounded-xl px-4 py-3 ${
                    errors.tipo ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Seleccione...</option>
                  <option value="Perecedero">Perecedero</option>
                  <option value="No perecedero">No perecedero</option>
                  <option value="Preparado">Preparado</option>
                </select>
                {errors.tipo && (
                  <p className="text-red-600 text-sm">{errors.tipo}</p>
                )}
              </div>

              {/* Fecha */}
              <div ref={fechaRef}>
                <label className="font-semibold mb-2 flex gap-2 items-center">
                  <Calendar size={18} /> Fecha de caducidad
                </label>
                <input
                  type="date"
                  min={today}
                  value={form.fechaCaducidad}
                  onChange={(e) => {
                    setForm({ ...form, fechaCaducidad: e.target.value });
                    setErrors({ ...errors, fechaCaducidad: "" });
                  }}
                  className={`w-full border rounded-xl px-4 py-3 ${
                    errors.fechaCaducidad ? "border-red-500" : ""
                  }`}
                />
                {errors.fechaCaducidad && (
                  <p className="text-red-600 text-sm">{errors.fechaCaducidad}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-6" ref={descripcionRef}>
              <label className="font-semibold mb-2 flex gap-2 items-center">
                <Info size={18} /> Descripción
              </label>
              <textarea
                rows={4}
                value={form.descripcion}
                onChange={(e) => {
                  setForm({ ...form, descripcion: e.target.value });
                  setErrors({ ...errors, descripcion: "" });
                }}
                className={`w-full border rounded-xl px-4 py-3 ${
                  errors.descripcion ? "border-red-500" : ""
                }`}
              />
              {errors.descripcion && (
                <p className="text-red-600 text-sm">{errors.descripcion}</p>
              )}
            </div>

            {/* Cantidad y unidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Cantidad */}
              <div ref={cantidadRef}>
                <label className="font-semibold mb-2 flex gap-2 items-center">
                  <Weight size={18} /> Cantidad
                </label>
                <input
                  type="number"
                  value={form.cantidad}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setForm({ ...form, cantidad: v });
                    setErrors({
                      ...errors,
                      cantidad: v <= 0 ? "La cantidad debe ser mayor a 0." : "",
                    });
                  }}
                  className={`w-full border rounded-xl px-4 py-3 ${
                    errors.cantidad ? "border-red-500" : ""
                  }`}
                />
                {errors.cantidad && (
                  <p className="text-red-600 text-sm">{errors.cantidad}</p>
                )}
              </div>

              {/* Unidad */}
              <div ref={unidadRef}>
                <label className="font-semibold mb-2 flex gap-2 items-center">
                  <Ruler size={18} /> Unidad
                </label>
                <select
                  value={form.unidad}
                  onChange={(e) => {
                    setForm({ ...form, unidad: e.target.value });
                    setErrors({ ...errors, unidad: "" });
                  }}
                  className={`w-full border rounded-xl px-4 py-3 ${
                    errors.unidad ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Seleccione...</option>
                  {unidades.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
                {errors.unidad && (
                  <p className="text-red-600 text-sm">{errors.unidad}</p>
                )}
              </div>
            </div>
          </section>

          {/* UBICACIÓN */}
          <section
            ref={ubicacionRef}
            className="mb-10 bg-[#faf6f1] border rounded-xl p-6"
          >
            <h2 className="text-xl font-bold mb-5 flex gap-2 items-center">
              <MapPin className="text-[#826c43]" /> Ubicación
            </h2>

            <label className="font-semibold">Dirección (automática)</label>
            <input
              type="text"
              value={form.direccion}
              readOnly
              className={`w-full border rounded-xl px-4 py-3 mb-4 bg-gray-100 ${
                errors.ubicacion ? "border-red-500" : ""
              }`}
            />

            {errors.ubicacion && (
              <p className="text-red-600 text-sm -mt-3 mb-3">
                {errors.ubicacion}
              </p>
            )}

            <div className="rounded-xl overflow-hidden border shadow">
              <MapContainer
                center={[-17.3895, -66.1568]}
                zoom={13}
                style={{ height: "350px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationSelector />
                {form.lat && form.lng && <Marker position={[form.lat, form.lng]} />}
              </MapContainer>
            </div>

            <p className="text-sm text-gray-600 mt-3">
              Selecciona un punto en el mapa para obtener la dirección exacta.
            </p>
          </section>

          {/* IMÁGENES */}
          <section
            ref={imagesRef}
            className="mb-10 bg-[#faf6f1] border rounded-xl p-6"
          >
            <h2 className="text-xl font-bold mb-5 flex gap-2 items-center">
              <FileImage className="text-[#826c43]" /> Imágenes
            </h2>

            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer ${
                errors.images ? "border-red-500" : "border-[#826c43]"
              }`}
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

            {errors.images && (
              <p className="text-red-600 text-sm mt-2">{errors.images}</p>
            )}

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
              <p className="text-sm mt-2">{images.length} / 5 imágenes</p>
            )}
          </section>

          {/* BOTONES */}
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
