import { useState, useEffect } from "react";

function ServicioForm({ agregarServicio, servicioEditando }) {
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    duracion: ""
  });

  useEffect(() => {
    if (servicioEditando) {
      setForm(servicioEditando);
    }
  }, [servicioEditando]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    agregarServicio(form);

    setForm({
      nombre: "",
      precio: "",
      duracion: ""
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="text-xl font-bold">
        {servicioEditando ? "Editar Servicio" : "Nuevo Servicio"}
      </h2>

      <input
        type="text"
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Nombre del servicio"
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        name="precio"
        value={form.precio}
        onChange={handleChange}
        placeholder="Precio"
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        name="duracion"
        value={form.duracion}
        onChange={handleChange}
        placeholder="Duración (minutos)"
        className="w-full p-2 border rounded"
      />

      <button className="bg-green-500 text-white px-4 py-2 rounded">
        {servicioEditando ? "Actualizar" : "Guardar"}
      </button>
    </form>
  );
}

export default ServicioForm;