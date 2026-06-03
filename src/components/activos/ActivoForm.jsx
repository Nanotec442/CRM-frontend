import { useState } from "react";

const ESTADOS = ["Disponible", "Mantenimiento", "Fuera de servicio", "Inactivo"];

const ActivoForm = ({ onSubmit, resourceTypes = [] }) => {
  const [form, setForm] = useState({
    nombre: "",
    sku: "",
    codigo_interno: "",
    resource_type_id: "",
    tipo: "",
    categoria: "",
    descripcion: "",
    precio_base: "",
    buffer_limpieza_minutos: "",
    capacidad: "",
    ubicacion: "",
    estado: "Disponible",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      resource_type_id: form.resource_type_id || null,
      moneda: "CLP",
      precio_base: form.precio_base ? Number(form.precio_base) : null,
      buffer_limpieza_minutos: form.buffer_limpieza_minutos ? Number(form.buffer_limpieza_minutos) : 0,
      capacidad: form.capacidad ? Number(form.capacidad) : null,
    };
    onSubmit(payload);
    setForm({
      nombre: "", sku: "", codigo_interno: "", resource_type_id: "",
      tipo: "", categoria: "", descripcion: "", precio_base: "",
      buffer_limpieza_minutos: "", capacidad: "", ubicacion: "", estado: "Disponible",
    });
  };

  const inputCls = "mt-1.5 w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700";
  const labelCls = "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {resourceTypes.length > 0 && (
        <div>
          <label className={labelCls}>Tipo de Recurso</label>
          <select name="resource_type_id" value={form.resource_type_id} onChange={handleChange} className={inputCls}>
            <option value="">— Sin tipo específico —</option>
            {resourceTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>{rt.nombre}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={labelCls}>Nombre <span className="text-rose-500">*</span></label>
        <input name="nombre" value={form.nombre} onChange={handleChange} required
          placeholder="Ej: Sala 1, Retroexcavadora..." className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>SKU <span className="text-rose-500">*</span></label>
          <input name="sku" value={form.sku} onChange={handleChange} required
            placeholder="SALA-01" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Código Interno</label>
          <input name="codigo_interno" value={form.codigo_interno} onChange={handleChange}
            placeholder="Opcional" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Tipo <span className="text-rose-500">*</span></label>
          <input name="tipo" value={form.tipo} onChange={handleChange} required
            placeholder="Vehículo, Espacio..." className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Subcategoría</label>
          <input name="categoria" value={form.categoria} onChange={handleChange}
            placeholder="Opcional" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Descripción</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
          rows={2} placeholder="Descripción opcional"
          className={`${inputCls} resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Precio Base (CLP)</label>
          <input name="precio_base" type="number" min="0" value={form.precio_base}
            onChange={handleChange} placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Buffer (min)</label>
          <input name="buffer_limpieza_minutos" type="number" min="0"
            value={form.buffer_limpieza_minutos} onChange={handleChange}
            placeholder="15" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Capacidad</label>
          <input name="capacidad" type="number" min="1" value={form.capacidad}
            onChange={handleChange} placeholder="Ej: 10" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Ubicación</label>
          <input name="ubicacion" value={form.ubicacion} onChange={handleChange}
            placeholder="Piso 2, Bodega..." className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Estado</label>
        <select name="estado" value={form.estado} onChange={handleChange} className={inputCls}>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="pt-2">
        <button type="submit"
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-slate-200">
          Registrar Activo
        </button>
      </div>
    </form>
  );
};

export default ActivoForm;