import { useState, useEffect, useMemo } from "react";
import { useReservas } from "../../hooks/useReservas";
import { useActivo } from "../../hooks/useActivo";
import { clientesService } from "../../services/clientesService";

import ReservaForm from "../../components/reservas/ReservaForm";
import Calendario from "../../components/calendario/Calendario";
import ProximasReservas from "../../components/reservas/ProximasReservas";
import ReservaCard from "../../components/reservas/ReservaCard";

/**
 * Módulo de Gestión de Reservas.
 * Permite la visualización en calendario o lista y la creación de nuevas reservas.
 */
const Reservas = () => {
  const { reservas, cargarReservas, cancelarReserva } = useReservas();
  const { activos, fetchActivos } = useActivo();
  const [clientes, setClientes] = useState([]);
  const [vista, setVista] = useState("calendario");

  /**
   * Carga inicial de dependencias para el enriquecimiento de datos.
   */
  useEffect(() => {
    clientesService.listar()
      .then((data) => setClientes(data))
      .catch((err) => console.error("Error cargando clientes", err));
      
    if (activos.length === 0) fetchActivos();
  }, []);

  /**
   * Mezcla los datos de reservas con la información completa de clientes y activos.
   */
  const reservasEnriquecidas = useMemo(() => {
    return (reservas || []).map((reserva) => ({
      ...reserva,
      cliente: clientes.find((c) => c.id === reserva.cliente_id) || null,
      activo: activos.find((a) => a.id === reserva.activo_id) || null,
    }));
  }, [reservas, clientes, activos]);

  return (
    <div className="space-y-8 font-sans">
      {/* Encabezado Principal */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Reservas</h1>
          <p className="mt-2 text-slate-600">
            Administra los activos y el calendario de ocupación en tiempo real.
          </p>
        </div>
        
        {/* Selector de Vista (Tabs) consistente con Clientes */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setVista("calendario")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              vista === "calendario"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Calendario
          </button>
          <button
            onClick={() => setVista("lista")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              vista === "lista"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Lista Detallada
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Panel Lateral: Formulario y Próximos Eventos */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden h-fit">
            <div className="p-5 border-b border-slate-100 bg-slate-50/30">
              <h2 className="font-semibold text-slate-900">Nueva Reserva</h2>
            </div>
            <div className="p-6">
              <ReservaForm onSuccess={cargarReservas} />
            </div>
          </div>
          
          {vista === "calendario" && (
            <div className="hidden lg:block">
              <ProximasReservas reservas={reservasEnriquecidas} />
            </div>
          )}
        </aside>

        {/* Panel Central: Contenido Principal */}
        <main className="lg:col-span-8">
          {vista === "calendario" ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 animate-in fade-in duration-500">
              <Calendario reservas={reservasEnriquecidas} />
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-500">
              {reservasEnriquecidas.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl ring-1 ring-slate-200 border-2 border-dashed border-slate-100">
                  <span className="text-4xl mb-4 block opacity-20">📅</span>
                  <p className="text-slate-400 font-medium">No hay reservas registradas para este periodo.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reservasEnriquecidas.map((r) => (
                    <div key={r.id} className="transition-transform hover:-translate-y-1">
                      <ReservaCard
                        reserva={r}
                        onCancelar={cancelarReserva}
                        onFirmar={(res) => console.log("Firma generada:", res)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Reservas;