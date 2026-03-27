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
    if (!form.nombre.trim() || !form.email.trim()) {
      setError("Nombre y email son obligatorios.");
      return;
    }
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header del form */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">
          {clienteEditando ? "Editar cliente" : "Nuevo cliente"}
        </h2>
        <button
          type="button"
          onClick={onCancelar}
          className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
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

        <Field
          label="Email"
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
        />

        <Field
          label="Empresa"
          name="empresa"
          value={form.empresa}
          onChange={handleChange}
          placeholder="Nombre de la empresa"
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Notas internas
          </label>
          <textarea
            name="notas"
            value={form.notas}
            onChange={handleChange}
            rows={3}
            placeholder="Observaciones sobre el cliente..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none transition"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? clienteEditando
                ? "Actualizando..."
                : "Guardando..."
              : clienteEditando
              ? "Actualizar"
              : "Guardar cliente"}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, placeholder, required }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
      />
    </div>
  );
}

export default ClienteForm;