import { useState, useEffect } from "react";

function ReservaForm({ agregarReserva, reservaEditando, servicios }) {
  const [form, setForm] = useState({
    cliente: "",
    servicio_id: "",
    fecha: "",
    hora: "",
    estado: "Pendiente",
    notas: ""
  });

  useEffect(() => {
    if (reservaEditando) {
      setForm(reservaEditando);
    }
  }, [reservaEditando]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.cliente || !form.servicio_id) {
      alert("Cliente y servicio son obligatorios");
      return;
    }

    agregarReserva(form);

    setForm({
      cliente: "",
      servicio_id: "",
      fecha: "",
      hora: "",
      estado: "Pendiente",
      notas: ""
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="text-xl font-bold">
        {reservaEditando ? "Editar Reserva" : "Nueva Reserva"}
      </h2>

      <input
        type="text"
        name="cliente"
        value={form.cliente}
        onChange={handleChange}
        placeholder="Cliente"
        className="w-full p-2 border rounded"
      />

      <select
        name="servicio_id"
        value={form.servicio_id}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="">Seleccione un servicio</option>
        {servicios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre}
          </option>
        ))}
      </select>

      <input
        type="date"
        name="fecha"
        value={form.fecha}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <input
        type="time"
        name="hora"
        value={form.hora}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <select
        name="estado"
        value={form.estado}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option>Pendiente</option>
        <option>Confirmada</option>
        <option>Cancelada</option>
      </select>

      <textarea
        name="notas"
        value={form.notas}
        onChange={handleChange}
        placeholder="Notas"
        className="w-full p-2 border rounded"
      />

      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        {reservaEditando ? "Actualizar" : "Guardar"}
      </button>
    </form>
  );
}

export default ReservaForm;