import { useState, useEffect } from "react";

const FORM_INICIAL = {
  nombre: "",
  email: "",
  telefono: "",
  empresa: "",
  notas: "",
};

function ClienteForm({ clienteEditando, onGuardar, onCancelar }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clienteEditando) {
      setForm({
        nombre: clienteEditando.nombre ?? "",
        email: clienteEditando.email ?? "",
        telefono: clienteEditando.telefono ?? "",
        empresa: clienteEditando.empresa ?? "",
        notas: clienteEditando.notas ?? "",
      });
    } else {
      setForm(FORM_INICIAL);
    }
    setError(null);
  }, [clienteEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) { setError("El nombre es obligatorio."); return; }
    if (!form.email.trim()) { setError("El correo electrónico es obligatorio."); return; }
    if (!form.telefono.trim()) { setError("El teléfono es obligatorio."); return; }
    if (!form.empresa.trim()) { setError("La empresa es obligatoria."); return; }

    try {
      setLoading(true);
      setError(null);
      await onGuardar(form);
      setForm(FORM_INICIAL);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full font-sans">

      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <h2 className="font-bold text-slate-900 text-lg">
          {clienteEditando ? "Editar Cliente" : "Registro Manual"}
        </h2>
        <button
          type="button"
          onClick={onCancelar}
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 flex items-center justify-center rounded-lg transition-colors text-xl font-medium"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 flex-1">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
            ⚠ {error}
          </div>
        )}

        <Field
          label="Nombre completo"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Ej: María González"
          required
        />

        <div className="grid grid-cols-1 gap-5">
          <Field
            label="Correo electrónico"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            required
          />

          <Field
            label="Teléfono"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="+56 9 1234 5678"
            required
          />
        </div>

        <Field
          label="Empresa"
          name="empresa"
          value={form.empresa}
          onChange={handleChange}
          placeholder="Nombre de la empresa"
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Notas internas
          </label>
          <textarea
            name="notas"
            value={form.notas}
            onChange={handleChange}
            rows={3}
            placeholder="Observaciones, acuerdos o detalles importantes del cliente..."
            className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-3 pt-4 mt-auto">
          <button
            type="button"
            onClick={onCancelar}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading
              ? clienteEditando ? "Actualizando..." : "Guardando..."
              : clienteEditando ? "Actualizar Cliente" : "Guardar Cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, placeholder, required }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
      />
    </div>
  );
}

export default ClienteForm;