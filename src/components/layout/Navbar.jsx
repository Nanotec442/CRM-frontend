import { Link } from "react-router-dom";
import logoPivot from "../../assets/imgPivot.png";

function Navbar() {
  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-white/30
        bg-[#dfe6ee]/80
        backdrop-blur-xl
      "
    >
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <img
              src={logoPivot}
              alt="Pivot 360"
              className="
                h-24 w-auto object-contain
                transition-transform duration-300
                group-hover:scale-[1.02]
              "
            />
          </Link>

          {/* NAV */}
          <nav className="flex items-center gap-3 sm:gap-5">

            <Link
              to="/"
              className="
                hidden md:block
                text-sm
                font-semibold
                tracking-[0.2em]
                uppercase
                text-[#416ee5]
                hover:opacity-70
                transition
              "
            >
              Inicio
            </Link>

            <Link
              to="/login"
              className="
                rounded-xl
                px-4 py-2.5
                text-sm
                font-semibold
                text-[#416ee5]
                hover:bg-white/50
                transition-all
              "
            >
              Iniciar sesión
            </Link>

            <Link
              to="/register"
              className="
                rounded-xl
                bg-[#416ee5]
                px-5 py-2.5
                text-sm
                font-semibold
                text-white
                shadow-lg shadow-blue-500/20
                hover:bg-[#3158c9]
                hover:shadow-blue-500/30
                transition-all
                active:scale-[0.98]
              "
            >
              Empezar
            </Link>

          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;