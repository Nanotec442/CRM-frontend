/**
 * Tarjeta individual de Reserva.
 * Muestra información clave del cliente, activo y tiempos, con indicadores visuales de estado.
 */
const ReservaCard = ({ reserva, onCancelar, onFirmar }) => {
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short"
    });
  };

  const getEstadoClasses = (estado) => {
    switch (estado?.toLowerCase()) {
      case "confirmada":
        return {
          border: "border-l-emerald-500",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
          accent: "text-emerald-500"
        };
      case "cancelada":
        return {
          border: "border-l-rose-500",
          badge: "bg-rose-50 text-rose-700 border-rose-100",
          accent: "text-rose-500"
        };
      default: // pendiente
        return {
          border: "border-l-amber-500",
          badge: "bg-amber-50 text-amber-700 border-amber-100",
          accent: "text-amber-500"
        };
    }
  };

  const estilos = getEstadoClasses(reserva.estado);

  return (
    <div
      className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-[6px] ${estilos.border} transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-slate-300 group flex flex-col`}
    >
      {/* CABECERA: Cliente y Estado */}
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight truncate group-hover:text-indigo-600 transition-colors">
            {reserva.cliente?.nombre_completo || "Cliente no asignado"}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-slate-500">
            <span className="text-xs">🏢</span>
            <span className="text-xs font-semibold uppercase tracking-wider">
              {reserva.activo?.nombre || "Sin activo"}
            </span>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${estilos.badge}`}>
          {reserva.estado || "Pendiente"}
        </span>
      </div>

      {/* CUERPO: Slots de tiempo con diseño técnico */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-xl">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Inicio</p>
          <p className="text-sm font-bold text-slate-700">{formatearFecha(reserva.fecha_inicio)}</p>
        </div>
        <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-xl">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Término</p>
          <p className="text-sm font-bold text-slate-700">{formatearFecha(reserva.fecha_fin)}</p>
        </div>
      </div>

      {/* ACCIONES: Botones alineados al estándar del CRM */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onFirmar?.(reserva)}
          className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-slate-200 active:scale-[0.97] cursor-pointer"
        >
          Firmar Digitalmente
        </button>

        <button
          onClick={() => onCancelar(reserva.id)}
          className="px-4 bg-white hover:bg-rose-50 text-slate-300 hover:text-rose-600 py-2.5 rounded-xl font-bold text-sm transition-all border border-slate-200 hover:border-rose-200 active:scale-[0.97] cursor-pointer"
          title="Anular reserva"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ReservaCard;