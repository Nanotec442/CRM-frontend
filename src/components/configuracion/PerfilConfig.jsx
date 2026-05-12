import React from "react";
import { User, Mail, Phone } from "lucide-react";

export default function PerfilConfig({ form, handleChange, loading = false }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">

      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
          <User size={22} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Información Personal</h2>
          <p className="text-sm text-slate-500 font-medium">
            Actualiza tus datos de contacto y perfil público.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Nombre Completo */}
        <div className="sm:col-span-2">
          <label htmlFor="nombre_completo" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
            Nombre Completo
          </label>
          <div className="relative group">
            <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              name="nombre_completo"
              id="nombre_completo"
              value={form?.nombre_completo || ""}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej. Juan Pérez"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Correo — solo lectura */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
            Correo Electrónico
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="email"
              name="email"
              id="email"
              value={form?.email || ""}
              onChange={handleChange}
              disabled={true}
              className="w-full pl-11 pr-4 py-3 bg-slate-100/50 text-slate-500 rounded-xl border border-slate-200 outline-none transition-all text-sm font-medium cursor-not-allowed"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1 ml-1">El correo no puede modificarse por razones de seguridad.</p>
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
            Teléfono Móvil
          </label>
          <div className="relative group">
            <Phone className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="tel"
              name="telefono"
              id="telefono"
              value={form?.telefono || ""}
              onChange={handleChange}
              disabled={loading}
              placeholder="+56 9..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

      </div>
    </div>
  );
}