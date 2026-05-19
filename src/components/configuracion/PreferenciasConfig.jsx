const PreferenciasConfig = ({ form, handleChange }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Preferencias</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
            Tema de la interfaz
          </label>
          <select
            name="tema"
            value={form?.tema || "claro"}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-700 font-medium"
          >
            <option value="claro">Claro</option>
            <option value="oscuro">Oscuro</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PreferenciasConfig;