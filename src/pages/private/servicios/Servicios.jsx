import { useState } from "react";
import ServicioForm from "./ServicioForm";
import ServicioList from "./ServicioList";

function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [servicioEditando, setServicioEditando] = useState(null);

  const agregarServicio = (servicio) => {
    if (servicioEditando) {
      setServicios(
        servicios.map((s) =>
          s.id === servicioEditando.id ? { ...servicio, id: s.id } : s
        )
      );
      setServicioEditando(null);
    } else {
      setServicios([
        ...servicios,
        { ...servicio, id: Date.now() }
      ]);
    }
  };

  const eliminarServicio = (id) => {
    setServicios(servicios.filter((s) => s.id !== id));
  };

  const editarServicio = (servicio) => {
    setServicioEditando(servicio);
  };

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      <ServicioForm
        agregarServicio={agregarServicio}
        servicioEditando={servicioEditando}
      />

      <ServicioList
        servicios={servicios}
        eliminarServicio={eliminarServicio}
        editarServicio={editarServicio}
      />
    </div>
  );
}

export default Servicios;