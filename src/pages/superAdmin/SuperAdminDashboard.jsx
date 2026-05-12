import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Users, CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import empresasService from "../../services/empresasService";

export default function SuperAdminDashboard() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    empresasService.listarTodasEmpresas()
      .then((data) => setEmpresas(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activas   = empresas.filter((e) => e.estado_cuenta?.toLowerCase() === "activa").length;
  const inactivas = empresas.filter((e) => e.estado_cuenta?.toLowerCase() !== "activa").length;

  const hace30dias = new Date();
  hace30dias.setDate(hace30dias.getDate() - 30);
  const nuevas = empresas.filter((e) => new Date(e.fecha_registro) >= hace30dias).length;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Cargando datos globales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Panel Global</h1>
        <p className="mt-2 text-slate-500">Vista general de todas las empresas en PIVOT.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard label="Total Empresas"    value={empresas.length} icon={<Building2 size={20} className="text-indigo-600" />}  color="bg-indigo-50" />
        <KPICard label="Activas"           value={activas}         icon={<CheckCircle size={20} className="text-emerald-600" />} color="bg-emerald-50" />
        <KPICard label="Inactivas"         value={inactivas}       icon={<XCircle size={20} className="text-rose-600" />}       color="bg-rose-50" />
        <KPICard label="Nuevas (30 días)"  value={nuevas}          icon={<Users size={20} className="text-amber-600" />}        color="bg-amber-50" />
      </div>

      {/* Últimas empresas registradas */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">Empresas recientes</h2>
          <Link to="/superadmin/empresas" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {empresas
            .sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro))
            .slice(0, 5)
            .map((empresa) => (
              <Link
                key={empresa.id}
                to={`/superadmin/empresas/${empresa.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {(empresa.nombre ?? "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{empresa.nombre}</p>
                    <p className="text-xs text-slate-400">
                      {empresa.fecha_registro
                        ? new Date(empresa.fecha_registro).toLocaleDateString("es-CL")
                        : "—"}
                    </p>
                  </div>
                </div>
                <EstadoBadge estado={empresa.estado_cuenta} />
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
      </div>
      <h2 className="mt-4 text-3xl font-bold text-slate-900">{value}</h2>
    </div>
  );
}

function EstadoBadge({ estado }) {
  const activa = estado?.toLowerCase() === "activa";
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
      activa
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-rose-50 text-rose-600 border-rose-200"
    }`}>
      {activa ? "Activa" : "Inactiva"}
    </span>
  );
}