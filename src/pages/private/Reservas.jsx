import { useEffect, useState } from "react";
import { reservasService } from "../../services/reservasService";
import ReservaForm from "../../components/reservas/ReservaForm";

const Reservas = () => {
  const [reservas, setReservas] = useState([]);

  const cargarReservas = async () => {
    try {
      const data = await reservasService.listar();
      setReservas(data);
    } catch (error) {
      console.error("Error cargando reservas", error);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const cancelar = async (id) => {
    await reservasService.cancelar(id);
    cargarReservas();
  };

  return (
    <div>
      <h1>Reservas</h1>

      <ReservaForm onSuccess={cargarReservas} />

      {reservas.length === 0 ? (
        <p>No hay reservas aún</p>
      ) : (
        reservas.map((r) => (
          <div
            key={r.id}
            style={{
              background: "#fff",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <p><strong>Cliente:</strong> {r.cliente_id}</p>
            <p><strong>Fecha:</strong> {r.fecha_inicio}</p>
            <p><strong>Estado:</strong> {r.estado}</p>

            <button
              onClick={() => cancelar(r.id)}
              style={{
                background: "red",
                color: "#fff",
                border: "none",
                padding: "6px 10px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Reservas;