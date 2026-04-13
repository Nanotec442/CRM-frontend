import { useState } from "react";
import { useActivo } from "../../hooks/useActivo";
import ActivoForm from "../../components/activos/ActivoForm";
import ActivoList from "../../components/activos/ActivoList";

const Activos = () => {
  const {
    activos,
    crearActivo,
    editarActivo,
    eliminarActivo,
    activarActivo, // <-- 1. Extraemos la nueva función
  } = useActivo();

  const [busqueda, setBusqueda] = useState("");

  const activosFiltrados = activos.filter((activo) => {
    const q = busqueda.toLowerCase();
    return (
      (activo.nombre || "").toLowerCase().includes(q) ||
      (activo.tipo || "").toLowerCase().includes(q) ||
      (activo.estado || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activos y Recursos</h1>
        <p className="text-sm text-slate-500 mt-1">
          {activos.length} recurso{activos.length !== 1 ? "s" : ""} registrado{activos.length !== 1 ? "s" : ""} en total.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-5">Nuevo Activo</h2>
          <ActivoForm onSubmit={crearActivo} />
        </div>

        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, tipo o estado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <ActivoList
              activos={activosFiltrados}
              onEditar={editarActivo}
              onEliminar={eliminarActivo}
              onActivar={activarActivo} // <-- 2. Se la pasamos a la lista
            />
          </div>
          
          {activosFiltrados.length === 0 && busqueda !== "" && (
            <div className="text-center py-10 text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
              No se encontraron activos que coincidan con "{busqueda}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activos;