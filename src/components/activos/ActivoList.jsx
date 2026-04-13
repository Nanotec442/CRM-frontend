// 1. Recibimos onActivar como prop
const ActivoList = ({ activos, onEditar, onEliminar, onActivar }) => {
  if (!activos.length) {
    return (
      <p className="text-slate-500 mt-4 px-6 pb-6 text-center">
        No hay activos registrados
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-6">
      {activos.map((a) => (
        <div
          key={a.id}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition relative group"
        >
          {/* HEADER */}
          {/* HEADER (Opción 1: Etiqueta Arriba) */}
          <div className="flex flex-col items-start gap-1.5 mb-3">
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider
                ${a.estado?.toLowerCase() === "operativo" || a.estado?.toLowerCase() === "disponible"
                  ? "bg-green-100 text-green-700"
                  : a.estado?.toLowerCase() === "mantenimiento"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
              {a.estado?.replace("_", " ") || "Inactivo"}
            </span>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">
              {a.nombre}
            </h3>
          </div>

          {/* INFO */}
          <div className="text-sm text-slate-600 space-y-1.5 mb-5">
            <p className="flex justify-between border-b border-slate-50 pb-1">
              <span className="text-slate-400 text-xs uppercase font-semibold">Tipo</span>
              <span className="font-medium">{a.tipo}</span>
            </p>
            <p className="flex justify-between border-b border-slate-50 pb-1">
              <span className="text-slate-400 text-xs uppercase font-semibold">Precio Base</span>
              <span className="font-medium">${a.precio_base} {a.moneda}</span>
            </p>
            <p className="flex justify-between pb-1">
              <span className="text-slate-400 text-xs uppercase font-semibold">Buffer (Min)</span>
              <span className="font-medium">{a.buffer_limpieza_minutos} min</span>
            </p>
          </div>

          {/* LÓGICA CONDICIONAL DE BOTONES */}
          <div className="flex justify-end gap-2 mt-auto">
            <button
              onClick={() => onEditar(a)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Editar
            </button>

            {/* Si está inactivo mostramos el botón verde, si no, el botón rojo */}
            {a.estado?.toLowerCase() === "inactivo" ? (
              <button
                onClick={() => onActivar(a.id)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                Reactivar
              </button>
            ) : (
              <button
                onClick={() => onEliminar(a.id)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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