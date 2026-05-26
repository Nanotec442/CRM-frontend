import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useMemo } from "react";
import {
  X,
  LayoutDashboard,
  Users,
  Inbox,
  Boxes,
  CalendarDays,
  BarChart3,
  FileText,
  Bot,
  Settings,
  LogOut,
} from "lucide-react";

import logoPivot from "../../assets/pivot.png";

function Sidebar({ isOpen, onClose }) {
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

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const linkBase =
    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium tracking-wide transition-all duration-300";

  const linkActive =
    "bg-[#416ee5] text-white shadow-lg shadow-blue-500/20";

  const linkInactive =
    "text-[#3457b2] hover:bg-white/70 hover:text-[#416ee5]";

  const menuItems = [
    {
      to: "/panel",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/panel/clientes",
      label: "Clientes",
      icon: Users,
    },
    {
      to: "/panel/inbox",
      label: "Inbox",
      icon: Inbox,
    },
    {
      to: "/panel/activos",
      label: "Activos",
      icon: Boxes,
    },
    {
      to: "/panel/reservas",
      label: "Reservas",
      icon: CalendarDays,
    },
    {
      to: "/panel/reportes",
      label: "Reportes",
      icon: BarChart3,
    },
    {
      to: "/panel/documentos",
      label: "Documentos",
      icon: FileText,
    },
    {
      to: "/panel/asistente-ia",
      label: "Asistente IA",
      icon: Bot,
    },
    {
      to: "/panel/configuracion",
      label: "Configuración",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30
          w-72 h-full
          bg-[#dfe6ee]/90
          backdrop-blur-xl
          border-r border-white/30
          shadow-2xl
          p-5
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Botón cerrar móvil */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#416ee5] hover:scale-110 transition lg:hidden"
        >
          <X size={22} />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img
            src={logoPivot}
            alt="Logo Pivot 360"
            className="h-20 w-auto object-contain drop-shadow-sm"
          />

          <div className="mt-4 h-px w-16 bg-gradient-to-r from-transparent via-[#416ee5] to-transparent" />
        </div>

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <p className="text-xs uppercase tracking-[0.25em] text-[#6c85c7] font-semibold mb-4 px-2">
            Navegación
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/panel"}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `${linkBase} ${
                      isActive ? linkActive : linkInactive
                    }`
                  }
                >
                  <Icon
                    size={18}
                    className="transition-transform group-hover:scale-110"
                  />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {puedeAdministrarUsuarios && (
              <NavLink
                to="/panel/equipo"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive ? linkActive : linkInactive
                  }`
                }
              >
                <Users
                  size={18}
                  className="transition-transform group-hover:scale-110"
                />

                <span>Equipo</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Footer */}
        <div className="pt-5 mt-6 border-t border-white/40">
          <button
            onClick={handleLogout}
            className="
              w-full
              flex items-center justify-center gap-2
              rounded-2xl
              bg-white/70
              hover:bg-red-50
              border border-white/40
              py-3
              text-sm
              font-semibold
              text-[#416ee5]
              hover:text-red-500
              transition-all duration-300
            "
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;