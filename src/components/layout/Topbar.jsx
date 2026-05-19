import { useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { Menu } from "lucide-react";

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
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between lg:justify-end">
      {/* Botón hamburguesa — solo visible en móvil */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-700">
            {usuario?.nombre ?? "Usuario"}
          </p>
          <p className="text-xs text-slate-400">
            {usuario?.is_superadmin ? "Super Administrador" : "Administrador"}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-800 text-white text-sm font-bold flex items-center justify-center shadow-sm">
          {iniciales}
        </div>
      </div>
    </header>
  );
}

export default Topbar;