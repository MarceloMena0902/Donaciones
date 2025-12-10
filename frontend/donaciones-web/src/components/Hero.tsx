import { Heart, Users, Globe, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import NavbarLogged from "../components/NavbarLogged";
import { useAuth } from "../context/AuthContext";

const Hero = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  return (
    <section className="w-full min-h-screen bg-gradient-to-r from-[#f5efe7] to-[#efe7dc]">
      
      {/* NAVBAR SEGÚN SESIÓN */}
      {loading ? null : user ? <NavbarLogged /> : <Navbar />}

      <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center gap-16 pt-28">

        {/* Texto */}
        <div className="flex-1">
          <h1 className="text-5xl font-extrabold leading-tight text-[#121212]">
            Bienvenido a{" "}
            <span className="bg-gradient-to-r from-[#b67343] to-[#e66748] text-transparent bg-clip-text">
              Cochabamba Comparte
            </span>
          </h1>

          <p className="text-gray-600 mt-4 max-w-lg">
            Una plataforma innovadora que conecta, informa y transforma.
            Descubre todas las funcionalidades que tenemos para ti.
          </p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate("/mapa-donantes")}
              className="border border-[#826c43] text-[#826c43] px-6 py-3 rounded-xl 
                         hover:bg-[#f0e8dd] flex items-center gap-2 transition-all hover:-translate-y-1"
            >
              <MapPin size={18} />
              VER MAPA
            </button>
          </div>
        </div>

        {/* Iconos flotantes */}
        <div className="relative flex-1 flex justify-center">

          <div className="w-64 h-64 rounded-full shadow-xl relative overflow-hidden bg-white flex items-center justify-center">
            <img src="/donacion1.png" alt="Donaciones" className="w-full h-full object-contain p-4" />
          </div>

          <div className="hidden md:block absolute -top-20 animate-float">
            <div className="bg-white shadow-md p-4 rounded-full">
              <Heart size={26} className="text-[#826c43]" />
            </div>
          </div>

          <div className="hidden md:block absolute right-0 top-20 animate-floatFast">
            <div className="bg-white shadow-md p-4 rounded-full">
              <Users size={26} className="text-[#826c43]" />
            </div>
          </div>

          <div className="hidden md:block absolute left-0 top-28 animate-floatSlow">
            <div className="bg-white shadow-md p-4 rounded-full">
              <Globe size={26} className="text-[#826c43]" />
            </div>
          </div>

          <div className="hidden md:block absolute -bottom-20 animate-float">
            <div className="bg-white shadow-md p-4 rounded-full">
              <Star size={26} className="text-[#826c43]" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
