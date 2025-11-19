import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
const navigate = useNavigate();

  return (
    <nav className="w-full bg-[#ece3d4] shadow-sm border-b border-[#d4c7b6]">
      <div className="max-w-[1700px] mx-auto px-10 py-4 flex justify-between items-center">

        {/* LOGO */}
<Link
  to="/"
  className="group relative text-2xl font-extrabold tracking-tight select-none"
>
  <span className="text-[#0d0d0d] group-hover:text-[#826c43] transition-colors">
    Cochabamba
  </span>
  <span className="text-[#826c43] group-hover:text-[#b56b37] transition-colors">
    comparte
  </span>

  {/* Barra animada */}
  <span className="absolute left-0 -bottom-1 w-0 h-[3px] bg-gradient-to-r from-[#826c43] to-[#e05b45] rounded-full group-hover:w-full transition-all duration-500"></span>
</Link>

        {/* MENU DESKTOP */}
        <div className="hidden md:flex items-center gap-10">

<Link
  to="/mapa-donantes"
  className="relative font-medium text-[#4a4a4a] hover:text-[#826c43] transition-colors
             after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#826c43]
             hover:after:w-full after:transition-all after:duration-300"
>
  MapaDonantes
</Link>

<button
  onClick={() => navigate("/login")}
  className="bg-[#826c43] text-white px-6 py-2 rounded-lg shadow hover:bg-[#6d5938] transition-all duration-200"
>
  INICIAR SESIÓN
</button>


<Link
  to="/register"
  className="relative font-semibold text-[#0c8f32] hover:text-[#0a7329] transition-colors
             after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#0c8f32]
             hover:after:w-full after:transition-all after:duration-300"
>
  CREAR CUENTA
</Link>
        </div>

        {/* BOTÓN MOBILE */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <div className="md:hidden flex flex-col px-10 pb-4 gap-4 bg-[#f4ecdf] border-t border-[#d4c7b6]">
          
          <Link
            to="/mapa-donantes"
            className="text-gray-700 font-medium hover:text-[#826c43]"
            onClick={() => setOpen(false)}
          >
            MapaDonantes
          </Link>

          <button className="bg-[#826c43] text-white px-6 py-2 rounded-lg shadow hover:bg-[#6d5938]">
            INICIAR SESIÓN
          </button>

          <Link
            to="/crear-cuenta"
            className="text-[#0c8f32] font-semibold hover:text-[#0a7329]"
            onClick={() => setOpen(false)}
          >
            CREAR CUENTA
          </Link>

        </div>
      )}
    </nav>
  );
};

export default Navbar;
