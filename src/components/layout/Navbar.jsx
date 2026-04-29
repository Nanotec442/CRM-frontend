import { Link } from "react-router-dom";
import { Hexagon } from "lucide-react"; // Ícono para darle un toque corporativo al logo

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md transition-all font-sans">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* --- LOGO --- */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-2xl font-bold text-slate-900 tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
            <Hexagon size={20} fill="currentColor" strokeWidth={1} />
          </div>
          PIVOT <span className="text-indigo-600">360</span>
        </Link>

        {/* --- NAVEGACIÓN Y BOTONES --- */}
        <nav className="flex items-center gap-5 sm:gap-6">
          
          <Link
            to="/"
            className="hidden sm:block text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            Inicio
          </Link>

          {/* Separador vertical sutil (solo en pantallas medianas o más grandes) */}
          <div className="hidden sm:block h-4 w-px bg-slate-200"></div> 

          <Link
            to="/login"
            className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Iniciar sesión
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            Comenzar gratis
          </Link>
          
        </nav>
      </div>
    </header>
  );
}

export default Navbar;