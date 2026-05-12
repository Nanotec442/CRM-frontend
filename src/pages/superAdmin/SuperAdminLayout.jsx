import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, LayoutDashboard, LogOut, Shield } from "lucide-react";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/superadmin" },
  { id: "empresas",  label: "Empresas",  icon: Building2,      path: "/superadmin/empresas" },
];

export default function SuperAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenant_id");
    localStorage.removeItem("isAuth");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">PIVOT Admin</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Panel Global</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/superadmin"
              ? location.pathname === "/superadmin"
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}