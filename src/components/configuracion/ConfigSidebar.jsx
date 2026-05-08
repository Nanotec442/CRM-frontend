export default function ConfigSidebar({ active, setActive }) {
  const menuItems = [
    { id: "perfil",       label: "Perfil de Usuario",          icon: "👤" },
    { id: "empresa",      label: "Datos de Empresa",           icon: "🏢" },
    { id: "roles",        label: "Roles y Permisos",           icon: "🛡️" },
    { id: "reservas_online", label: "Reservas Online",         icon: "🔗" },
    { id: "documentos",   label: "Carga Inteligente de Datos", icon: "📄" },
    { id: "seguridad",    label: "Entrenar IA",                icon: "📜" },
    { id: "preferencias", label: "Conectar a WhatsApp",        icon: "✅" },
  ];

  return (
    <nav className="flex flex-col space-y-1">
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
  );
}