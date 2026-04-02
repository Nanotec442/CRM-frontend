import { useState } from "react";
import { useReservas } from "../../hooks/useReservas";
import ReservaForm from "../../components/reservas/ReservaForm";
import ReservaCard from "../../components/reservas/ReservaCard";
import Calendario from "../../components/calendario/Calendario";
import ProximasReservas from "../../components/reservas/ProximasReservas";

const Reservas = () => {
  const { reservas, cargarReservas, cancelarReserva } = useReservas();

  const reservasSeguras = reservas || [];
  const [vista, setVista] = useState("calendario");

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: 20 }}>Reservas</h1>

      <div style={{ display: "flex", justifyContent: "center" }}>
        
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            width: "100%",
            maxWidth: 900,
          }}
        >
          <ReservaForm onSuccess={cargarReservas} />
          <ProximasReservas reservas={reservasSeguras} />
        </div>

      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 10,
          margin: "30px 0 20px",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => setVista("calendario")}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: vista === "calendario" ? "#1e293b" : "#f8fafc",
            color: vista === "calendario" ? "#fff" : "#334155",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Calendario
        </button>

        <button
          onClick={() => setVista("lista")}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: vista === "lista" ? "#1e293b" : "#f8fafc",
            color: vista === "lista" ? "#fff" : "#334155",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Lista
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        
        {/* Vista Calendario */}
        {vista === "calendario" && (
          <div style={{ marginBottom: 20 }}>
            <Calendario reservas={reservasSeguras} />
          </div>
        )}

        {/* Vista Lista */}
        {vista === "lista" && (
          <>
            {reservasSeguras.length === 0 ? (
              <p style={{ textAlign: "center", color: "#64748b" }}>
                No hay reservas aún
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {reservasSeguras.map((r) => (
                  <ReservaCard
                    key={r.id}
                    reserva={r}
                    onCancelar={cancelarReserva}
                    onFirmar={(reserva) => {
                      console.log("Abrir firma:", reserva);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Reservas;