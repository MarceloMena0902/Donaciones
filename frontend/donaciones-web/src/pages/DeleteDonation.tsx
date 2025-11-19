// src/pages/DeleteDonation.tsx
import NavbarLogged from "../components/NavbarLogged";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  AlertTriangle,
  Trash2,
  Utensils,
  Weight,
  Info,
  ArrowLeft,
} from "lucide-react";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import axios from "axios";

const DeleteDonation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // 1️⃣ Cargar donación desde backend
  // ============================================================
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/donations/${id}`);
        setDonation(res.data);
      } catch (err) {
        console.log("❌ Error al cargar donación:", err);
        Swal.fire("Error", "No se pudo cargar la donación.", "error");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ============================================================
  // 2️⃣ Confirmar eliminación
  // ============================================================
  const handleDelete = () => {
    Swal.fire({
      icon: "warning",
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e66748",
      cancelButtonColor: "#826c43",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await axios.delete(`http://localhost:4000/api/donations/${id}`);

        Swal.fire({
          icon: "success",
          title: "Donación eliminada",
          text: "La donación fue eliminada correctamente.",
          confirmButtonColor: "#826c43",
        }).then(() => navigate("/dashboard"));
      } catch (err) {
        console.log("❌ Error al eliminar:", err);
        Swal.fire("Error", "No se pudo eliminar la donación.", "error");
      }
    });
  };

  // ============================================================
  // 3️⃣ Loading
  // ============================================================
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Cargando información...
      </div>
    );

  if (!donation)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Donación no encontrada ❌
      </div>
    );

  // ============================================================
  // 4️⃣ UI
  // ============================================================
  return (
    <>
      <NavbarLogged />

      <div className="min-h-screen w-full bg-[#f5efe7] px-6 py-10 pt-24 relative overflow-hidden">
        {/* Partículas */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.18]">
          {[...Array(22)].map((_, i) => (
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

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="bg-white rounded-2xl shadow-xl border border-[#e5dacb] p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="text-red-500 w-9 h-9" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">
                Confirmar Eliminación
              </h1>
              <p className="text-gray-600">
                Esta acción no se puede deshacer. La donación será eliminada permanentemente.
              </p>
            </div>

            {/* Información de la donación */}
            <div className="bg-[#faf6f1] border border-[#e5dacb] rounded-xl p-5 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Detalles de la Donación
              </h2>

              <div className="space-y-4">
                <DetailRow
                  icon={<Utensils />}
                  label="Tipo"
                  value={donation.type}
                />

                <DetailRow
                  icon={<Weight />}
                  label="Cantidad"
                  value={`${donation.quantity} ${donation.unit}`}
                />

                <DetailRow
                  icon={<Info />}
                  label="Descripción"
                  value={donation.description}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 bg-red-500 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-red-600 hover:scale-[1.03] transition"
              >
                <Trash2 size={18} />
                Confirmar Eliminación
              </button>

              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-8 py-3 rounded-xl shadow-md hover:scale-[1.03] transition"
              >
                <ArrowLeft size={18} />
                Cancelar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteDonation;

// ============================================================
// COMPONENTE AUXILIAR PARA FILAS DE DETALLES
// ============================================================

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
      <span className="inline-flex w-7 h-7 rounded-full bg-gradient-to-br from-[#826c43] to-[#e66748] text-white items-center justify-center text-xs">
        {icon}
      </span>
      {label}
    </p>
    <div className="bg-white border border-[#e5dacb] rounded-lg px-3 py-2 text-gray-800 text-sm font-medium">
      {value}
    </div>
  </div>
);
