import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Calendar, Clock, AlertCircle, Users,
  CheckCircle, XCircle, KanbanSquare, ArrowRight, Loader2
} from "lucide-react";
import { reservasService } from "../../services/reservasService";
import { clientesService } from "../../services/clientesService";
import { tarjetasService } from "../../services/tarjetasService";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [reservasHoy, setReservasHoy] = useState([]);
  const [alertas, setAlertas] = useState({ pendientes: 0, pagoPendiente: 0 });
  const [clientesNuevos, setClientesNuevos] = useState([]);
  const [pipeline, setPipeline] = useState([]);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = jwtDecode(token);
        setNombreUsuario(payload.nombre ?? payload.sub?.split("@")[0] ?? "");
      }
    } catch {}

    const cargar = async () => {
      try {
        setLoading(true);

        const [reservas, clientes, columnas, tablero] = await Promise.all([
          reservasService.listar(),
          clientesService.listar(),
          tarjetasService.getColumnas(),
          tarjetasService.getTablero(),
        ]);

        const dataReservas = Array.isArray(reservas) ? reservas : [];
        const dataClientes = Array.isArray(clientes) ? clientes : [];
        const dataColumnas = Array.isArray(columnas) ? columnas : [];
        const dataTablero = Array.isArray(tablero) ? tablero : [];

        // Reservas de hoy — enriquecemos con clientes y activos si no vienen en la respuesta
        const hoy = new Date().toISOString().split("T")[0];
        const deHoy = dataReservas
          .filter((r) => r.fecha_inicio?.split("T")[0] === hoy && r.estado?.toLowerCase() !== "cancelada")
          .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
          .map((r) => ({
            ...r,
            // Normalizar nombre del cliente independientemente de si viene como relación o campo plano
            _nombreCliente: r.cliente?.nombre_completo ?? r.nombre_cliente ?? r.cliente_nombre ?? "Cliente sin asignar",
            _nombreActivo:  r.activo?.nombre ?? r.nombre_activo ?? r.activo_nombre ?? "Sin activo",
          }));
        setReservasHoy(deHoy);

        // Alertas
        const pendientes = dataReservas.filter((r) => r.estado?.toLowerCase() === "pendiente").length;
        const pagoPendiente = dataReservas.filter(
          (r) => r.estado_pago?.toLowerCase() === "pendiente" && r.estado?.toLowerCase() === "confirmada"
        ).length;
        setAlertas({ pendientes, pagoPendiente });

        // Clientes nuevos esta semana
        const hace7dias = new Date();
        hace7dias.setDate(hace7dias.getDate() - 7);
        const nuevos = dataClientes
          .filter((c) => new Date(c.fecha_creacion) >= hace7dias)
          .slice(0, 5);
        setClientesNuevos(nuevos);

        // Pipeline — tarjetas por columna
        const columnasOrdenadas = [...dataColumnas].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        const pipelineData = columnasOrdenadas.map((col) => ({
          nombre: col.nombre,
          cantidad: dataTablero.filter((t) => t.stage_id === col.id).length,
          color: col.color_hex ?? "#6366f1",
        }));
        setPipeline(pipelineData);

      } catch (err) {
        setError(err?.response?.data?.detail || "Error al cargar el panel.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const formatHora = (fecha) =>
    new Date(fecha).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });

  const getEstadoBadge = (estado) => {
    const map = {
      confirmada: "bg-emerald-50 text-emerald-700 border-emerald-200",
      pendiente:  "bg-amber-50 text-amber-700 border-amber-200",
      cancelada:  "bg-red-50 text-red-600 border-red-200",
    };
    return map[estado?.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200";
  };

  const saludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Cargando panel operativo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-10">

      {/* Saludo */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900">
          {saludo()}{nombreUsuario ? `, ${nombreUsuario}` : ""} 👋
        </h1>
        <p className="mt-2 text-slate-500">
          {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Alertas urgentes */}
      {(alertas.pendientes > 0 || alertas.pagoPendiente > 0) && (
        <section className="grid gap-3 sm:grid-cols-2">
          {alertas.pendientes > 0 && (
            <Link to="/panel/reservas" className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors">
              <div className="p-2.5 bg-amber-100 rounded-xl shrink-0">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">
                  {alertas.pendientes} reserva{alertas.pendientes !== 1 ? "s" : ""} pendiente{alertas.pendientes !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-amber-600">Requieren confirmación</p>
              </div>
              <ArrowRight size={16} className="text-amber-500 ml-auto shrink-0" />
            </Link>
          )}
          {alertas.pagoPendiente > 0 && (
            <Link to="/panel/reservas" className="flex items-center gap-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl hover:bg-rose-100 transition-colors">
              <div className="p-2.5 bg-rose-100 rounded-xl shrink-0">
                <XCircle size={20} className="text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-800">
                  {alertas.pagoPendiente} pago{alertas.pagoPendiente !== 1 ? "s" : ""} pendiente{alertas.pagoPendiente !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-rose-600">Reservas confirmadas sin pago</p>
              </div>
              <ArrowRight size={16} className="text-rose-500 ml-auto shrink-0" />
            </Link>
          )}
        </section>
      )}

      {/* Grid principal */}
      <section className="grid gap-6 xl:grid-cols-3">

        {/* Reservas de hoy */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-700">
                Reservas de hoy ({reservasHoy.length})
              </h2>
            </div>
            <Link to="/panel/reservas" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>

          {reservasHoy.length === 0 ? (
            <div className="py-14 text-center">
              <Calendar size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 font-medium">No hay reservas programadas para hoy.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {reservasHoy.map((r) => (
                <div key={r.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="text-center shrink-0 w-14">
                      <p className="text-lg font-bold text-slate-800">{formatHora(r.fecha_inicio)}</p>
                      <p className="text-[10px] text-slate-400 font-medium">hrs</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {r._nombreCliente}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {r._nombreActivo} · hasta {formatHora(r.fecha_fin)}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getEstadoBadge(r.estado)}`}>
                    {r.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">

          {/* Pipeline resumen */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KanbanSquare size={16} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-700">Pipeline</h2>
              </div>
              <Link to="/panel/clientes" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Ver <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {pipeline.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Sin datos del pipeline</p>
              ) : (
                pipeline.map((col, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                    <p className="text-sm text-slate-600 flex-1 truncate">{col.nombre}</p>
                    <span className="text-sm font-bold text-slate-800">{col.cantidad}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Clientes nuevos esta semana */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-700">Nuevos esta semana</h2>
              </div>
              <Link to="/panel/clientes" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Ver <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-5">
              {clientesNuevos.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Sin clientes nuevos esta semana.</p>
              ) : (
                <div className="space-y-3">
                  {clientesNuevos.map((c) => {
                    const nombre = c.nombre_completo ?? c.nombre ?? "Sin nombre";
                    const iniciales = nombre.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
                    return (
                      <div key={c.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {iniciales}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{nombre}</p>
                          <p className="text-xs text-slate-400 truncate">{c.email}</p>
                        </div>
                        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Dashboard;