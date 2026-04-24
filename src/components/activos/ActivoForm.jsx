import { useState } from "react";

/**
 * Formulario de creación de activos.
 * Rediseñado para coincidir exactamente con la estructura de ReservaForm.
 */
const ActivoForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    precio_base: "",
    tiempo_buffer_minutos: "",
    estado: "Operativo",
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
      estado: "operativo",
    });
  };

  // Clases compartidas para consistencia total
  const inputClasses = "mt-1.5 w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700";
  const labelClasses = "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Campo principal: Nombre */}
      <div>
        <label className={labelClasses}>Nombre del Activo</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Ej: Sala 1, Retroexcavadora..."
          required
          className={inputClasses}
        />
      </div>

      {/* Campo principal: Tipo */}
      <div>
        <label className={labelClasses}>Categoría / Tipo</label>
        <input
          name="tipo"
          value={form.tipo}
          onChange={handleChange}
          placeholder="Ej: Vehículo, Espacio Físico"
          required
          className={inputClasses}
        />
      </div>

      {/* BLOQUE TÉCNICO: Configuración secundaria (Igual al rango de fechas en Reservas) */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div>
          <label className={labelClasses}>Estado</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="operativo">Operativo</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="fuera_servicio">Fuera de servicio</option>
          </select>
        </div>

        <div>
          <label className={labelClasses}>Buffer (min)</label>
          <input
            name="tiempo_buffer_minutos"
            type="number"
            min="0"
            value={form.tiempo_buffer_minutos}
            onChange={handleChange}
            placeholder="15"
            className={inputClasses}
          />
        </div>

        <div className="col-span-2">
          <label className={labelClasses}>Precio Base por Uso ($)</label>
          <input
            name="precio_base"
            type="number"
            min="0"
            value={form.precio_base}
            onChange={handleChange}
            placeholder="0"
            required
            className={inputClasses}
          />
        </div>
      </div>

      {/* Botón de Acción Principal */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
        >
          Registrar Activo
        </button>
      </div>
    </form>
  );
};

export default ActivoForm;