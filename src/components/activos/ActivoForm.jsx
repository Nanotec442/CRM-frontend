import { useState } from "react";

const ActivoForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    precio_base: "",
    tiempo_buffer_minutos: "",
    estado: "disponible",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      ...form,
      precio_base: form.precio_base ? Number(form.precio_base) : 0,
      tiempo_buffer_minutos: form.tiempo_buffer_minutos
        ? Number(form.tiempo_buffer_minutos)
        : 0,
    });

    setForm({
      nombre: "",
      tipo: "",
      precio_base: "",
      tiempo_buffer_minutos: "",
      estado: "disponible",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-6"
    >
      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        Crear Activo
      </h2>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Nombre */}
        <div className="col-span-2">
          <label className="text-sm font-medium text-slate-600">
            Nombre del Activo
          </label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Sala 1, Retroexcavadora..."
            required
            className="mt-1 w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="text-sm font-medium text-slate-600">
            Tipo
          </label>
          <input
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            placeholder="Ej: Sala, Vehículo"
            required
            className="mt-1 w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="text-sm font-medium text-slate-600">
            Estado
          </label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="mt-1 w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
          >
            <option value="disponible">Disponible</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="fuera_servicio">Fuera de servicio</option>
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="text-sm font-medium text-slate-600">
            Precio Base
          </label>
          <input
            name="precio_base"
            type="number"
            min="0"
            value={form.precio_base}
            onChange={handleChange}
            placeholder="$"
            required
            className="mt-1 w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
          />
        </div>

        {/* Buffer */}
        <div>
          <label className="text-sm font-medium text-slate-600">
            Buffer (min)
          </label>
          <input
            name="tiempo_buffer_minutos"
            type="number"
            min="0"
            value={form.tiempo_buffer_minutos}
            onChange={handleChange}
            placeholder="Ej: 15"
            className="mt-1 w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
          />
        </div>
      </div>

      {/* BOTÓN */}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition shadow-md"
        >
          Crear Activo
        </button>
      </div>
    </form>
  );
};

export default ActivoForm;