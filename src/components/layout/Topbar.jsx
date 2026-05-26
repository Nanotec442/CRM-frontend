import { useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { Menu, Bell } from "lucide-react";

function Topbar({ onMenuClick }) {
  const usuario = useMemo(() => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return null;

      const payload = jwtDecode(token);

      return {
        nombre: payload.nombre
          ? `${payload.nombre} ${payload.apellido ?? ""}`.trim()
          : payload.sub?.split("@")[0] ?? "Usuario",

        is_superadmin: payload.is_superadmin ?? false,
      };
    } catch {
      return null;
    }
  }, []);

  const iniciales = useMemo(() => {
    if (!usuario?.nombre) return "U";

    return usuario.nombre
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("");
  }, [usuario]);

  return (
    <header
      className="
        h-19.5
        px-4 sm:px-6 lg:px-8
        flex items-center justify-between
      "
    >
      {/* MOBILE MENU */}
      <button
        onClick={onMenuClick}
        className="
          lg:hidden
          rounded-xl
          p-2.5
          text-[#416ee5]
          hover:bg-white/50
          transition
        "
      >
        <Menu size={22} />
      </button>

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-4">


        {/* User */}
        <div
          className="
            flex items-center gap-3
            rounded-2xl
            bg-white/60
            border border-white/40
            px-3 py-2
            shadow-sm
          "
        >
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-[#24408f]">
              {usuario?.nombre ?? "Usuario"}
            </p>

            <p className="text-xs text-[#6b84c5]">
              {usuario?.is_superadmin
                ? "Super Administrador"
                : "Administrador"}
            </p>
          </div>

          <div
            className="
              h-11 w-11
              rounded-2xl
              bg-[#416ee5]
              flex items-center justify-center
              text-sm font-bold text-white
              shadow-lg shadow-blue-500/20
            "
          >
            {iniciales}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;