import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { clientesService } from "../../services/clientesService";
import { reservasService } from "../../services/reservasService";
// IMPORTACIÓN CORRECTA: Sin llaves porque usas 'export default'
import activosService from "../../services/activosService";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para almacenar nuestros cálculos
  const [metricas, setMetricas] = useState({
    totalClientes: 0,
    reservasPendientes: 0,
    activosDisponibles: 0,
    reservasHoy: 0,
  });

  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    const cargarDatosDashboard = async () => {
      try {
        setLoading(true);
        // Hacemos las 3 llamadas con los nombres exactos de tus servicios
        const [clientes, reservas, activos] = await Promise.all([
          clientesService.listar().catch(() => []),
          reservasService.listar().catch(() => []),
          activosService.getActivos().catch(() => []) // <- AQUÍ USAMOS getActivos()
        ]);

// --- 1. CÁLCULOS MATEMÁTICOS PARA LOS KPIs ---
        
        // NORMALIZACIÓN: Nos aseguramos de extraer el arreglo, venga como venga de Axios o FastAPI
        const dataClientes = Array.isArray(clientes) ? clientes : (clientes?.data || clientes?.clientes || []);
        const dataReservas = Array.isArray(reservas) ? reservas : (reservas?.data || reservas?.reservas || []);
        const dataActivos = Array.isArray(activos) ? activos : (activos?.data || activos?.activos || []);
        
        const hoy = new Date();
        const hoyString = hoy.toISOString().split("T")[0]; 
        
        let pendientes = 0;
        let paraHoy = 0;
        
        // Usamos dataReservas en lugar de reservas
        dataReservas.forEach(reserva => {
          if (reserva.estado?.toLowerCase() === "pendiente") pendientes++;
          
          const fechaReserva = reserva.fecha_inicio ? reserva.fecha_inicio.split("T")[0] : "";
          if (fechaReserva === hoyString && reserva.estado?.toLowerCase() !== "cancelada") {
            paraHoy++;
          }
        });

        const disponibles = dataActivos.filter(a => a.estado?.toLowerCase() === "disponible" || a.estado?.toLowerCase() === "activo").length;

        setMetricas({
          totalClientes: dataClientes.length,
          reservasPendientes: pendientes,
          activosDisponibles: disponibles,
          reservasHoy: paraHoy,
        });

        // --- 2. ACTIVIDAD RECIENTE ---
        const ultimasReservas = [...dataReservas]
          .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
          .slice(0, 3)
          .map(r => ({
            id: r.id,
            title: `Reserva ${r.estado || "Registrada"}`,
            description: `Para el ${new Date(r.fecha_inicio).toLocaleDateString("es-CL")} a las ${new Date(r.fecha_inicio).toLocaleTimeString("es-CL", {hour: '2-digit', minute:'2-digit'})}`,
          }));

        setActividadReciente(ultimasReservas);

      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError("Hubo un problema al cargar los datos del panel.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatosDashboard();
  }, []);

  const quickAccess = [
    { 
      title: "Gestionar clientes", 
      description: "Administra información y seguimiento.",
      path:"/panel/clientes" 
    },
    { 
      title: "Ver reservas",
      description: "Consulta reservas activas y pendientes.",
      path:"/panel/reservas"
    },
    { 
      title: "Usar Asistente IA",
      description: "Obtén apoyo inteligente en tareas del CRM.",
      path:"/panel/asistente-ia"
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-lg text-slate-500 font-medium">Recopilando métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Bienvenido al panel de gestión. Aquí puedes visualizar el estado general de PIVOT.
        </p>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          ⚠ {error}
        </div>
      )}

      {/* KPIs SUPERIORES */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:-translate-y-1 transition-transform">
          <p className="text-sm font-medium text-slate-500">Total Clientes</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">{metricas.totalClientes}</h2>
          <p className="mt-2 text-sm text-slate-600">Registrados en el sistema</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:-translate-y-1 transition-transform">
          <p className="text-sm font-medium text-slate-500">Reservas Pendientes</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">{metricas.reservasPendientes}</h2>
          <p className="mt-2 text-sm text-slate-600">Requieren tu atención</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:-translate-y-1 transition-transform">
          <p className="text-sm font-medium text-slate-500">Activos Operativos</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">{metricas.activosDisponibles}</h2>
          <p className="mt-2 text-sm text-slate-600">Listos para reservar</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:-translate-y-1 transition-transform">
          <p className="text-sm font-medium text-slate-500">Reportes Generados</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Automático</h2>
          <p className="mt-2 text-sm text-green-600 font-medium">Al día</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {/* ACTIVIDAD RECIENTE */}
        <div className="xl:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Actividad reciente (Últimas reservas)</h2>
          <div className="mt-5 space-y-4">
            {actividadReciente.length === 0 ? (
              <p className="text-sm text-slate-500">No hay actividad reciente registrada.</p>
            ) : (
              actividadReciente.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                >
                  <h3 className="text-base font-semibold text-slate-800">
                    {activity.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {activity.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RESUMEN DEL DÍA */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Resumen del día</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-sm text-blue-800 font-medium">Reservas para hoy</p>
              <p className="mt-2 text-3xl font-bold text-blue-900">{metricas.reservasHoy}</p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4 border border-slate-200">
              <p className="text-sm text-slate-700 font-medium">Clientes Totales</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{metricas.totalClientes}</p>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-sm text-amber-800 font-medium">Alertas (Pendientes)</p>
              <p className="mt-2 text-2xl font-bold text-amber-900">{metricas.reservasPendientes}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900">Accesos rápidos</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickAccess.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex flex-col justify-between min-h-40 transition-transform hover:-translate-y-1"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
              <Link
                to={item.path}
                className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 self-start text-center"
              >
                Ir al módulo
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;