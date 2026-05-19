export default function ConfigSidebar({ active, setActive }) {
  const menuItems = [
    { id: "perfil",          label: "Perfil de Usuario",          icon: "👤" },
    { id: "empresa",         label: "Datos de Empresa",           icon: "🏢" },
    { id: "roles",           label: "Roles y Permisos",           icon: "🛡️" },
    { id: "reservas_online", label: "Reservas Online",            icon: "🔗" },
    { id: "documentos",      label: "Carga Inteligente de Datos", icon: "📄" },
    { id: "seguridad",       label: "Entrenar IA",                icon: "📜" },
    { id: "whatsapp",        label: "Conectar a WhatsApp",        icon: "✅" },
  ];

  return (
    <>
      {/* Móvil — scroll horizontal */}
      <nav className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-none">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all shrink-0 ${
              active === item.id
                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                : "text-slate-600 bg-slate-100 hover:bg-slate-200"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Desktop — columna vertical */}
      <nav className="hidden lg:flex flex-col space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              active === item.id
                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}