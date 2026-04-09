import { useState, useEffect } from "react";
import { useReservas } from "../../hooks/useReservas";
import { useActivo } from "../../hooks/useActivo"; // Importamos tu hook de activos
import { clientesService } from "../../services/clientesService"; // Importamos tu servicio de clientes

import ReservaForm from "../../components/reservas/ReservaForm";
import ReservaCard from "../../components/reservas/ReservaCard";
import Calendario from "../../components/calendario/Calendario";
import ProximasReservas from "../../components/reservas/ProximasReservas";

const Reservas = () => {
  const { reservas, cargarReservas, cancelarReserva } = useReservas();
  
  // Traemos los activos usando tu hook
  const { activos, fetchActivos } = useActivo();
  
  // Estado para guardar los clientes
  const [clientes, setClientes] = useState([]);
  const [vista, setVista] = useState("calendario");

  // Al cargar la pantalla, pedimos los clientes y los activos
  useEffect(() => {
    clientesService.listar()
      .then((data) => setClientes(data))
      .catch((err) => console.error("Error cargando clientes", err));
      
    if (activos.length === 0) fetchActivos();
  }, []);

  // 🔥 EL TRUCO DE MAGIA: CRUZAR LOS DATOS 🔥
  // Tomamos las reservas del backend y les pegamos el objeto cliente y activo completo
  const reservasEnriquecidas = (reservas || []).map((reserva) => {
    return {
      ...reserva,
      // Buscamos el cliente cuyo ID coincida con el cliente_id de la reserva
      cliente: clientes.find((c) => c.id === reserva.cliente_id) || null,
      // Buscamos el activo cuyo ID coincida con el activo_id de la reserva
      activo: activos.find((a) => a.id === reserva.activo_id) || null,
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Gestión de Reservas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-start">
        <ReservaForm onSuccess={cargarReservas} />
        {/* Pasamos las reservas enriquecidas */}
        <ProximasReservas reservas={reservasEnriquecidas} />
      </div>

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

      <div className="max-w-5xl mx-auto">
        {vista === "calendario" && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            {/* Pasamos las reservas enriquecidas al calendario también */}
            <Calendario reservas={reservasEnriquecidas} />
          </div>
        )}

        {vista === "lista" && (
          <div className="flex flex-col gap-4">
            {reservasEnriquecidas.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-500 font-medium">No hay reservas registradas en el sistema.</p>
              </div>
            ) : (
              reservasEnriquecidas.map((r) => (
                <ReservaCard
                  key={r.id}
                  reserva={r}
                  onCancelar={cancelarReserva}
                  onFirmar={(reserva) => {
                    console.log("Abrir módulo de firma para:", reserva);
                  }}z
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