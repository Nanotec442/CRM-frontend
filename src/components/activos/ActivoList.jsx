import { useState } from "react";

const ESTADOS = ["Disponible", "Mantenimiento", "Fuera de servicio"];

const getEstadoStyle = (estado) => {
  const e = estado?.toLowerCase();
  if (e === "disponible") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (e === "mantenimiento") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-rose-50 text-rose-700 border-rose-100";
};

const ActivoList = ({ activos, onEditar, onEliminar, onActivar }) => {
  const [cambiandoEstado, setCambiandoEstado] = useState(null);

  if (!activos.length) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400 font-medium italic">
          No se han encontrado registros de activos.
        </p>
      </div>
    );
  }

  const labelStyle = "text-[10px] uppercase font-bold text-slate-400 tracking-wider";
  const valueStyle = "text-sm font-semibold text-slate-700";

  // Normaliza valores legacy del backend ("Operativo", "Activo") a "Disponible"
  const normalizarEstado = (estado) => {
    const e = estado?.toLowerCase();
    if (e === "operativo" || e === "activo") return "Disponible";
    if (e === "mantenimiento") return "Mantenimiento";
    if (e === "fuera de servicio" || e === "fuera_servicio") return "Fuera de servicio";
    if (e === "inactivo") return "Inactivo";
    return "Disponible";
  };

  const handleCambiarEstado = (activo, nuevoEstado) => {
    if (nuevoEstado === normalizarEstado(activo.estado)) {
      setCambiandoEstado(null);
      return;
    }
    if (nuevoEstado === "Disponible") {
      onActivar(activo.id);
    } else {
      onEliminar(activo.id, nuevoEstado);
    }
    setCambiandoEstado(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      {activos.map((a) => {
        const estadoNorm = normalizarEstado(a.estado);
        const disponible = estadoNorm === "Disponible";

        return (
          <div
            key={a.id}
            className="group bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-slate-300 transition-all duration-200 flex flex-col"
          >
            {/* Header */}
            <div className="flex flex-col items-start gap-2 mb-4">
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border ${getEstadoStyle(estadoNorm)}`}>
                  {estadoNorm}
                </span>
                {!disponible && (
                  <span className="text-[10px] px-2 py-1 rounded-lg font-bold bg-slate-100 text-slate-500 border border-slate-200">
                    No reservable
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {a.nombre}
              </h3>
            </div>

            {/* Datos */}
            <div className="space-y-3 mb-6 flex-1">
              <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                <span className={labelStyle}>SKU</span>
                <span className="text-xs font-mono text-slate-600">{a.sku || "—"}</span>
              </div>

              <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                <span className={labelStyle}>Tipo</span>
                <span className={valueStyle}>{a.tipo || "—"}</span>
              </div>

              {a.descripcion && (
                <div className="border-b border-slate-50 pb-2">
                  <span className={labelStyle}>Descripción</span>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{a.descripcion}</p>
                </div>
              )}

              <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                <span className={labelStyle}>Precio Base</span>
                <span className={`${valueStyle} text-emerald-600`}>
                  {a.precio_base != null ? `$${Number(a.precio_base).toLocaleString("es-CL")}` : "—"}
                </span>
              </div>

              <div className="flex justify-between items-end pb-1">
                <span className={labelStyle}>Buffer (min)</span>
                <span className={valueStyle}>{a.buffer_limpieza_minutos || 0} min</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-50 relative">
              <button
                onClick={() => onEditar(a)}
                className="flex-1 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all active:scale-95"
              >
                Editar
              </button>

              <div className="flex-1 relative">
                <button
                  onClick={() => setCambiandoEstado(cambiandoEstado === a.id ? null : a.id)}
                  className={`w-full px-4 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
                    disponible
                      ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                  }`}
                >
                  Cambiar estado
                </button>

                {cambiandoEstado === a.id && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-10">
                    {ESTADOS.filter((e) => e !== estadoNorm).map((estado) => (
                      <button
                        key={estado}
                        onClick={() => handleCambiarEstado(a, estado)}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          estado === "Disponible" ? "bg-emerald-500"
                          : estado === "Mantenimiento" ? "bg-amber-500"
                          : "bg-rose-500"
                        }`} />
                        {estado}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivoList;