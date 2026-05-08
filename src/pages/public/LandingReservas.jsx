import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight, CheckCircle, Loader2, Hexagon } from "lucide-react";
import { reservasService } from "../../services/reservasService";

// ── Helpers ───────────────────────────────────────────────────────────────────
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function getDaysInMonth(year, month) {
  const days = [];
  const first = new Date(year, month, 1);
  const startDow = first.getDay() === 0 ? 6 : first.getDay() - 1;
  for (let i = 0; i < startDow; i++) {
    days.push({ date: new Date(year, month, -startDow + i + 1), outside: true });
  }
  const total = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= total; i++) {
    days.push({ date: new Date(year, month, i), outside: false });
  }
  while (days.length % 7 !== 0) {
    const next = new Date(days[days.length - 1].date);
    next.setDate(next.getDate() + 1);
    days.push({ date: next, outside: true });
  }
  return days;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isPast(date) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return date < hoy;
}

function formatHora(date) {
  return new Date(date).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatMonto(monto) {
  if (!monto || Number(monto) === 0) return "Gratis";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(monto));
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function LandingReservas() {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  const hoy = new Date();
  const [current, setCurrent] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [activos, setActivos] = useState([]);
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("10:00");
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const year = current.getFullYear();
  const month = current.getMonth();
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const [tenantIdReal, setTenantIdReal] = useState(null);

  // Resolver slug o UUID y cargar activos públicos
  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);

    const esUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId);

    const cargar = async () => {
      try {
        let idFinal = tenantId;

        // Si no es UUID, resolver el slug
        if (!esUUID) {
          const resolved = await reservasService.resolverSlug(tenantId);
          idFinal = resolved.tenant_id;
        }

        setTenantIdReal(idFinal);
        const data = await reservasService.listarActivosPublicos(idFinal);
        setActivos(Array.isArray(data) ? data : []);
        if (data?.length > 0) setActivoSeleccionado(data[0]);
      } catch {
        setError("No se encontró la empresa o no tiene activos disponibles.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [tenantId]);

  // Verificar disponibilidad
  const verificarDisponibilidad = async () => {
    if (!diaSeleccionado || !activoSeleccionado) return;

    const fechaStr = `${diaSeleccionado.getFullYear()}-${String(diaSeleccionado.getMonth() + 1).padStart(2, "0")}-${String(diaSeleccionado.getDate()).padStart(2, "0")}`;
    const fechaInicio = `${fechaStr}T${horaInicio}:00`;
    const fechaFin = `${fechaStr}T${horaFin}:00`;

    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      setDisponibilidad({ disponible: false, mensaje: "La hora de fin debe ser posterior a la de inicio." });
      return;
    }

    setVerificando(true);
    setDisponibilidad(null);
    try {
      const data = await reservasService.consultarDisponibilidad({
        activo_id: activoSeleccionado.id,
        tenant_id: tenantIdReal || tenantId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      });
      setDisponibilidad(data);
    } catch {
      setDisponibilidad({ disponible: false, mensaje: "Error al verificar disponibilidad." });
    } finally {
      setVerificando(false);
    }
  };

  // Al cambiar día/hora/activo, resetear disponibilidad
  useEffect(() => {
    setDisponibilidad(null);
  }, [diaSeleccionado, horaInicio, horaFin, activoSeleccionado]);

  const handleReservar = () => {
    if (!diaSeleccionado || !activoSeleccionado) return;
    const fechaStr = `${diaSeleccionado.getFullYear()}-${String(diaSeleccionado.getMonth() + 1).padStart(2, "0")}-${String(diaSeleccionado.getDate()).padStart(2, "0")}`;
    // Guardamos los datos de la reserva para completar después del login
    sessionStorage.setItem("reserva_pendiente", JSON.stringify({
      activo_id: activoSeleccionado.id,
      tenant_id: tenantIdReal || tenantId,
      fecha_inicio: `${fechaStr}T${horaInicio}:00`,
      fecha_fin: `${fechaStr}T${horaFin}:00`,
    }));
    navigate("/login?returnUrl=/panel/reservas");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || activos.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <Calendar size={48} className="text-slate-300" />
        <p className="text-slate-600 font-medium">{error || "Esta empresa no tiene activos disponibles para reservar."}</p>
        <Link to="/" className="text-indigo-600 font-semibold hover:underline text-sm">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Navbar mínimo */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
              <Hexagon size={20} fill="currentColor" strokeWidth={1} />
            </div>
            PIVOT <span className="text-indigo-600">360</span>
          </Link>
          <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Reserva un espacio</h1>
          <p className="mt-2 text-slate-500">Selecciona un activo, elige la fecha y verifica disponibilidad.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna izquierda — Activos + configuración */}
          <div className="space-y-6">

            {/* Selector de activo */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activo / Recurso</p>
              </div>
              <div className="divide-y divide-slate-50">
                {activos.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setActivoSeleccionado(a)}
                    className={`w-full text-left px-5 py-4 transition-colors ${
                      activoSeleccionado?.id === a.id
                        ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <p className={`font-semibold text-sm ${activoSeleccionado?.id === a.id ? "text-indigo-700" : "text-slate-800"}`}>
                      {a.nombre}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-400">{a.tipo}</p>
                      <p className="text-xs font-bold text-emerald-600">{formatMonto(a.precio_base)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de hora */}
            {diaSeleccionado && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 animate-in fade-in duration-300">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horario</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Desde</label>
                    <input
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hasta</label>
                    <input
                      type="time"
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                      className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    />
                  </div>
                </div>

                {/* Verificar disponibilidad */}
                <button
                  onClick={verificarDisponibilidad}
                  disabled={verificando}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-70"
                >
                  {verificando ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
                  {verificando ? "Verificando..." : "Verificar disponibilidad"}
                </button>

                {/* Resultado disponibilidad */}
                {disponibilidad && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold animate-in fade-in ${
                    disponibilidad.disponible
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}>
                    {disponibilidad.disponible
                      ? <><CheckCircle size={16} /> Horario disponible</>
                      : <><span>✗</span> {disponibilidad.mensaje || "Horario no disponible"}</>
                    }
                  </div>
                )}

                {/* Botón reservar */}
                {disponibilidad?.disponible && (
                  <button
                    onClick={handleReservar}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-[0.98] animate-in fade-in"
                  >
                    Reservar ahora
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                <p className="text-[10px] text-slate-400 text-center">
                  Necesitas iniciar sesión para confirmar tu reserva.
                </p>
              </div>
            )}
          </div>

          {/* Columna derecha — Calendario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Toolbar calendario */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => setCurrent(new Date(year, month - 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <ChevronLeft size={18} className="text-slate-600" />
                </button>
                <span className="flex-1 text-center font-bold text-slate-800 capitalize">
                  {MESES[month]} {year}
                </span>
                <button
                  onClick={() => setCurrent(new Date(year, month + 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <ChevronRight size={18} className="text-slate-600" />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 border-b border-slate-100">
                {DIAS.map((d) => (
                  <div key={d} className="text-center py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {d}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7">
                {days.map(({ date, outside }, i) => {
                  const esHoy = isSameDay(date, hoy);
                  const esPasado = isPast(date);
                  const esSeleccionado = diaSeleccionado && isSameDay(date, diaSeleccionado);

                  return (
                    <button
                      key={i}
                      onClick={() => !outside && !esPasado && setDiaSeleccionado(date)}
                      disabled={outside || esPasado}
                      className={`min-h-[72px] border-r border-b border-slate-100 p-2 flex flex-col items-center transition-all
                        ${outside || esPasado ? "bg-slate-50/50 cursor-not-allowed" : "hover:bg-indigo-50/50 cursor-pointer"}
                        ${esSeleccionado ? "bg-indigo-50 ring-2 ring-inset ring-indigo-400" : ""}
                      `}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        esSeleccionado
                          ? "bg-indigo-600 text-white shadow-md"
                          : esHoy
                          ? "bg-slate-800 text-white"
                          : outside || esPasado
                          ? "text-slate-300"
                          : "text-slate-700"
                      }`}>
                        {date.getDate()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Instrucción */}
              {!diaSeleccionado && (
                <div className="px-6 py-5 border-t border-slate-100 text-center">
                  <p className="text-sm text-slate-400 font-medium">
                    Selecciona un día para ver horarios disponibles
                  </p>
                </div>
              )}

              {/* Día seleccionado */}
              {diaSeleccionado && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-sm font-semibold text-slate-700">
                    📅 {diaSeleccionado.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configura el horario en el panel izquierdo y verifica disponibilidad.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}