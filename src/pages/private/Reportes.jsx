import { useReportes } from "../../hooks/useReportes";
import ReservasChart from "../../components/reportes/ReservasChart";
import EstadoReservasChart from "../../components/reportes/EstadoReservasChart";
import ActivosPopularesChart from "../../components/reportes/ActivosPopularesChart";

/**
 * Módulo de Inteligencia de Negocio y Reportes.
 * Visualiza KPIs críticos y tendencias mediante gráficos dinámicos.
 */
const Reportes = () => {
  const { 
    kpis, 
    dataGraficoDias, 
    dataGraficoEstados, 
    dataGraficoActivos, 
    loading 
  } = useReportes();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-lg text-slate-500 font-medium">Generando informes detallados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Encabezado del Panel */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Panel de Reportes</h1>
        <p className="mt-2 text-slate-600">
          Resumen analítico de operaciones y rendimiento del sistema.
        </p>
      </section>

      {/* SECCIÓN 1: Tarjetas de Métricas (KPIs) */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:-translate-y-1 transition-transform">
          <p className="text-sm font-medium text-slate-500">Total Reservas</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">{kpis?.totalReservas || 0}</h2>
          <p className="mt-2 text-xs text-slate-500">Volumen total histórico</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:-translate-y-1 transition-transform">
          <p className="text-sm font-medium text-slate-500">Tasa de Cancelación</p>
          <h2 className="mt-3 text-3xl font-bold text-rose-600">{kpis?.porcentajeCancelacion || "0"}%</h2>
          <p className="mt-2 text-xs text-rose-500 font-medium">Requiere seguimiento</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:-translate-y-1 transition-transform">
          <p className="text-sm font-medium text-slate-500">Activos Ocupados</p>
          <h2 className="mt-3 text-3xl font-bold text-blue-600">{kpis?.activosOcupados || 0}</h2>
          <p className="mt-2 text-xs text-blue-500 font-medium">Recursos en uso actual</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:-translate-y-1 transition-transform">
          <p className="text-sm font-medium text-slate-500">Ingresos (Mes)</p>
          <h2 className="mt-3 text-3xl font-bold text-emerald-600">
            ${kpis?.ingresosEstimados?.toLocaleString("es-CL") || 0}
          </h2>
          <p className="mt-2 text-xs text-emerald-600 font-medium">Proyección según precio base</p>
        </div>
      </section>

      {/* SECCIÓN 2: Gráficos Principales */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico de Volumen (Ocupa 2/3) */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Volumen de Reservas (Últimos 7 días)</h2>
          <div className="h-80 w-full">
            <ReservasChart data={dataGraficoDias} />
          </div>
        </div>

        {/* Gráfico de Distribución (Ocupa 1/3) */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Distribución de Estados</h2>
          <div className="h-80 w-full">
            <EstadoReservasChart data={dataGraficoEstados} />
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: Análisis de Activos */}
      <section>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Activos Más Solicitados</h2>
          <div className="h-96 w-full">
            <ActivosPopularesChart data={dataGraficoActivos} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reportes;