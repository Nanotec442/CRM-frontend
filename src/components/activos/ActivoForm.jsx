import { useState } from "react";

const ActivoForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    nombre: "",
    sku: "",
    tipo: "",
    descripcion: "",
    precio_base: "",
    buffer_limpieza_minutos: "",
    estado: "Disponible",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      precio_base: form.precio_base ? Number(form.precio_base) : 0,
      buffer_limpieza_minutos: form.buffer_limpieza_minutos
        ? Number(form.buffer_limpieza_minutos)
        : 0,
    });
    setForm({
      nombre: "",
      sku: "",
      tipo: "",
      descripcion: "",
      precio_base: "",
      buffer_limpieza_minutos: "",
      estado: "Disponible",
    });
  };

  const inputClasses =
    "mt-1.5 w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700";
  const labelClasses =
    "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

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

      <div>
        <label className={labelClasses}>SKU / Código interno</label>
        <input
          name="sku"
          value={form.sku}
          onChange={handleChange}
          placeholder="Ej: SALA-01, VEH-003"
          required
          className={inputClasses}
        />
      </div>

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

      <div>
        <label className={labelClasses}>Descripción</label>
        <input
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          placeholder="Opcional"
          className={inputClasses}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div>
          <label className={labelClasses}>Estado</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="Disponible">Disponible</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Fuera de servicio">Fuera de servicio</option>
          </select>
        </div>

        <div>
          <label className={labelClasses}>Disp. en min</label>
          <input
            name="buffer_limpieza_minutos"
            type="number"
            min="0"
            value={form.buffer_limpieza_minutos}
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