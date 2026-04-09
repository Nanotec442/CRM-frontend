import { useReportes } from "../../hooks/useReportes";
import ReservasChart from "../../components/reportes/ReservasChart";
// Asumimos que crearás estos componentes usando tu librería de gráficos (ej: Recharts o Chart.js)
import EstadoReservasChart from "../../components/reportes/EstadoReservasChart";
import ActivosPopularesChart from "../../components/reportes/ActivosPopularesChart";

const Reportes = () => {
  // Ahora el hook trae más datos procesados
  const { 
    kpis, 
    dataGraficoDias, 
    dataGraficoEstados, 
    dataGraficoActivos, 
    loading 
  } = useReportes();

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex justify-center items-center h-64">
        <p className="text-slate-500 font-medium">Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Panel de Reportes</h1>
        <p className="text-slate-500 mt-1">Resumen general de operaciones y rendimiento.</p>
      </div>

      {/* 🚀 SECCIÓN 1: Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI 1: Total Reservas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Reservas</h3>
          <p className="text-3xl font-bold text-slate-800">{kpis?.totalReservas || 0}</p>
        </div>

        {/* KPI 2: Tasa de Cancelación */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Canceladas</h3>
          <p className="text-3xl font-bold text-red-600">
            {kpis?.porcentajeCancelacion || "0"}%
          </p>
        </div>

        {/* KPI 3: Activos en uso */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Activos Ocupados</h3>
          <p className="text-3xl font-bold text-blue-600">{kpis?.activosOcupados || 0}</p>
        </div>

        {/* KPI 4: Ingresos Estimados (Calculado por precio base del activo) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Ingresos (Mes)</h3>
          <p className="text-3xl font-bold text-green-600">
            ${kpis?.ingresosEstimados?.toLocaleString("es-CL") || 0}
          </p>
        </div>
      </div>

      {/* 📈 SECCIÓN 2: Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Gráfico de Líneas / Barras (Ocupa 2 columnas) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Volumen de Reservas (Últimos 7 días)</h2>
          <div className="h-72">
            {/* Gráfico de línea temporal */}
            <ReservasChart data={dataGraficoDias} />
          </div>
        </div>

        {/* Gráfico Circular / Donut (Ocupa 1 columna) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Estado de Reservas</h2>
          <div className="h-72">
            {/* Gráfico de torta mostrando Confirmadas, Pendientes, Canceladas */}
            <EstadoReservasChart data={dataGraficoEstados} />
          </div>
        </div>

      </div>

      {/* 📊 SECCIÓN 3: Gráficos Secundarios */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Activos Más Solicitados</h2>
          <div className="h-80">
            {/* Gráfico de barras horizontales mostrando qué recursos se reservan más */}
            <ActivosPopularesChart data={dataGraficoActivos} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Reportes;