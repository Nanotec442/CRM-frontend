import { useState, useEffect } from "react";

function ClienteForm({ agregarCliente, clienteEditando }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    empresa: ""
  });

  useEffect(() => {
    if (clienteEditando) {
      setForm(clienteEditando);
    }
  }, [clienteEditando]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nombre || !form.email) {
      alert("Nombre y email son obligatorios");
      return;
    }

    agregarCliente(form);

    setForm({
      nombre: "",
      email: "",
      telefono: "",
      empresa: ""
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="text-xl font-bold">
        {clienteEditando ? "Editar Cliente" : "Nuevo Cliente"}
      </h2>

      <input
        type="text"
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Nombre"
        className="w-full p-2 border rounded"
      />

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full p-2 border rounded"
      />

      <input
        type="text"
        name="telefono"
        value={form.telefono}
        onChange={handleChange}
        placeholder="Teléfono"
        className="w-full p-2 border rounded"
      />

      <input
        type="text"
        name="empresa"
        value={form.empresa}
        onChange={handleChange}
        placeholder="Empresa"
        className="w-full p-2 border rounded"
      />

      <button className="bg-green-500 text-white px-4 py-2 rounded">
        {clienteEditando ? "Actualizar" : "Guardar"}
      </button>
    </form>
  );
}

export default ClienteForm;