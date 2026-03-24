function Topbar() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-slate-800">Panel de control</h1>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-500">Administrador</span>
        <div className="w-10 h-10 rounded-full bg-slate-300"></div>
      </div>
    </header>
  );
}

export default Topbar;