import React, { useMemo } from "react";
import { Edit2, PenTool, FileSignature, KanbanSquare, ToggleLeft, ToggleRight } from "lucide-react";

function ClienteList({
  clientes,
  loading,
  onEditar,
  busqueda,
  setBusqueda,
  onNuevo,
  onFirmarFisica,
  onFirmarLegal,
  onMoverAPipeline,
  onToggleEstado,  // ← NUEVO: recibe función para activar/desactivar
}) {
  const clientesUnicos = useMemo(() => {
    if (!Array.isArray(clientes)) return [];
    const seen = new Set();
    const resultado = [];
    for (const c of clientes) {
      if (!c) continue;
      const key = c.id ?? c.cliente_id ?? c.email ?? `${c.nombre}-${c.telefono}`;
      if (!key) continue;
      if (!seen.has(key)) {
        seen.add(key);
        resultado.push(c);
      }
    }
    return resultado;
  }, [clientes]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">

      {/* Buscador */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg font-medium transition-colors"
              title="Limpiar búsqueda"
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
        ) : clientesUnicos.length === 0 ? (
          <EmptyState busqueda={busqueda} onNuevo={onNuevo} />
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clientesUnicos.map((c) => {
                const id = c.id ?? c.cliente_id ?? c.email ?? `${c.nombre}-${c.telefono}`;
                const nombreSeguro = c.nombre ?? "Sin nombre";
                const iniciales = nombreSeguro
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0] ?? "")
                  .join("")
                  .toUpperCase();

                const estadoActual = (c.estado ?? "Activo").toLowerCase();
                const estaActivo = estadoActual === "activo" || estadoActual === "activa" || estadoActual === "nuevo";

                return (
                  <tr key={String(id)} className="hover:bg-slate-50/80 transition-colors group">

                    {/* Nombre */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-800 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                          {iniciales}
                        </div>
                        <span className="font-semibold text-slate-900">{c.nombre}</span>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-slate-600 font-medium">{c.email}</div>
                        {c.telefono && (
                          <div className="text-slate-400 text-xs">{c.telefono}</div>
                        )}
                      </div>
                    </td>

                    {/* Empresa */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {c.empresa ? (
                        <span className="font-medium text-slate-700 flex items-center gap-1.5">
                          <span className="text-slate-400"></span> {c.empresa}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Sin empresa</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EstadoBadge estado={c.estado} />
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">

                        {/* Activar / Desactivar */}
                        <button
                          onClick={() => onToggleEstado(c.id ?? c.cliente_id, estaActivo)}
                          title={estaActivo ? "Desactivar cliente" : "Activar cliente"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            estaActivo
                              ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                              : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {estaActivo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>

                        {/* Pipeline */}
                        <button
                          onClick={() => onMoverAPipeline(c.id ?? c.cliente_id)}
                          title="Crear Oportunidad en Pipeline"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <KanbanSquare size={18} />
                        </button>

                        <button
                          onClick={() => onFirmarFisica(c.id ?? c.cliente_id)}
                          title="Firma Rápida en Pantalla"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <PenTool size={18} />
                        </button>

                        <button
                          onClick={() => onFirmarLegal(c.id ?? c.cliente_id)}
                          title="Enviar Contrato Legal"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <FileSignature size={18} />
                        </button>

                        <div className="w-px h-4 bg-slate-200 mx-1" />

                        <button
                          onClick={() => onEditar(c)}
                          title="Editar Cliente"
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && clientesUnicos.length > 0 && (
        <div className="px-6 py-3.5 border-t border-slate-100 text-xs font-medium text-slate-500 bg-slate-50/30">
          {clientesUnicos.length} resultado{clientesUnicos.length !== 1 ? "s" : ""}
          {busqueda && ` para "${busqueda}"`}
        </div>
      )}
    </div>
  );
}

// Estados válidos del cliente — cualquier otro valor se trata como "Nuevo"
const ESTADOS_VALIDOS = ["activo", "activa", "inactivo", "archivado", "prospecto", "nuevo"];

function EstadoBadge({ estado }) {
  const map = {
    activo:    { label: "Activo",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    activa:    { label: "Activo",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    nuevo:     { label: "Nuevo",     cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    inactivo:  { label: "Inactivo",  cls: "bg-slate-100 text-slate-600 border-slate-200" },
    archivado: { label: "Archivado", cls: "bg-rose-50 text-rose-600 border-rose-200" },
    prospecto: { label: "Prospecto", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  };

  const key = (estado ?? "nuevo").toLowerCase();

  // Si el estado no es un valor válido (ej: nombre de columna del pipeline), mostrar "Nuevo"
  const esValido = ESTADOS_VALIDOS.includes(key);
  const { label, cls } = esValido
    ? map[key]
    : { label: "Nuevo", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

function SkeletonTable() {
  return (
    <div className="divide-y divide-slate-50">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
          <div className="w-9 h-9 bg-slate-200 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-3 bg-slate-200 rounded w-1/3" />
            <div className="h-2.5 bg-slate-100 rounded w-1/4" />
          </div>
          <div className="h-2.5 bg-slate-100 rounded w-1/4" />
          <div className="h-6 bg-slate-100 rounded-md w-16" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ busqueda, onNuevo }) {
  return (
    <div className="py-20 text-center flex flex-col items-center justify-center">
      <div className="text-4xl mb-4 opacity-50">👥</div>
      {busqueda ? (
        <>
          <p className="text-base font-semibold text-slate-800">Sin resultados para "{busqueda}"</p>
          <p className="text-sm text-slate-500 mt-1">Intenta con otro nombre, email o empresa.</p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold text-slate-800">Aún no hay clientes</p>
          <p className="text-sm text-slate-500 mt-1 mb-5">Agrega el primero para comenzar a gestionar tu cartera.</p>
          <button
            onClick={onNuevo}
            className="text-sm font-medium bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            + Nuevo cliente
          </button>
        </>
      )}
    </div>
  );
}

export default ClienteList;