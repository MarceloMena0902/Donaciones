import { Heart, Users, Globe, Search, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
<section className="w-full h-screen flex items-center bg-gradient-to-r from-[#f5efe7] to-[#efe7dc]">

      <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center gap-16">

        {/* Texto */}
        <div className="flex-1">
          <h1 className="text-5xl font-extrabold leading-tight text-[#121212]">
            Bienvenido a{" "}
            <span className="bg-gradient-to-r from-[#b67343] to-[#e66748] text-transparent bg-clip-text">
              Cuba Project
            </span>
          </h1>

          <p className="text-gray-600 mt-4 max-w-lg">
            Una plataforma innovadora que conecta, informa y transforma.
            Descubre todas las funcionalidades que tenemos para ti.
          </p>

          <div className="flex gap-4 mt-8">

            <button className="bg-[#826c43] text-white px-6 py-3 rounded-xl shadow-md hover:bg-[#6d5938] flex items-center gap-2 transition-all hover:-translate-y-1">
              <Search size={18} /> 
              EXPLORAR
            </button>

            <button
              onClick={() => navigate("/mapa-donantes")}
              className="border border-[#826c43] text-[#826c43] px-6 py-3 rounded-xl hover:bg-[#f0e8dd] flex items-center gap-2 transition-all hover:-translate-y-1"
            >
              <MapPin size={18} />
              VER MAPA
            </button>

          </div>
        </div>

        {/* Círculo + Iconos flotantes */}
        <div className="relative flex-1 flex justify-center">

          {/* Círculo central */}
          <div className="w-64 h-64 bg-white rounded-full shadow-xl relative"></div>

          {/* Iconos flotando alrededor */}
          <div className="absolute -top-20 animate-float">
            <div className="bg-white shadow-md p-4 rounded-full">
              <Heart size={26} className="text-[#826c43]" />
            </div>
          </div>

          <div className="absolute right-0 top-20 animate-floatFast">
            <div className="bg-white shadow-md p-4 rounded-full">
              <Users size={26} className="text-[#826c43]" />
            </div>
          </div>

          <div className="absolute left-0 top-28 animate-floatSlow">
            <div className="bg-white shadow-md p-4 rounded-full">
              <Globe size={26} className="text-[#826c43]" />
            </div>
          </div>

          <div className="absolute -bottom-20 animate-float">
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
