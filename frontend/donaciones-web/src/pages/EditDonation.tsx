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
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Fix Leaflet
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
  estado: string;
};

const unidades = ["kg", "L", "unidad", "caja"];
const today = new Date().toISOString().split("T")[0];

const EditDonation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<DonationForm | null>(null);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs de scroll
  const tipoRef = useRef<HTMLDivElement>(null);
  const fechaRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const cantidadRef = useRef<HTMLDivElement>(null);
  const unidadRef = useRef<HTMLDivElement>(null);
  const ubicacionRef = useRef<HTMLDivElement>(null);
  const imagenesRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<any>({});

  // ============================================================
  // Cargar donación existente
  // ============================================================
  useEffect(() => {
    const loadDonation = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/donations/${id}`);
        const data = res.data;

        // Obtener dirección
        let address = data.location?.address || "";
        if (data.location?.lat && data.location?.lng) {
          const geo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.location.lat}&lon=${data.location.lng}`
          );
          const geoJson = await geo.json();
          address = geoJson.display_name || address;
        }

        setForm({
          tipo: data.type,
          fechaCaducidad: data.expirationDate || "",
          descripcion: data.description,
          cantidad: data.quantity,
          unidad: data.unit,
          direccion: address,
          lat: data.location?.lat || null,
          lng: data.location?.lng || null,
          estado: data.status || "Disponible",
        });

        setExistingImages(data.images || []);
      } catch (err) {
        Swal.fire("Error", "No se pudo cargar la donación.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadDonation();
  }, [id]);

  // ============================================================
  // Mapa
  // ============================================================
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
          const address = data.display_name || "Dirección desconocida";

          setForm((prev) =>
            prev ? { ...prev, lat, lng, direccion: address } : prev
          );
        } catch (err) {
          console.log("Error reverse geocoding:", err);
        }
      },
    });

    return null;
  };

  // ============================================================
  // Nuevas imágenes
  // ============================================================
  const handleImageUpload = (files: FileList) => {
    const selected = Array.from(files);

    const totalActual = existingImages.length + newImages.length;
    const espaciosDisponibles = 5 - totalActual;

    if (espaciosDisponibles <= 0) return;

    const toAdd = selected.slice(0, espaciosDisponibles);
    setNewImages((prev) => [...prev, ...toAdd]);
  };

  const uploadNewImages = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const img of newImages) {
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

  // ============================================================
  // VALIDACIÓN COMPLETA (idéntica a CreateDonation)
  // ============================================================
  const validate = () => {
    if (!form) return false;

    const newErrors: any = {};

    if (!form.tipo) newErrors.tipo = "Seleccione un tipo de alimento";
    if (!form.fechaCaducidad) newErrors.fecha = "Seleccione una fecha válida";
    if (!form.descripcion.trim())
      newErrors.descripcion = "La descripción no puede estar vacía";
    if (!form.cantidad || form.cantidad <= 0)
      newErrors.cantidad = "La cantidad debe ser mayor a 0";
    if (!form.unidad) newErrors.unidad = "Seleccione una unidad";
    if (!form.lat || !form.lng)
      newErrors.ubicacion = "Seleccione un punto en el mapa";
    if (existingImages.length + newImages.length === 0)
      newErrors.imagenes = "Debe subir al menos una imagen";

    setErrors(newErrors);

    // SCROLL al primero
    if (newErrors.tipo && tipoRef.current)
      tipoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (newErrors.fecha && fechaRef.current)
      fechaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (newErrors.descripcion && descRef.current)
      descRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (newErrors.cantidad && cantidadRef.current)
      cantidadRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (newErrors.unidad && unidadRef.current)
      unidadRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (newErrors.ubicacion && ubicacionRef.current)
      ubicacionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (newErrors.imagenes && imagenesRef.current)
      imagenesRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // Guardar cambios
  // ============================================================
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form) return;

    if (!validate()) return;

    try {
      const uploaded = await uploadNewImages();
      const finalImages = [...existingImages, ...uploaded];

      await axios.put(`http://localhost:4000/api/donations/${id}`, {
        type: form.tipo,
        description: form.descripcion,
        quantity: form.cantidad,
        unit: form.unidad,
        expirationDate: form.fechaCaducidad,
        status: form.estado,
        location: {
          lat: form.lat,
          lng: form.lng,
          address: form.direccion,
        },
        images: finalImages,
      });

      Swal.fire({
        icon: "success",
        title: "Donación actualizada",
        confirmButtonColor: "#826c43",
      }).then(() => navigate("/dashboard"));
    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar la donación", "error");
    }
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (loading || !form)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Cargando información...
      </div>
    );

  // ============================================================
  // UI ORIGINAL + VALIDACIONES
  // ============================================================
  return (
    <>
      <NavbarLogged />

      <div className="min-h-screen w-full bg-[#f5efe7] px-6 py-10 pt-24">
        <div className="max-w-5xl mx-auto">

          {/* ------------ HEADER --------------- */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#e5dacb] mb-8">
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <Heart className="text-[#826c43]" /> Editar Donación
            </h1>
          </div>

          {/* ------------ FORMULARIO --------------- */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border">

            {/* ---------- INFO BÁSICA ---------- */}
            <section className="mb-8 bg-[#faf6f1] p-6 rounded-xl border">

              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Info className="text-[#826c43]" /> Información Básica
              </h2>

              {/* Tipo + Fecha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Tipo */}
                <div ref={tipoRef}>
                  <label className="font-semibold mb-2 flex items-center gap-2">
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
                    <p className="text-red-600 text-sm mt-1">{errors.tipo}</p>
                  )}
                </div>

                {/* Fecha */}
                <div ref={fechaRef}>
                  <label className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar size={18} /> Fecha de caducidad
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={form.fechaCaducidad}
                    onChange={(e) => {
                      setForm({ ...form, fechaCaducidad: e.target.value });
                      setErrors({ ...errors, fecha: "" });
                    }}
                    className={`w-full border rounded-xl px-4 py-3 ${
                      errors.fecha ? "border-red-500" : ""
                    }`}
                  />
                  {errors.fecha && (
                    <p className="text-red-600 text-sm mt-1">{errors.fecha}</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="mt-6" ref={descRef}>
                <label className="font-semibold mb-2 flex items-center gap-2">
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
                  <p className="text-red-600 text-sm mt-1">{errors.descripcion}</p>
                )}
              </div>

              {/* Cantidad + Unidad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                {/* Cantidad */}
                <div ref={cantidadRef}>
                  <label className="font-semibold mb-2 flex items-center gap-2">
                    <Weight size={18} /> Cantidad
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.cantidad}
                    onChange={(e) => {
                      setForm({ ...form, cantidad: Number(e.target.value) });
                      setErrors({ ...errors, cantidad: "" });
                    }}
                    className={`w-full border rounded-xl px-4 py-3 ${
                      errors.cantidad ? "border-red-500" : ""
                    }`}
                  />
                  {errors.cantidad && (
                    <p className="text-red-600 text-sm mt-1">{errors.cantidad}</p>
                  )}
                </div>

                {/* Unidad */}
                <div ref={unidadRef}>
                  <label className="font-semibold mb-2 flex items-center gap-2">
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
                    <p className="text-red-600 text-sm mt-1">{errors.unidad}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ---------- UBICACIÓN ---------- */}
            <section ref={ubicacionRef} className="mb-8 bg-[#faf6f1] p-6 rounded-xl border">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <MapPin className="text-[#826c43]" /> Ubicación
              </h2>

              <label className="font-semibold mb-2">Dirección</label>
              <input
                type="text"
                value={form.direccion}
                readOnly
                className="w-full border rounded-xl px-4 py-3 mb-4 bg-gray-100"
              />

              <div className="rounded-xl overflow-hidden border shadow">
                <MapContainer
                  center={[form.lat ?? -17.3895, form.lng ?? -66.1568]}
                  zoom={13}
                  style={{ height: "350px", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationSelector />
                  {form.lat && form.lng && <Marker position={[form.lat, form.lng]} />}
                </MapContainer>
              </div>

              {errors.ubicacion && (
                <p className="text-red-600 text-sm mt-2">{errors.ubicacion}</p>
              )}
            </section>

            {/* ---------- ESTADO ---------- */}
            <section className="mb-8 bg-[#faf6f1] p-6 rounded-xl border">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Heart className="text-[#826c43]" /> Estado
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Disponible", "Pendiente", "Entregada", "Cancelada"].map((estado) => (
                  <label
                    key={estado}
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border shadow-sm ${
                      form.estado === estado
                        ? "bg-[#dbeafe] border-blue-600"
                        : "bg-white border-[#dccdbb] hover:bg-[#f4ebdf]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="estado"
                      value={estado}
                      checked={form.estado === estado}
                      onChange={(e) =>
                        setForm({ ...form, estado: e.target.value })
                      }
                    />
                    <span className="font-semibold">{estado}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* ---------- IMÁGENES ---------- */}
            <section ref={imagenesRef} className="mb-8 bg-[#faf6f1] p-6 rounded-xl border">

              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <FileImage className="text-[#826c43]" /> Imágenes
              </h2>

              {/* Botón subir */}
              <div
                className="border-2 border-dashed border-[#826c43] rounded-xl p-10 text-center cursor-pointer"
                onClick={() => document.getElementById("imageInputEdit")?.click()}
              >
                <CloudUpload size={50} className="mx-auto text-[#826c43]" />
                <p className="font-semibold mt-3">Arrastra nuevas imágenes aquí</p>
                <p className="text-gray-500 text-sm">
                  o haz clic para seleccionar (máx. 5)
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

              {/* EXISTING IMAGES */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {existingImages.map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        className="w-full h-32 object-cover rounded-xl shadow"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full"
                        onClick={() =>
                          setExistingImages(existingImages.filter((_, idx) => idx !== i))
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* NEW IMAGES */}
              {newImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {newImages.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        className="w-full h-32 object-cover rounded-xl shadow"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full"
                        onClick={() =>
                          setNewImages(newImages.filter((_, idx) => idx !== i))
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.imagenes && (
                <p className="text-red-600 text-sm mt-2">{errors.imagenes}</p>
              )}

              <p className="text-gray-700 font-medium mt-2">
                {existingImages.length + newImages.length} / 5 imágenes
              </p>
            </section>

            {/* ---------- BOTONES ---------- */}
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
              <button
                type="submit"
                className="bg-gradient-to-r from-[#826c43] to-[#e66748] text-white px-8 py-3 rounded-xl shadow-lg"
              >
                Guardar cambios
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="bg-gray-300 text-gray-800 px-8 py-3 rounded-xl shadow-md"
              >
                Cancelar
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default EditDonation;
