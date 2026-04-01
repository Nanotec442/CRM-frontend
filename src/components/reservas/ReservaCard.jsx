const ReservaCard = ({ reserva, onCancelar, onFirmar }) => {
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-CL");
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "confirmada":
        return "#16a34a";
      case "cancelada":
        return "#dc2626";
      default:
        return "#f59e0b";
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "18px",
        borderRadius: "14px",
        marginBottom: "14px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        borderLeft: `6px solid ${getEstadoColor(reserva.estado)}`,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <strong style={{ fontSize: "15px" }}>
            👤 {reserva.cliente?.nombre_completo || "Sin cliente"}
          </strong>
          <div style={{ fontSize: "13px", color: "#64748b" }}>
            🏢 {reserva.activo?.nombre || "Sin activo"}
          </div>
        </div>

        <span
          style={{
            background: getEstadoColor(reserva.estado),
            color: "#fff",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "12px",
          }}
        >
          {reserva.estado || "Pendiente"}
        </span>
      </div>

      {/* INFO */}
      <div style={{ fontSize: "14px", marginBottom: "12px", color: "#334155" }}>
        <p>🕒 <strong>Inicio:</strong> {formatearFecha(reserva.fecha_inicio)}</p>
        <p>🏁 <strong>Fin:</strong> {formatearFecha(reserva.fecha_fin)}</p>
      </div>

      {/* ACCIONES */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => onFirmar?.(reserva)}
          style={btnPrimary}
        >
          ✍️ Firmar
        </button>

        <button
          onClick={() => onCancelar(reserva.id)}
          style={btnDanger}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

const btnPrimary = {
  flex: 1,
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
};

const btnDanger = {
  flex: 1,
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "8px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
};

export default ReservaCard;