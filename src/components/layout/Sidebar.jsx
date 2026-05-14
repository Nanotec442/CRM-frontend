import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useMemo } from "react";
import logoPivot from "../../assets/pivot.png";

function Sidebar() {
  const navigate = useNavigate();

  const puedeAdministrarUsuarios = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const payload = jwtDecode(token);
      if (payload.is_superadmin) return true;
      return payload.permisos?.administrar_usuarios === true;
    } catch {
      return false;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    localStorage.removeItem("token");
    localStorage.removeItem("tenant_id");
    navigate("/login");
  };

  const linkBase = "block rounded-lg px-4 py-3 text-sm font-medium transition-colors";
  const linkActive = "bg-slate-800 text-white";
  const linkInactive = "text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-slate-950 text-white p-4">
      <div className="mb-8 grow">
        
        {/* Contenedor de la imagen agregado aquí */}
        <div className="flex justify-center mb-6">
          <img
            src={logoPivot}
            alt="Logo Pivot 360 Software Hub"
            className="h-16 w-auto object-contain"
          />
        </div>

        <h2 className="text-3 font-bold text-center">Panel administrativo</h2>
        <p className="text-sm text-slate-400 mt-1 mb-8"></p>

        <nav className="space-y-2">
          <NavLink
            to="/panel"
            end
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/panel/clientes"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            Gestión de Clientes
          </NavLink>

          <NavLink
            to="/panel/inbox"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            Inbox
          </NavLink>

          <NavLink
            to="/panel/activos"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            Activos
          </NavLink>

          <NavLink
            to="/panel/reservas"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            Reservas
          </NavLink>

          <NavLink
            to="/panel/reportes"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            Reportes
          </NavLink>

          <NavLink
            to="/panel/documentos"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            Gestión Documental
          </NavLink>

          {puedeAdministrarUsuarios && (
            <NavLink
              to="/panel/equipo"
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
            >
              Gestión de Usuario
            </NavLink>
          )}

          <NavLink
            to="/panel/asistente-ia"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            Asistente IA
          </NavLink>

          <NavLink
            to="/panel/configuracion"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            Configuración
          </NavLink>
        </nav>
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;