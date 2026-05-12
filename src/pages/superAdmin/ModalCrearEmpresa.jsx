import { useState } from "react";
import { X, Loader2, Building2 } from "lucide-react";
import { toast } from "react-toastify";
import empresasService from "../../services/empresasService";

export default function ModalCrearEmpresa({ onClose, onCreada }) {
  const [form, setForm] = useState({
    nombre: "",
    rut_empresa: "",
    tipo_empresa: "",
    direccion: "",
    email_admin: "",
    password_admin: "",
    nombre_admin: "",
    apellido_admin: "",
  });
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.email_admin.trim() || !form.password_admin.trim()) {
      toast.error("Nombre de empresa, email y contraseña del admin son obligatorios.");
      return;
    }
    setGuardando(true);
    try {
      const nueva = await empresasService.registroEmpresa({
        nombre_empresa: form.nombre.trim(),
        rut_empresa: form.rut_empresa.trim(),
        tipo_empresa: form.tipo_empresa.trim(),
        direccion: form.direccion.trim(),
        email: form.email_admin.trim(),
        password: form.password_admin,
        nombre: form.nombre_admin.trim(),
        apellido: form.apellido_admin.trim(),
      });
      toast.success(`Empresa "${form.nombre}" creada correctamente.`);
      onCreada(nueva);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al crear la empresa.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            Nueva Empresa
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Datos de la Empresa</p>
            <div className="space-y-3">
              <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Clínica San José" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="RUT" name="rut_empresa" value={form.rut_empresa} onChange={handleChange} placeholder="76.123.456-7" />
                <Input label="Rubro" name="tipo_empresa" value={form.tipo_empresa} onChange={handleChange} placeholder="Salud, Inmobiliaria..." />
              </div>
              <Input label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Av. Principal 123" />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Administrador Principal</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nombre" name="nombre_admin" value={form.nombre_admin} onChange={handleChange} placeholder="Juan" />
                <Input label="Apellido" name="apellido_admin" value={form.apellido_admin} onChange={handleChange} placeholder="Pérez" />
              </div>
              <Input label="Email *" name="email_admin" type="email" value={form.email_admin} onChange={handleChange} placeholder="admin@empresa.cl" />
              <Input label="Contraseña *" name="password_admin" type="password" value={form.password_admin} onChange={handleChange} placeholder="Mínimo 8 caracteres" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-70"
          >
            {guardando ? <Loader2 size={15} className="animate-spin" /> : null}
            {guardando ? "Creando..." : "Crear Empresa"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
      />
    </div>
  );
}