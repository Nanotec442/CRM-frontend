import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  // Mejora de seguridad: Limpiamos toda la sesión al salir
  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    localStorage.removeItem("token"); 
    localStorage.removeItem("tenant_id");
    navigate("/login");
  };

  const linkBase =
    "block rounded-lg px-4 py-3 text-sm font-medium transition-colors";
  const linkActive = "bg-slate-800 text-white";
  const linkInactive = "text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-slate-950 text-white p-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">CRM PIVOT</h2>
        <p className="text-sm text-slate-400 mt-1 mb-8">Panel administrativo</p>

        <nav className="space-y-2">
          <NavLink
            to="/panel"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/panel/clientes"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Clientes
          </NavLink>
          
          <NavLink
            to="/panel/activos"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Activos
          </NavLink>

          <NavLink
            to="/panel/reservas"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Reservas
          </NavLink>

          <NavLink
            to="/panel/reportes"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Reportes
          </NavLink>

          <NavLink
            to="/panel/documentos"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Documentos
          </NavLink>

          <NavLink
            to="/panel/equipo"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Equipo
          </NavLink>

          <NavLink
            to="/panel/asistente-ia"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Asistente IA
          </NavLink>

          <NavLink
            to="/panel/configuracion"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
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