import { useMemo } from "react";

/**
 * Listado lateral de las próximas 5 reservas cronológicas.
 * Proporciona un vistazo rápido a la agenda inmediata del CRM.
 */
const ProximasReservas = ({ reservas = [] }) => {

  const proximas = useMemo(() => {
    const ahora = new Date();

    return reservas
      .filter(r => new Date(r.fecha_inicio) >= ahora)
      .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
      .slice(0, 5);
  }, [reservas]);

  const formatearFecha = (fecha) => {
    const f = new Date(fecha);
    return f.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatearHora = (fecha) => {
    const f = new Date(fecha);
    return f.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
        Próximas reservas
      </h3>

      {proximas.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs text-slate-500 font-medium italic">
            No hay reservas próximas registradas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {proximas.map((r) => (
            <div
              key={r.id}
              className="group p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                  {r.cliente?.nombre_completo || "Sin cliente"}
                </span>
                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">
                  {formatearFecha(r.fecha_inicio)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="opacity-70">🏢</span>
                <span className="truncate">{r.activo?.nombre || "Activo"}</span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  Comienza a las:
                </span>
                <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm">
                  {formatearHora(r.fecha_inicio)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProximasReservas;