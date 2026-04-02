import { Link } from "react-router-dom";

function Dashboard() {
  const stats = [
    { title: "Clientes activos", value: "128", description: "12 nuevos este mes" },
    { title: "Reservas pendientes", value: "24", description: "5 para hoy" },
    { title: "Servicios activos", value: "8", description: "2 con alta demanda" },
    { title: "Reportes generados", value: "16", description: "Actualizados hoy" },
  ];

  const recentActivity = [
    {
      id: 1,
      title: "Nueva reserva registrada",
      description: "Cliente María González agendó un servicio para hoy a las 16:00.",
    },
    {
      id: 2,
      title: "Nuevo cliente agregado",
      description: "Se registró el cliente Juan Pérez en el sistema.",
    },
    {
      id: 3,
      title: "Reporte actualizado",
      description: "Se generó el reporte semanal de servicios y reservas.",
    },
  ];

  const quickAccess = [
    { title: "Gestionar clientes", 
      description: "Administra información y seguimiento.",
      path:"/panel/clientes" 
    },
    { title: "Ver reservas",
      description: "Consulta reservas activas y pendientes.",
      path:"/panel/reservas"
    },

    { title: "Usar Asistente IA",
      description: "Obtén apoyo inteligente en tareas del CRM.",
      path:"/panel/asistente-ia"},
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Bienvenido al panel de gestión. Aquí puedes visualizar el estado general del sistema.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">{stat.value}</h2>
            <p className="mt-2 text-sm text-slate-600">{stat.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Actividad reciente</h2>
          <div className="mt-5 space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <h3 className="text-base font-semibold text-slate-800">
                  {activity.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {activity.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Resumen del día</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-600">Reservas programadas</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">12</p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-600">Clientes atendidos</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">7</p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-600">Alertas activas</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">3</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">Accesos rápidos</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickAccess.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex flex-col justify-between min-h-[180x]"
            >
              <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              <Link
               to={item.path}
               className="mt-16 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 self-start">
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