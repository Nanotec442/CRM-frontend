import { useState } from "react";
import { useReservas } from "../../hooks/useReservas";
import ReservaForm from "../../components/reservas/ReservaForm";
import ReservaCard from "../../components/reservas/ReservaCard";
import Calendario from "../../components/calendario/Calendario";
import ProximasReservas from "../../components/reservas/ProximasReservas";

const Reservas = () => {
  const { reservas, cargarReservas, cancelarReserva } = useReservas();

  const reservasSeguras = reservas || [];
  const [vista, setVista] = useState("calendario");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Gestión de Reservas</h1>

      {/* Grid Superior: Formulario y Próximas Reservas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-start">
        <ReservaForm onSuccess={cargarReservas} />
        <ProximasReservas reservas={reservasSeguras} />
      </div>

      {/* Selector de Vistas (Tabs) */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setVista("calendario")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            vista === "calendario"
              ? "bg-slate-800 text-white shadow-md"
              : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          Calendario
        </button>
        <button
          onClick={() => setVista("lista")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            vista === "lista"
              ? "bg-slate-800 text-white shadow-md"
              : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          Lista de Reservas
        </button>
      </div>

      {/* Contenedor de Vistas */}
      <div className="max-w-5xl mx-auto">
        {/* Vista Calendario */}
        {vista === "calendario" && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <Calendario reservas={reservasSeguras} />
          </div>
        )}

        {/* Vista Lista */}
        {vista === "lista" && (
          <div className="flex flex-col gap-4">
            {reservasSeguras.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-500 font-medium">No hay reservas registradas en el sistema.</p>
              </div>
            ) : (
              reservasSeguras.map((r) => (
                <ReservaCard
                  key={r.id}
                  reserva={r}
                  onCancelar={cancelarReserva}
                  onFirmar={(reserva) => {
                    console.log("Abrir módulo de firma para:", reserva);
                  }}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservas;