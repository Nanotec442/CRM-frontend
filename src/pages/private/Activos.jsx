import { useState } from "react";
import { useActivo } from "../../hooks/useActivo";
import ActivoForm from "../../components/activos/ActivoForm";
import ActivoList from "../../components/activos/ActivoList";
import NuevoActivoVista from "../../components/activos/NuevoActivoVista";

const Activos = () => {
  const {
    activos,
    crearActivo,
    editarActivo,
    eliminarActivo,
    activarActivo, 
  } = useActivo();

  const [busqueda, setBusqueda] = useState("");
  // Estado para controlar qué pantalla vemos ("lista" o "nuevo")
  const [vista, setVista] = useState("lista");

  const activosFiltrados = activos.filter((activo) => {
    const q = busqueda.toLowerCase();
    return (
      (activo.nombre || "").toLowerCase().includes(q) ||
      (activo.tipo || "").toLowerCase().includes(q) ||
      (activo.estado || "").toLowerCase().includes(q)
    );
  });

  // Manejador para el botón guardar desde la IA
  const handleGuardarDesdeIA = async (formData) => {
    await crearActivo(formData);
    setVista("lista"); // Regresa a la tabla después de crear
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header unificado */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Activos y Recursos</h1>
          <p className="mt-2 text-slate-600">
            Administra el inventario de recursos disponibles. 
            Tienes <span className="font-semibold text-slate-900">{activos.length}</span> activos registrados.
          </p>
        </div>
        
        {/* Botón principal solo visible si estamos en la lista */}
        {vista === "lista" && (
          <button
            onClick={() => setVista("nuevo")}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            + Nuevo activo con IA
          </button>
        )}
      </section>

      {/* Renderizado Condicional */}
      {vista === "nuevo" ? (
        <div className="animate-in fade-in duration-300">
          <NuevoActivoVista 
            onGuardar={handleGuardarDesdeIA} 
            onVolver={() => setVista("lista")} 
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[400px_1fr] animate-in fade-in duration-300">
          
          <aside>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 h-fit">
              <h2 className="font-semibold text-slate-900 mb-4">Registro Manual</h2>
              <ActivoForm onSubmit={crearActivo} />
            </div>
          </aside>

          <main className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <span className="text-lg">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, tipo o estado..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-10 py-3 text-sm bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-md">✕</span>
                </button>
              )}
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="p-1">
                <ActivoList
                  activos={activosFiltrados}
                  onEditar={editarActivo}
                  onEliminar={eliminarActivo}
                  onActivar={activarActivo}
                />
              </div>
              
              {activosFiltrados.length === 0 && busqueda !== "" && (
                <div className="text-center py-12 bg-slate-50/50">
                  <p className="text-sm text-slate-500 font-medium">
                    No se encontraron activos que coincidan con "<span className="text-slate-900">{busqueda}</span>".
                  </p>
                  <button 
                    onClick={() => setBusqueda("")}
                    className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
                  >
                    Ver todos los activos
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Activos;