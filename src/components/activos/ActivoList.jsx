/**
 * Listado visual de activos en formato grilla.
 * Proporciona acciones rápidas para edición, desactivación o reactivación de recursos.
 */
const ActivoList = ({ activos, onEditar, onEliminar, onActivar }) => {
  
  if (!activos.length) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400 font-medium italic">
          No se han encontrado registros de activos.
        </p>
      </div>
    );
  }

  // Estilos comunes para etiquetas de datos
  const labelStyle = "text-[10px] uppercase font-bold text-slate-400 tracking-wider";
  const valueStyle = "text-sm font-semibold text-slate-700";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      {activos.map((a) => (
        <div
          key={a.id}
          className="group bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-slate-300 transition-all duration-200 flex flex-col"
        >
          {/* HEADER: Estado y Título */}
          <div className="flex flex-col items-start gap-2 mb-4">
            <span
              className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border
                ${a.estado?.toLowerCase() === "operativo" || a.estado?.toLowerCase() === "disponible"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : a.estado?.toLowerCase() === "mantenimiento"
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : "bg-rose-50 text-rose-700 border-rose-100"
                }`}
            >
              {a.estado?.replace("_", " ") || "Inactivo"}
            </span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {a.nombre}
            </h3>
          </div>

          {/* CUERPO: Información técnica */}
          <div className="space-y-3 mb-6 flex-1">
            <div className="flex justify-between items-end border-b border-slate-50 pb-2">
              <span className={labelStyle}>Tipo</span>
              <span className={valueStyle}>{a.tipo}</span>
            </div>
            
            <div className="flex justify-between items-end border-b border-slate-50 pb-2">
              <span className={labelStyle}>Precio Base</span>
              <span className={`${valueStyle} text-emerald-600`}>
                ${a.precio_base?.toLocaleString("es-CL")}
              </span>
            </div>

            <div className="flex justify-between items-end pb-1">
              <span className={labelStyle}>Buffer Técnico</span>
              <span className={valueStyle}>{a.buffer_limpieza_minutos || a.tiempo_buffer_minutos || 0} min</span>
            </div>
          </div>

          {/* ACCIONES: Footer de la tarjeta */}
          <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
            <button
              onClick={() => onEditar(a)}
              className="flex-1 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all active:scale-95"
            >
              Editar
            </button>

            {a.estado?.toLowerCase() === "inactivo" ? (
              <button
                onClick={() => onActivar(a.id)}
                className="flex-1 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
              >
                Reactivar
              </button>
            ) : (
              <button
                onClick={() => onEliminar(a.id)}
                className="flex-1 px-4 py-2 text-xs font-bold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
              >
                Desactivar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivoList;