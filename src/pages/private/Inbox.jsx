import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Send, Bot, User, Phone, RefreshCw,
  MessageSquare, Loader2, UserCheck, UserPlus,
  CheckCircle, RotateCcw, ArrowLeft,
  Users, Clock, TrendingUp, Activity
} from "lucide-react";
import { toast } from "react-toastify";
import conversacionesService from "../../services/conversacionesService";
import empresasService from "../../services/empresasService";

function formatearHora(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}

function formatearFechaRelativa(timestamp) {
  if (!timestamp) return "";
  const fecha = new Date(timestamp);
  const ahora = new Date();
  const diffMs = ahora - fecha;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffH < 24) return `hace ${diffH}h`;
  if (diffD < 7) return `hace ${diffD}d`;
  return fecha.toLocaleDateString("es-CL");
}

function getBadgeModo(modo) {
  if (modo === "ia") return { label: "IA", cls: "bg-indigo-100 text-indigo-700" };
  return { label: "Humano", cls: "bg-amber-100 text-amber-700" };
}

function getBadgeEstado(estado) {
  const map = {
    "Activa":  { label: "Activa",  cls: "bg-emerald-100 text-emerald-700" },
    "Abierta": { label: "Abierta", cls: "bg-blue-100 text-blue-700" },
    "Cerrada": { label: "Cerrada", cls: "bg-slate-100 text-slate-500" },
  };
  return map[estado] ?? { label: estado, cls: "bg-slate-100 text-slate-500" };
}

// ── Tarjetas de métricas ──────────────────────────────────────────────────────
function MetricasInbox({ metricas, resumen, cargando }) {
  if (cargando) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
            <div className="h-3 bg-slate-100 rounded w-2/3 mb-3" />
            <div className="h-6 bg-slate-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Conversaciones activas",
      value: metricas?.total_activas ?? resumen?.activas ?? "—",
      icon: <MessageSquare size={16} className="text-indigo-500" />,
      cls: "text-indigo-700",
    },
    {
      label: "Sin respuesta",
      value: metricas?.sin_respuesta ?? resumen?.sin_respuesta ?? "—",
      icon: <Clock size={16} className="text-amber-500" />,
      cls: "text-amber-700",
    },
    {
      label: "Modo humano",
      value: metricas?.modo_humano ?? resumen?.modo_humano ?? "—",
      icon: <Users size={16} className="text-emerald-500" />,
      cls: "text-emerald-700",
    },
    {
      label: "Cerradas hoy",
      value: metricas?.cerradas_hoy ?? resumen?.cerradas_hoy ?? "—",
      icon: <TrendingUp size={16} className="text-slate-500" />,
      cls: "text-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            {card.icon}
            <p className="text-xs text-slate-500 font-medium truncate">{card.label}</p>
          </div>
          <p className={`text-xl sm:text-2xl font-bold ${card.cls}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Modal asignar agente ──────────────────────────────────────────────────────
function ModalAsignar({ conversacionId, onAsignado, onCerrar }) {
  const [equipo, setEquipo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [asignando, setAsignando] = useState(null);

  useEffect(() => {
    empresasService.listarSubusuarios()
      .then((data) => setEquipo(Array.isArray(data) ? data : []))
      .catch(() => toast.error("No se pudo cargar el equipo."))
      .finally(() => setCargando(false));
  }, []);

  const handleAsignar = async (usuarioId) => {
    setAsignando(usuarioId);
    try {
      const actualizada = await conversacionesService.asignar(conversacionId, usuarioId);
      toast.success("Conversación asignada correctamente.");
      onAsignado(actualizada);
    } catch {
      toast.error("No se pudo asignar la conversación.");
    } finally {
      setAsignando(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Asignar agente</h3>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {cargando ? (
            <div className="py-8 text-center">
              <Loader2 size={20} className="animate-spin mx-auto text-slate-400" />
            </div>
          ) : equipo.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400">No hay agentes disponibles.</p>
            </div>
          ) : (
            equipo.map((miembro) => (
              <button
                key={miembro.id}
                onClick={() => handleAsignar(miembro.id)}
                disabled={!!asignando}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left disabled:opacity-60"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {miembro.nombre?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {miembro.nombre} {miembro.apellido}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{miembro.email}</p>
                </div>
                {asignando === miembro.id && (
                  <Loader2 size={14} className="animate-spin text-indigo-500 shrink-0 ml-auto" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Inbox() {
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionActual, setConversacionActual] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroModo, setFiltroModo] = useState("");
  const [cargandoLista, setCargandoLista] = useState(true);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mostrarAsignar, setMostrarAsignar] = useState(false);
  const [metricas, setMetricas] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [cargandoMetricas, setCargandoMetricas] = useState(true);
  const mensajesEndRef = useRef(null);

  // ── Cargar métricas ───────────────────────────────────────────────────────
  useEffect(() => {
    const cargarMetricas = async () => {
      setCargandoMetricas(true);
      try {
        const [m, r] = await Promise.allSettled([
          conversacionesService.obtenerMetricas(),
          conversacionesService.obtenerResumenOperativo(),
        ]);
        if (m.status === "fulfilled") setMetricas(m.value);
        if (r.status === "fulfilled") setResumen(r.value);
      } catch {
        // silencioso — las métricas son opcionales
      } finally {
        setCargandoMetricas(false);
      }
    };
    cargarMetricas();
  }, []);

  const cargarConversaciones = useCallback(async () => {
    setCargandoLista(true);
    try {
      const filtros = {};
      if (filtroEstado) filtros.estado = filtroEstado;
      if (filtroModo) filtros.modo_atencion = filtroModo;
      const data = await conversacionesService.listar(filtros);
      setConversaciones(Array.isArray(data) ? data : []);
    } catch {
      toast.error("No se pudieron cargar las conversaciones.");
    } finally {
      setCargandoLista(false);
    }
  }, [filtroEstado, filtroModo]);

  useEffect(() => { cargarConversaciones(); }, [cargarConversaciones]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const seleccionarConversacion = async (conv) => {
    setConversacionActual(conv);
    setMensajes([]);
    setCargandoMensajes(true);
    try {
      const data = await conversacionesService.listarMensajes(conv.id);
      setMensajes(Array.isArray(data) ? data : []);
    } catch {
      toast.error("No se pudieron cargar los mensajes.");
    } finally {
      setCargandoMensajes(false);
    }
  };

  const handleEnviar = async () => {
    const texto = mensaje.trim();
    if (!texto || !conversacionActual) return;
    setEnviando(true);
    try {
      const nuevoMensaje = await conversacionesService.responder(conversacionActual.id, texto);
      setMensajes((prev) => [...prev, nuevoMensaje]);
      setMensaje("");
      setConversaciones((prev) =>
        prev.map((c) =>
          c.id === conversacionActual.id
            ? { ...c, modo_atencion: "humano", ultima_interaccion_at: new Date().toISOString() }
            : c
        )
      );
      setConversacionActual((prev) => prev ? { ...prev, modo_atencion: "humano" } : prev);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "No se pudo enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  };

  const handleCambiarModo = async (modo) => {
    if (!conversacionActual) return;
    try {
      const actualizada = await conversacionesService.cambiarModo(conversacionActual.id, modo);
      setConversacionActual(actualizada);
      setConversaciones((prev) =>
        prev.map((c) => c.id === actualizada.id ? { ...c, modo_atencion: actualizada.modo_atencion } : c)
      );
      toast.success(`Modo cambiado a ${modo === "ia" ? "IA" : "Humano"}.`);
    } catch {
      toast.error("No se pudo cambiar el modo.");
    }
  };

  const handleCerrar = async () => {
    if (!conversacionActual) return;
    if (!window.confirm("¿Cerrar esta conversación?")) return;
    try {
      const actualizada = await conversacionesService.cerrar(conversacionActual.id);
      setConversacionActual(actualizada);
      setConversaciones((prev) =>
        prev.map((c) => c.id === actualizada.id ? { ...c, estado: "Cerrada" } : c)
      );
      toast.success("Conversación cerrada.");
    } catch {
      toast.error("No se pudo cerrar la conversación.");
    }
  };

  const handleReabrir = async () => {
    if (!conversacionActual) return;
    try {
      const actualizada = await conversacionesService.reabrir(conversacionActual.id);
      setConversacionActual(actualizada);
      setConversaciones((prev) =>
        prev.map((c) => c.id === actualizada.id ? { ...c, estado: "Activa" } : c)
      );
      toast.success("Conversación reabierta.");
    } catch {
      toast.error("No se pudo reabrir la conversación.");
    }
  };

  const handleAsignado = (actualizada) => {
    setConversacionActual(actualizada);
    setConversaciones((prev) =>
      prev.map((c) => c.id === actualizada.id ? { ...c, asignado_usuario_id: actualizada.asignado_usuario_id } : c)
    );
    setMostrarAsignar(false);
  };

  const conversacionesFiltradas = conversaciones.filter((c) => {
    const nombre = c.cliente?.nombre_completo ?? "";
    const telefono = c.cliente?.telefono ?? "";
    const q = busqueda.toLowerCase();
    return nombre.toLowerCase().includes(q) || telefono.includes(q);
  });

  return (
    <div className="flex flex-col gap-4 font-sans">

      {/* ── MÉTRICAS ── */}
      <MetricasInbox
        metricas={metricas}
        resumen={resumen}
        cargando={cargandoMetricas}
      />

      {/* ── LAYOUT PRINCIPAL ── */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-220px)] bg-slate-50 rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-200">

        {/* Lista de conversaciones */}
        <div className={`${conversacionActual ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 shrink-0 bg-white border-r border-slate-100 flex-col`}>

          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Inbox</h2>
              <button
                onClick={cargarConversaciones}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Recargar"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="flex-1 text-xs py-1.5 px-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Todos</option>
                <option value="Activa">Activas</option>
                <option value="Abierta">Abiertas</option>
                <option value="Cerrada">Cerradas</option>
              </select>
              <select
                value={filtroModo}
                onChange={(e) => setFiltroModo(e.target.value)}
                className="flex-1 text-xs py-1.5 px-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Modo</option>
                <option value="ia">IA</option>
                <option value="humano">Humano</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {cargandoLista ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            ) : conversacionesFiltradas.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm text-slate-500 font-medium">Sin conversaciones</p>
                <p className="text-xs text-slate-400 mt-1">
                  {busqueda ? "No hay resultados para tu búsqueda." : "Aún no hay mensajes entrantes."}
                </p>
              </div>
            ) : (
              conversacionesFiltradas.map((conv) => {
                const esActiva = conv.id === conversacionActual?.id;
                const ultimoMensaje = conv.mensajes?.[conv.mensajes.length - 1];
                const badgeModo = getBadgeModo(conv.modo_atencion);
                const esCerrada = conv.estado === "Cerrada";

                return (
                  <button
                    key={conv.id}
                    onClick={() => seleccionarConversacion(conv)}
                    className={`w-full text-left px-4 py-3.5 border-b border-slate-50 transition-colors ${
                      esActiva ? "bg-indigo-50 border-l-2 border-l-indigo-500" : "hover:bg-slate-50"
                    } ${esCerrada ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          esActiva ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {(conv.cliente?.nombre_completo ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {conv.cliente?.nombre_completo ?? conv.cliente?.telefono ?? "Desconocido"}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {ultimoMensaje?.contenido ?? "Sin mensajes"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] text-slate-400">
                          {formatearFechaRelativa(conv.ultima_interaccion_at)}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeModo.cls}`}>
                          {badgeModo.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat */}
        {!conversacionActual ? (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-slate-50">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">Selecciona una conversación</p>
              <p className="text-sm text-slate-400 mt-1">para ver los mensajes</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col min-w-0">

            {/* Botón volver móvil */}
            <div className="lg:hidden px-4 py-2 bg-white border-b border-slate-100">
              <button
                onClick={() => setConversacionActual(null)}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={16} /> Volver
              </button>
            </div>

            {/* Header del chat */}
            <div className="px-4 sm:px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {(conversacionActual.cliente?.nombre_completo ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">
                    {conversacionActual.cliente?.nombre_completo ?? "Sin nombre"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Phone size={11} /> {conversacionActual.cliente?.telefono ?? "—"}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getBadgeEstado(conversacionActual.estado).cls}`}>
                      {getBadgeEstado(conversacionActual.estado).label}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getBadgeModo(conversacionActual.modo_atencion).cls}`}>
                      {getBadgeModo(conversacionActual.modo_atencion).label}
                    </span>
                    {conversacionActual.asignado_usuario_id && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Asignada
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Asignar agente */}
                <button
                  onClick={() => setMostrarAsignar(true)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
                  title="Asignar agente"
                >
                  <UserPlus size={14} />
                  <span className="hidden sm:inline">Asignar</span>
                </button>

                {conversacionActual.modo_atencion === "ia" ? (
                  <button
                    onClick={() => handleCambiarModo("humano")}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <UserCheck size={14} />
                    <span className="hidden sm:inline">Tomar control</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleCambiarModo("ia")}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Bot size={14} />
                    <span className="hidden sm:inline">Devolver a IA</span>
                  </button>
                )}

                {conversacionActual.estado === "Cerrada" ? (
                  <button
                    onClick={handleReabrir}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <RotateCcw size={14} />
                    <span className="hidden sm:inline">Reabrir</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCerrar}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <CheckCircle size={14} />
                    <span className="hidden sm:inline">Cerrar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
              {cargandoMensajes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="animate-spin text-slate-400" />
                </div>
              ) : mensajes.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">Sin mensajes aún.</p>
                </div>
              ) : (
                mensajes.map((msg) => {
                  const esEntrante = msg.direccion === "entrante" || msg.remitente === "cliente";
                  const esIA = msg.es_ia;
                  return (
                    <div key={msg.id} className={`flex ${esEntrante ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col gap-1 ${esEntrante ? "items-start" : "items-end"}`}>
                        {!esEntrante && (
                          <div className="flex items-center gap-1 px-1">
                            {esIA ? (
                              <span className="text-[10px] text-indigo-500 flex items-center gap-1">
                                <Bot size={10} /> IA
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <User size={10} /> Agente
                              </span>
                            )}
                          </div>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          esEntrante
                            ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                            : esIA
                            ? "bg-indigo-600 text-white rounded-tr-sm"
                            : "bg-slate-800 text-white rounded-tr-sm"
                        }`}>
                          {msg.contenido}
                        </div>
                        <div className="flex items-center gap-1.5 px-1">
                          <span className="text-[10px] text-slate-400">{formatearHora(msg.timestamp)}</span>
                          {!esEntrante && msg.estado_envio && (
                            <span className={`text-[10px] ${msg.estado_envio === "error" ? "text-red-400" : "text-slate-400"}`}>
                              {msg.estado_envio === "enviado" ? "✓" : msg.estado_envio === "error" ? "✗" : "⏳"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={mensajesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 sm:px-6 py-4 bg-white border-t border-slate-100">
              {conversacionActual.estado === "Cerrada" ? (
                <div className="flex items-center justify-center gap-2 py-2 text-sm text-slate-400">
                  <CheckCircle size={16} />
                  Conversación cerrada —
                  <button onClick={handleReabrir} className="text-indigo-600 hover:underline font-medium">
                    Reabrir para responder
                  </button>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleEnviar();
                      }
                    }}
                    placeholder="Escribe un mensaje..."
                    rows={2}
                    className="flex-1 resize-none px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                  <button
                    onClick={handleEnviar}
                    disabled={!mensaje.trim() || enviando}
                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shrink-0"
                  >
                    {enviando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal asignar */}
      {mostrarAsignar && conversacionActual && (
        <ModalAsignar
          conversacionId={conversacionActual.id}
          onAsignado={handleAsignado}
          onCerrar={() => setMostrarAsignar(false)}
        />
      )}
    </div>
  );
}