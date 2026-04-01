import { useReservas } from "../../hooks/useReservas";
import ReservaForm from "../../components/reservas/ReservaForm";
import ReservaCard from "../../components/reservas/ReservaCard";

const Reservas = () => {
  const { reservas, cargarReservas, cancelarReserva } = useReservas();

  return (
    <div>
      <h1>Reservas</h1>

      <ReservaForm onSuccess={cargarReservas} />

      {reservas.length === 0 ? (
        <p>No hay reservas aún</p>
      ) : (
        reservas.map((r) => (
          <ReservaCard
            key={r.id}
            reserva={r}
            onCancelar={cancelarReserva}
            onFirmar={(reserva) => {
              console.log("Abrir firma:", reserva);
            }}
          />
        ))
      )}
    </div>
  );
};

export default Reservas;