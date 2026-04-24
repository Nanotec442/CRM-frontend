import React from "react";

export default function PerfilConfig({ form, handleChange, loading = false }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">
        Información Personal
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Nombre */}
        <div className="sm:col-span-2">
          <label
            htmlFor="nombre"
            className="block text-sm font-medium text-slate-700"
          >
            Nombre Completo
          </label>
          <input
            type="text"
            name="nombre"
            id="nombre"
            value={form?.nombre || ""}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full rounded-lg py-2.5 px-3 text-sm shadow-sm 
              border border-slate-200 
              focus:border-indigo-500 focus:ring-indigo-500 
              outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
            placeholder="Ej. Juan Pérez"
          />
        </div>

        {/* Correo */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={form?.email || ""}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full rounded-lg py-2.5 px-3 text-sm shadow-sm 
              border border-slate-200 
              focus:border-indigo-500 focus:ring-indigo-500 
              outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Cargo */}
        <div>
          <label
            htmlFor="cargo"
            className="block text-sm font-medium text-slate-700"
          >
            Cargo / Rol
          </label>
          <input
            type="text"
            name="cargo"
            id="cargo"
            value={form?.cargo || ""}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full rounded-lg py-2.5 px-3 text-sm shadow-sm 
              border border-slate-200 
              focus:border-indigo-500 focus:ring-indigo-500 
              outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}