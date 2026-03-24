import { useState } from "react";
import ReservaForm from "./ReservaForm";
import ReservaList from "./ReservaList";

function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [reservaEditando, setReservaEditando] = useState(null);

  // mock de servicios (luego vendrá del backend)
  const [servicios] = useState([
    { id: 1, nombre: "Desarrollo Web" },
    { id: 2, nombre: "Soporte Técnico" },
    { id: 3, nombre: "Consultoría" }
  ]);

  const agregarReserva = (reserva) => {
    if (reservaEditando) {
      setReservas(
        reservas.map((r) =>
          r.id === reservaEditando.id
            ? { ...reserva, id: r.id }
            : r
        )
      );
      setReservaEditando(null);
    } else {
      setReservas([
        ...reservas,
        { ...reserva, id: Date.now() }
      ]);
    }
  };

  const eliminarReserva = (id) => {
    setReservas(reservas.filter((r) => r.id !== id));
  };

  const editarReserva = (reserva) => {
    setReservaEditando(reserva);
  };

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      <ReservaForm
        agregarReserva={agregarReserva}
        reservaEditando={reservaEditando}
        servicios={servicios}
      />

      <ReservaList
        reservas={reservas}
        servicios={servicios}
        eliminarReserva={eliminarReserva}
        editarReserva={editarReserva}
      />
    </div>
  );
}

export default Reservas;