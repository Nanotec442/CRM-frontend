function ClienteList({ clientes, loading, onEditar, busqueda, setBusqueda, onNuevo }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Buscador */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        {loading ? (
          <SkeletonTable />
        ) : clientes.length === 0 ? (
          <EmptyState busqueda={busqueda} onNuevo={onNuevo} />
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clientes.map((c) => {
                const id = c.id ?? c.cliente_id;
                const iniciales = (c.nombre ?? "?")
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <tr
                    key={id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    {/* Nombre + avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {iniciales}
                        </div>
                        <span className="font-medium text-gray-900">
                          {c.nombre}
                        </span>
                      </div>
                    </td>

                    {/* Email + teléfono */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="text-gray-700">{c.email}</div>
                        {c.telefono && (
                          <div className="text-gray-400 text-xs">{c.telefono}</div>
                        )}
                      </div>
                    </td>

                    {/* Empresa */}
                    <td className="px-6 py-4 text-gray-600">
                      {c.empresa || <span className="text-gray-300">—</span>}
                    </td>

                    {/* Badge estado */}
                    <td className="px-6 py-4">
                      <EstadoBadge estado={c.estado ?? c.status} />
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onEditar(c)}
                        className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all opacity-0 group-hover:opacity-100"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer con conteo */}
      {!loading && clientes.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
          {clientes.length} resultado{clientes.length !== 1 ? "s" : ""}
          {busqueda && ` para "${busqueda}"`}
        </div>
      )}
    </div>
  );
}

function EstadoBadge({ estado }) {
  const map = {
    activo: { label: "Activo", cls: "bg-green-50 text-green-700 border-green-200" },
    inactivo: { label: "Inactivo", cls: "bg-gray-100 text-gray-500 border-gray-200" },
    prospecto: { label: "Prospecto", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    activa: { label: "Activo", cls: "bg-green-50 text-green-700 border-green-200" },
  };
  const key = (estado ?? "activo").toLowerCase();
  const { label, cls } = map[key] ?? map["activo"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

function SkeletonTable() {
  return (
    <div className="divide-y divide-gray-50">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/4" />
          </div>
          <div className="h-3 bg-gray-100 rounded w-1/4" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ busqueda, onNuevo }) {
  return (
    <div className="py-16 text-center text-gray-400">
      <div className="text-4xl mb-3">👥</div>
      {busqueda ? (
        <>
          <p className="font-medium text-gray-500">Sin resultados para "{busqueda}"</p>
          <p className="text-sm mt-1">Intenta con otro nombre, email o empresa.</p>
        </>
      ) : (
        <>
          <p className="font-medium text-gray-500">Aún no hay clientes</p>
          <p className="text-sm mt-1 mb-4">Agrega el primero para comenzar.</p>
          <button
            onClick={onNuevo}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Nuevo cliente
          </button>
        </>
      )}
    </div>
  );
}

export default ClienteList;