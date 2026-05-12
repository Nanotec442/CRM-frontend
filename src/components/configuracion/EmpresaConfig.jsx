import React from "react";
import { Building2, MapPin, Briefcase, Fingerprint } from "lucide-react";

export default function EmpresaConfig({ form, handleChange, loading = false }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">

      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
          <Building2 size={22} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Perfil de la Empresa</h2>
          <p className="text-sm text-slate-500 font-medium">
            Gestiona la información comercial y operativa de tu organización.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Nombre de la Empresa */}
        <div className="sm:col-span-2">
          <label htmlFor="nombre_empresa" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
            Nombre de la Empresa / Razón Social
          </label>
          <div className="relative group">
            <Building2 className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              name="nombre_empresa"
              id="nombre_empresa"
              value={form?.nombre_empresa || ""}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej. PIVOT Corp"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* RUT Empresa */}
        <div>
          <label htmlFor="rut_empresa" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
            RUT Comercial
          </label>
          <div className="relative group">
            <Fingerprint className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              name="rut_empresa"
              id="rut_empresa"
              value={form?.rut_empresa || ""}
              onChange={handleChange}
              disabled={loading}
              placeholder="76.123.456-7"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Rubro */}
        <div>
          <label htmlFor="tipo_empresa" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
            Rubro / Sector
          </label>
          <div className="relative group">
            <Briefcase className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              name="tipo_empresa"
              id="tipo_empresa"
              value={form?.tipo_empresa || ""}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej. Tecnología, Inmobiliaria..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Dirección */}
        <div className="sm:col-span-2">
          <label htmlFor="direccion" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
            Dirección Física
          </label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              name="direccion"
              id="direccion"
              value={form?.direccion || ""}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej. Av. Providencia 1234, Santiago"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

      </div>
    </div>
  );
}