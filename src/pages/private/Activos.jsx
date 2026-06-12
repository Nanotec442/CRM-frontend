import { useState } from "react";
import { toast } from "react-toastify";
import { useActivo } from "../../hooks/useActivo";
import activosService from "../../services/activosService";
import ActivoForm from "../../components/activos/ActivoForm";
import ActivoList from "../../components/activos/ActivoList";
import ActivoDetalle from "../../components/activos/ActivoDetalle";
import NuevoActivoVista from "../../components/activos/NuevoActivoVista";

const Activos = () => {
  const {
    activos,
    resourceTypes,
    loading,
    crearActivo,
    editarActivo,
    eliminarActivo,
    activarActivo,
    fetchResourceTypes,
  } = useActivo();

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [vista, setVista] = useState("lista"); // "lista" | "nuevo" | "detalle"
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);

  const activosFiltrados = activos.filter((a) => {
    const q = busqueda.toLowerCase();
    const matchQ = !q || (
      (a.nombre || "").toLowerCase().includes(q) ||
      (a.sku || "").toLowerCase().includes(q) ||
      (a.tipo || "").toLowerCase().includes(q) ||
      (a.categoria || "").toLowerCase().includes(q) ||
      (a.ubicacion || "").toLowerCase().includes(q)
    );
    const matchTipo = !filtroTipo || a.resource_type_id === filtroTipo;
    return matchQ && matchTipo;
  });

  const handleVerDetalle = async (activo) => {
    // Recargar el activo completo para tener reglas y disponibilidades actualizadas
    try {
      const activoCompleto = await activosService.getActivo(activo.id);
      setActivoSeleccionado(activoCompleto);
    } catch {
      setActivoSeleccionado(activo);
    }
    setVista("detalle");
  };

  const handleRefreshDetalle = async () => {
    if (!activoSeleccionado) return;
    try {
      const actualizado = await activosService.getActivo(activoSeleccionado.id);
      setActivoSeleccionado(actualizado);
    } catch {
      toast.error("No se pudo recargar el activo.");
    }
  };

  const handleGuardarDetalle = async (id, data) => {
    await editarActivo(id, data);
    // Actualizar el activo seleccionado con los nuevos datos
    setActivoSeleccionado(prev => ({ ...prev, ...data }));
  };

  const handleGuardarDesdeIA = async (formData) => {
    await crearActivo(formData);
    setVista("lista");
  };

  const selectCls = "text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700";

  return (
    <div className="space-y-8 font-sans">

      {/* Header — solo en lista */}
      {vista === "lista" && (
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Activos y Recursos</h1>
            <p className="mt-2 text-slate-600">
              Motor de recursos genérico — administra cualquier cosa operable.
              <span className="font-semibold text-slate-900 ml-1">{activos.length}</span> activos registrados.
            </p>
          </div>
          <button
            onClick={() => setVista("nuevo")}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            + Nuevo recurso con IA
          </button>
        </section>
      )}

      {/* Vista: Nuevo con IA */}
      {vista === "nuevo" && (
        <div className="animate-in fade-in duration-300">
          <NuevoActivoVista
            onGuardar={handleGuardarDesdeIA}
            onVolver={() => setVista("lista")}
            resourceTypes={resourceTypes}
          />
        </div>
      )}

      {/* Vista: Detalle del activo */}
      {vista === "detalle" && activoSeleccionado && (
        <div className="animate-in fade-in duration-300">
          <ActivoDetalle
            activo={activoSeleccionado}
            resourceTypes={resourceTypes}
            onVolver={() => { setVista("lista"); setActivoSeleccionado(null); }}
            onGuardar={handleGuardarDetalle}
            onRefresh={handleRefreshDetalle}
          />
        </div>
      )}

      {/* Vista: Lista */}
      {vista === "lista" && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[400px_1fr] animate-in fade-in duration-300">

          {/* Sidebar — formulario manual */}
          <aside>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 h-fit">
              <h2 className="font-semibold text-slate-900 mb-4">Registro Manual</h2>
              <ActivoForm
                onSubmit={crearActivo}
                resourceTypes={resourceTypes}
                onResourceTypesChange={(updater) => {
                  // Recargar resource types después de crear/editar/eliminar
                  fetchResourceTypes();
                }}
              />
            </div>
          </aside>

          {/* Main — lista */}
          <main className="space-y-4">

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <span className="absolute left-3.5 top-3 text-slate-400 text-base">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por nombre, SKU, tipo, ubicación..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {resourceTypes.length > 0 && (
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className={selectCls}>
                  <option value="">Todos los tipos</option>
                  {resourceTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>{rt.nombre}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Lista */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              {loading ? (
                <div className="py-20 text-center text-slate-400 text-sm">Cargando activos...</div>
              ) : (
                <div className="p-1">
                  <ActivoList
                    activos={activosFiltrados}
                    onVerDetalle={handleVerDetalle}
                    onEliminar={eliminarActivo}
                    onActivar={activarActivo}
                  />
                </div>
              )}
              {!loading && activosFiltrados.length === 0 && busqueda && (
                <div className="text-center py-12 bg-slate-50/50">
                  <p className="text-sm text-slate-500 font-medium">
                    Sin resultados para "<span className="text-slate-900">{busqueda}</span>".
                  </p>
                  <button onClick={() => setBusqueda("")}
                    className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline">
                    Ver todos
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