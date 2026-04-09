const ReservaCard = ({ reserva, onCancelar, onFirmar }) => {
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short"
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "confirmada":
        return "border-green-500";
      case "cancelada":
        return "border-red-600";
      default: // pendiente
        return "border-amber-500";
    }
  };

  const getBadgeColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "confirmada":
        return "bg-green-500";
      case "cancelada":
        return "bg-red-600";
      default:
        return "bg-amber-500";
    }
  };

  return (
    <div
      className={`bg-white p-5 rounded-xl mb-4 shadow-sm border border-gray-100 border-l-[6px] ${getEstadoColor(
        reserva.estado
      )} transition-all hover:shadow-md`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <strong className="text-[15px] text-slate-800 flex items-center gap-1.5">
            👤 {reserva.cliente?.nombre_completo || "Sin cliente"}
          </strong>
          <div className="text-[13px] text-slate-500 flex items-center gap-1.5 mt-1">
            🏢 {reserva.activo?.nombre || "Sin activo"}
          </div>
        </div>

        <span
          className={`${getBadgeColor(
            reserva.estado
          )} text-white px-3 py-1 rounded-full text-xs font-medium capitalize shadow-sm`}
        >
          {reserva.estado || "Pendiente"}
        </span>
      </div>

      {/* INFO */}
      <div className="text-sm mb-4 text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <p>
          <strong className="text-slate-700">🕒 Inicio:</strong>{" "}
          {formatearFecha(reserva.fecha_inicio)}
        </p>
        <p>
          <strong className="text-slate-700">🏁 Fin:</strong>{" "}
          {formatearFecha(reserva.fecha_fin)}
        </p>
      </div>

      {/* ACCIONES */}
      <div className="flex gap-3">
        <button
          onClick={() => onFirmar?.(reserva)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Firmar
        </button>

        <button
          onClick={() => onCancelar(reserva.id)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ReservaCard;