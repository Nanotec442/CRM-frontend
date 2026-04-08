const ActivoList = ({ activos, onEditar, onEliminar }) => {
  if (!activos.length) {
    return (
      <p className="text-slate-500 mt-4">
        No hay activos registrados
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
      {activos.map((a) => (
        <div
          key={a.id}
          className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition"
        >
          {/* HEADER */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-slate-800">
              {a.nombre}
            </h3>

            <span
              className={`text-xs px-2 py-1 rounded-full font-medium capitalize
                ${a.estado === "disponible"
                  ? "bg-green-100 text-green-700"
                  : a.estado === "mantenimiento"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
              {a.estado.replace("_", " ")}
            </span>
          </div>

          {/* INFO */}
          <div className="text-sm text-slate-600 space-y-1 mb-4">
            <p>Tipo: <span className="font-medium">{a.tipo}</span></p>
            <p>Precio: <span className="font-medium">${a.precio_base}</span></p>
            <p>Buffer: <span className="font-medium">{a.tiempo_buffer_minutos} min</span></p>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onEditar(a)}
              className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 hover:bg-slate-200"
            >
              Editar
            </button>
            <button
              onClick={() => onEliminar(a.id)}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
            >
              Desactivar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivoList;