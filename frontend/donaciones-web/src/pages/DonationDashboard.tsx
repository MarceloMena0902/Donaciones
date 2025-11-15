import { Heart, CheckCircle, Clock, Handshake, Plus, Eye, Edit, Trash2 } from "lucide-react";
import NavbarLogged from "../components/NavbarLogged";
import { Link } from "react-router-dom";

const mockDonaciones = [
  {
    id: 1,
    tipoAlimento: "Manzanas",
    descripcion: "Manzanas rojas frescas, cosecha del valle",
    cantidad: 5,
    unidadMedida: "kg",
    estado: "Disponible",
    fechaCaducidad: "2025-03-10",
    direccion: "Av. América esq. Pando",
    lat: -17.38231,
    lng: -66.16349,
    imagenes: [
      "/img/sample1.jpg",
      "/img/sample2.jpg",
    ],
  },
];

const DonationDashboard = () => {
  const donaciones = mockDonaciones;

  // Calculo de estadísticas
  const total = donaciones.length;
  const disponibles = donaciones.filter((d) => d.estado === "Disponible").length;
  const pendientes = donaciones.filter((d) => d.estado === "Pendiente").length;
  const entregadas = donaciones.filter((d) => d.estado === "Entregada").length;

  return (
    <>
      <NavbarLogged />

      <div className="pt-0">
        <div className="w-full min-h-screen bg-[#f5efe7] flex justify-center px-4 py-10 animate-fadeIn">
          <div className="w-full max-w-[1400px]">

            {/* HEADER */}
            <div className="bg-white rounded-2xl shadow-md p-10 border border-[#e5dacb] mb-10 relative overflow-hidden">

              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#826c43] to-[#e66748]" />

              <h1 className="text-4xl font-extrabold text-gray-800 flex items-center gap-3">
                <Heart className="text-[#826c43] w-10 h-10" />
                Mis Donaciones
              </h1>

              <p className="text-gray-600 mt-2 text-lg">
                Gestiona y administra tus donaciones de alimentos
              </p>

              {/* BOTÓN NUEVA DONACIÓN */}
              <Link
                to="/crear-donacion"
                className="absolute right-10 top-10 bg-gradient-to-r from-[#826c43] to-[#e66748] text-white px-6 py-3 rounded-xl shadow-md hover:scale-[1.03] transition-all flex items-center gap-2 font-semibold"
              >
                <Plus size={18} /> NUEVA DONACIÓN
              </Link>
            </div>

            {/* ESTADÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <StatCard
                icon={<Heart className="text-[#826c43]" />}
                label="Total Donaciones"
                value={total}
                color="from-[#826c43] to-[#a88a67]"
              />

              <StatCard
                icon={<CheckCircle className="text-green-600" />}
                label="Disponibles"
                value={disponibles}
                color="from-green-500 to-green-300"
              />

              <StatCard
                icon={<Clock className="text-yellow-500" />}
                label="Pendientes"
                value={pendientes}
                color="from-yellow-500 to-orange-400"
              />

              <StatCard
                icon={<Handshake className="text-blue-600" />}
                label="Entregadas"
                value={entregadas}
                color="from-blue-500 to-purple-400"
              />
            </div>

            {/* LISTA DE DONACIONES */}
            <div className="bg-white rounded-2xl shadow-lg border border-[#e5dacb] overflow-hidden">

              {/* Header de lista */}
              <div className="py-4 px-6 border-b border-[#e5dacb] bg-[#fffaf3]">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                  <Heart className="text-[#826c43]" />
                  Lista de Donaciones
                </h2>
              </div>

              {donaciones.length === 0 ? (
                /* ESTADO VACÍO */
                <div className="text-center py-20 flex flex-col items-center">
                  <Heart size={70} className="text-[#826c43] opacity-80 mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-700">
                    No tienes donaciones aún
                  </h3>

                  <p className="text-gray-500 mt-2 mb-6 text-lg">
                    Comienza a ayudar creando tu primera donación
                  </p>

                  <Link
                    to="/crear-donacion"
                    className="bg-gradient-to-r from-[#826c43] to-[#e66748] text-white px-6 py-3 rounded-xl shadow-md hover:scale-[1.03] transition-all flex items-center gap-2 text-lg font-semibold"
                  >
                    <Plus size={20} /> Crear Primera Donación
                  </Link>
                </div>
              ) : (
                /* LISTA CON DONACIONES */
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {donaciones.map((d) => (
                      <div
                        key={d.id}
                        className="bg-[#faf6f1] border border-[#e5dacb] rounded-xl shadow p-5 flex flex-col gap-4 hover:shadow-xl transition"
                      >
                        {/* Imagen */}
                        <img
                          src={d.imagenes[0]}
                          className="w-full h-40 object-cover rounded-xl"
                        />

                        {/* Info */}
                        <h3 className="text-xl font-bold text-gray-800">{d.tipoAlimento}</h3>
                        <p className="text-gray-600 text-sm">{d.descripcion}</p>

                        <p className="text-gray-700 font-semibold">
                          {d.cantidad} {d.unidadMedida}
                        </p>

                        {/* Botones */}
                        <div className="flex gap-2 justify-between mt-3">
                          <Link
                            to={`/donations/${d.id}`}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:scale-[1.03] transition"
                          >
                            <Eye size={18} />
                            Ver
                          </Link>

                          <Link
                            to={`/donations/${d.id}/editar`}
                            className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-white px-3 py-2 rounded-lg hover:scale-[1.03] transition"
                          >
                            <Edit size={18} />
                            Editar
                          </Link>

                          <Link
                            to={`/donations/${d.id}/eliminar`}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:scale-[1.03] transition"
                          >
                            <Trash2 size={18} />
                            Eliminar
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default DonationDashboard;

/* COMPONENTE DE TARJETA DE STATS */
const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) => (
  <div className="bg-white shadow-md hover:shadow-xl rounded-xl border border-[#e5dacb] px-8 py-6 flex items-center gap-6 transition-all cursor-pointer hover:-translate-y-1">
    <div
      className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}
    >
      <div className="text-white text-3xl">{icon}</div>
    </div>

    <div>
      <p className="text-4xl font-extrabold text-gray-800">{value}</p>
      <span className="text-gray-500 text-sm">{label}</span>
    </div>
  </div>
);
