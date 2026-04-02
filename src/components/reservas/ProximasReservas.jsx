import { useMemo } from "react";

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
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        padding: 16,
        boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
        minWidth: 260,
      }}
    >
      <h3 style={{ marginBottom: 12, fontSize: 16 }}>
        Próximas reservas
      </h3>

      {proximas.length === 0 ? (
        <p style={{ fontSize: 13, color: "#64748b" }}>
          No hay reservas próximas
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {proximas.map((r) => (
            <div
              key={r.id}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#eef2ff";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                {r.cliente?.nombre_completo || "Sin cliente"}
              </div>

              <div style={{ fontSize: 12, color: "#475569" }}>
                {r.activo?.nombre || "Activo"}
              </div>

              <div style={{ fontSize: 12, marginTop: 4, color: "#1e293b" }}>
                {formatearFecha(r.fecha_inicio)} — {formatearHora(r.fecha_inicio)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProximasReservas;