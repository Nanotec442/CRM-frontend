import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const Calendario = ({ reservas }) => {
  const eventos = reservas.map((r) => ({
    id: r.id,
    title: `Reserva ${r.cliente_id}`,
    start: new Date(r.fecha_inicio),
    end: new Date(r.fecha_fin),
  }));

  return (
    <div
      style={{
        height: "600px",
        background: "#fff",
        padding: "15px",
        borderRadius: "10px",
      }}
    >
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
      />
    </div>
  );
};

export default Calendario;