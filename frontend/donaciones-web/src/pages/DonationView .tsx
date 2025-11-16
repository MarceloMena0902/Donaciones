import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Mail, Phone, Calendar, Utensils, Package, Info } from "lucide-react";
import NavbarLogged from "../components/NavbarLogged";

const DonationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- Mock temporal, luego lo reemplazas por tu API ---
  const donation = {
    id,
    donorId: 999, // ⭐ IMPORTANTE: Para el chat
    donorNombre: "Jesus",
    donorEmail: "jesus@gmail.com",
    donorTelefono: "64833517",
    tipoAlimento: "No perecedero",
    cantidad: "1223,00",
    unidadMedida: "kg",
    descripcion: "sdfasdfsdfasdf",
    ubicacion: "dfasdfdf",
    fechaCaducidad: "22/11/2025",
    estado: "Disponible",
    imagenes: [
      "https://i.pinimg.com/736x/7d/83/06/7d8306f69f8f0f39ce23e7ed0aa35e5e.jpg",
    ],
  };

  return (
    <div className="min-h-screen bg-[#f7f2eb]">
      <NavbarLogged />

      <div className="pt-24 pb-20 max-w-6xl mx-auto px-6">

        {/* TÍTULO */}
        <h1 className="text-4xl font-extrabold text-[#121212] mb-2">
          Detalles de la Donación
        </h1>
        <p className="text-gray-600 mb-12">
          Información completa del donante y del producto.
        </p>

        {/* CARD PRINCIPAL */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-[#e5d8c6] p-10 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#826c43] to-[#e66748]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* INFO DONANTE */}
            <div>
              <h2 className="text-2xl font-bold text-[#1d1d1d] mb-6 flex items-center gap-2">
                <Info size={26} className="text-[#826c43]" />
                Información del Donante
              </h2>

              <div className="space-y-4 text-gray-700">
                <div className="flex items-center gap-3">
                  <Package className="text-[#826c43]" />
                  <p><span className="font-semibold">Nombre:</span> {donation.donorNombre}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="text-[#826c43]" />
                  <p><span className="font-semibold">Email:</span> {donation.donorEmail}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="text-[#826c43]" />
                  <p><span className="font-semibold">Teléfono:</span> {donation.donorTelefono}</p>
                </div>
              </div>
            </div>

            {/* INFO PRODUCTO */}
            <div>
              <h2 className="text-2xl font-bold text-[#1d1d1d] mb-6 flex items-center gap-2">
                <Utensils size={26} className="text-[#826c43]" />
                Detalles del Producto
              </h2>

              <div className="space-y-4 text-gray-700">
                <p><span className="font-semibold">Tipo de Alimento:</span> {donation.tipoAlimento}</p>

                <p>
                  <span className="font-semibold">Cantidad:</span> {donation.cantidad} {donation.unidadMedida}
                </p>

                <p><span className="font-semibold">Descripción:</span> {donation.descripcion}</p>

                <p><span className="font-semibold">Ubicación:</span> {donation.ubicacion}</p>

                <div className="flex items-center gap-3">
                  <Calendar className="text-[#826c43]" />
                  <p><span className="font-semibold">Fecha de Caducidad:</span> {donation.fechaCaducidad}</p>
                </div>

                <p>
                  <span className="font-semibold">Estado:</span>{" "}
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                    {donation.estado}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* IMÁGENES */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-[#1d1d1d] mb-4">Imágenes</h2>

            <div className="flex gap-4">
              {donation.imagenes.map((img, idx) => (
                <div
                  key={idx}
                  className="w-40 h-40 rounded-xl shadow-md overflow-hidden border border-[#d6c7b7] hover:scale-105 transition-all cursor-pointer"
                >
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* BOTONES */}
          <div className="mt-12 flex gap-4">

            {/* BOTÓN: CONTACTAR */}
<Link to={`/chat/${donation.donorId}?name=${donation.donorNombre}`}
  className="bg-gradient-to-r from-[#826c43] to-[#e66748] text-white px-6 py-3 rounded-xl shadow hover:scale-105 transition flex items-center gap-2"
>
  <i className="fas fa-comments"></i> Contactar al Donante
</Link>


            {/* BOTÓN: VOLVER */}
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-[#826c43] text-[#826c43] font-semibold hover:bg-[#f7efe5] transition-all"
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
