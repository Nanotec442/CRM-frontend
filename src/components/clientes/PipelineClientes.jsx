import { useEffect, useMemo, useRef, useState } from "react";
import {
  closestCorners, DndContext, DragOverlay,
  PointerSensor, useDroppable, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Mail, Phone, Building2, MoreVertical, DollarSign, Users,
  Fingerprint, Globe, UserCheck, PhoneCall, Calendar, Tag, Plus, X, Archive
} from "lucide-react";
import { tarjetasService } from "../../services/tarjetasService";
import { toast } from "react-toastify";

const COLUMN_PALETTE = [
  { ring: "ring-slate-200", glow: "hover:ring-indigo-300", dot: "bg-slate-700", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  { ring: "ring-slate-200", glow: "hover:ring-indigo-300", dot: "bg-indigo-500", badge: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  { ring: "ring-slate-200", glow: "hover:ring-indigo-300", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-100" },
  { ring: "ring-slate-200", glow: "hover:ring-indigo-300", dot: "bg-sky-500", badge: "bg-sky-50 text-sky-700 border-sky-100" },
  { ring: "ring-slate-200", glow: "hover:ring-indigo-300", dot: "bg-cyan-500", badge: "bg-cyan-50 text-cyan-700 border-cyan-100" },
];

const getColumnPalette = (index) => COLUMN_PALETTE[index % COLUMN_PALETTE.length];

const ORIGEN_CONFIG = {
  web: { label: "Web", Icon: Globe },
  referido: { label: "Referido", Icon: UserCheck },
  email: { label: "Email", Icon: Mail },
  llamada: { label: "Llamada", Icon: PhoneCall },
  evento: { label: "Evento", Icon: Calendar },
};

const getOrigenConfig = (origen) =>
  origen ? (ORIGEN_CONFIG[origen.toLowerCase()] ?? { label: origen, Icon: Tag }) : null;

const getClienteNombre = (c) => c?.nombre_completo ?? c?.nombre ?? "Sin nombre";
const getClienteEmail = (c) => c?.email?.trim() ?? "";
const getClienteTelefono = (c) => c?.telefono?.trim() ?? "";
const getClienteEmpresa = (c) => c?.empresa?.trim() ?? "";
const getClienteRut = (c) => c?.rut?.trim() ?? c?.documento?.trim() ?? "";

const getInitials = (nombre) => {
  const words = String(nombre ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return words.length === 0 ? "SN" : words.map((w) => w[0]?.toUpperCase() ?? "").join("");
};

const AVATAR_COLORS = ["bg-indigo-600", "bg-slate-700", "bg-blue-600", "bg-sky-600", "bg-cyan-600"];
const getAvatarColor = (nombre) => {
  let sum = 0;
  for (const ch of String(nombre)) sum += ch.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const formatValorCLP = (valor) => {
  const num = Number(valor || 0);
  if (!num) return null;
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(num);
};

const normalizarColumnas = (data) => {
  const raw = Array.isArray(data) ? data : data?.columnas ?? [];
  return raw
    .filter((col) => col?.id && col?.nombre)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .slice(0, 9)
    .map((col, index) => ({
      id: col.id,
      titulo: col.nombre,
      orden: col.orden ?? index,
      ...getColumnPalette(index),
    }));
};

const moveTarjetaInState = (tarjetas, tarjetaId, targetStageId, overCardId) => {
  const currentIndex = tarjetas.findIndex((t) => String(t.id) === String(tarjetaId));
  if (currentIndex === -1) return tarjetas;
  const next = [...tarjetas];
  const [moved] = next.splice(currentIndex, 1);
  const movedTarjeta = { ...moved, stage_id: targetStageId };
  if (overCardId && String(overCardId) !== String(tarjetaId)) {
    const overIndex = next.findIndex((t) => String(t.id) === String(overCardId));
    if (overIndex >= 0) { next.splice(overIndex, 0, movedTarjeta); return next; }
  }
  const lastTargetIndex = [...next].reverse().findIndex((t) => t.stage_id === targetStageId);
  const insertAt = lastTargetIndex === -1 ? next.length : next.length - lastTargetIndex;
  next.splice(insertAt, 0, movedTarjeta);
  return next;
};

const NombreModalContenido = ({ titulo, valorInicial, onConfirm, onCancel }) => {
  const [valor, setValor] = useState(valorInicial ?? "");
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="w-full max-w-md bg-white rounded-xl p-5 shadow-xl ring-1 ring-slate-200"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-bold text-slate-900">{titulo}</h3>
      <p className="mt-1.5 text-sm text-slate-600">Asigna un nombre descriptivo para esta etapa del proceso.</p>
      <input
        ref={inputRef}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && valor.trim()) onConfirm(valor.trim());
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Ej. Negociación, Primer Contacto…"
        className="mt-4 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
      />
      <div className="mt-5 flex justify-end gap-2.5">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => valor.trim() && onConfirm(valor.trim())}
          disabled={!valor.trim()}
          className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          Guardar Etapa
        </button>
      </div>
    </div>
  );
};

const NombreModal = ({ visible, titulo, valorInicial, onConfirm, onCancel }) => {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm transition-all"
      onClick={onCancel}
    >
      <NombreModalContenido
        key={`${titulo}-${valorInicial ?? ""}`}
        titulo={titulo}
        valorInicial={valorInicial}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </div>
  );
};

const PipelineHeader = ({ totalLeads, totalValorGlobal, columnas }) => (
  <div className="space-y-4 mb-5 font-sans">
    <section>
      <h1 className="text-2xl font-bold text-slate-900">Pipeline de Ventas</h1>
      <p className="mt-1 text-sm text-slate-600">
        Gestión visual de oportunidades comerciales y seguimiento de leads.
      </p>
    </section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
            <Users size={16} className="text-indigo-600" /> Total Leads
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-slate-900">{totalLeads}</h2>
        </div>
      </div>
      {totalValorGlobal && (
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <DollarSign size={16} className="text-emerald-600" /> Volumen Total
            </p>
            <h2 className="mt-1.5 text-2xl font-bold text-slate-900">{totalValorGlobal}</h2>
          </div>
        </div>
      )}
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
            <MoreVertical size={16} className="text-slate-400" /> Etapas Activas
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-slate-900">
            {columnas.length} <span className="text-base font-medium text-slate-400">/ 9</span>
          </h2>
        </div>
      </div>
    </section>
  </div>
);

const TarjetaCard = ({ tarjeta, dragOverlay = false, onArchivar }) => {
  const cliente = tarjeta.cliente;
  const nombre = getClienteNombre(cliente);
  const email = getClienteEmail(cliente);
  const telefono = getClienteTelefono(cliente);
  const empresa = getClienteEmpresa(cliente);
  const rut = getClienteRut(cliente);
  const valorFmt = formatValorCLP(tarjeta.valor_estimado);
  const origenCfg = getOrigenConfig(tarjeta.origen);
  const avatarColor = getAvatarColor(nombre);

  return (
    <article
      className={`group relative bg-white border rounded-lg p-3.5 transition-all duration-200 cursor-grab active:cursor-grabbing
        ${dragOverlay
          ? "rotate-2 shadow-xl border-indigo-400 ring-2 ring-indigo-400/20 scale-105 z-50"
          : "border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"}`}
    >
      <div className="flex items-start gap-3 mb-2.5">
        <div className={`${avatarColor} shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-white text-sm font-bold`}>
          {getInitials(nombre)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{nombre}</h4>
            <button
              onClick={(e) => { e.stopPropagation(); onArchivar(tarjeta.id); }}
              title="Archivar oportunidad"
              className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-600 hover:bg-amber-50 rounded p-1.5 transition-all shrink-0"
            >
              <Archive size={14} />
            </button>
          </div>
          {empresa && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Building2 size={12} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-600 truncate">{empresa}</span>
            </div>
          )}
        </div>
      </div>

      {rut && (
        <div className="flex items-center gap-1.5 mb-2">
          <Fingerprint size={12} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 font-mono">{rut}</span>
        </div>
      )}

      {(email || telefono) && (
        <div className="flex items-center gap-2 mb-3">
          {email && (
            <a href={`mailto:${email}`} title={email} className="text-slate-400 hover:text-indigo-600 transition-colors" onClick={(e) => e.stopPropagation()}>
              <Mail size={14} />
            </a>
          )}
          {telefono && (
            <a href={`tel:${telefono}`} title={telefono} className="text-slate-400 hover:text-indigo-600 transition-colors" onClick={(e) => e.stopPropagation()}>
              <Phone size={14} />
            </a>
          )}
          <span className="text-xs text-slate-500 truncate ml-auto">{email || telefono}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
        {origenCfg ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
            <origenCfg.Icon size={12} /> {origenCfg.label}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-mono">
            #{String(tarjeta.id).slice(-6).toUpperCase()}
          </span>
        )}
        {valorFmt && <span className="text-sm font-semibold text-emerald-600">{valorFmt}</span>}
      </div>
    </article>
  );
};

const SortableTarjeta = ({ tarjeta, stageId, onArchivar }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: `card:${tarjeta.id}`,
      data: { type: "card", tarjetaId: tarjeta.id, stageId },
    });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`touch-none ${isDragging ? "opacity-40" : ""}`}
    >
      <TarjetaCard tarjeta={tarjeta} onArchivar={onArchivar} />
    </div>
  );
};

const ColumnDropZone = ({ columna, lista, activeStageId, onEdit, onDelete, onArchivarTarjeta }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${columna.id}`,
    data: { type: "column", stageId: columna.id },
  });

  const isActive = isOver || activeStageId === columna.id;
  const totalValor = lista.reduce((acc, t) => acc + Number(t.valor_estimado || 0), 0);
  const totalFmt = formatValorCLP(totalValor);

  return (
    <section
      ref={setNodeRef}
      className={`flex flex-col w-72 min-w-[288px] max-w-[288px] h-full rounded-xl border transition-colors duration-200
        ${isActive ? "bg-indigo-50/50 border-indigo-200" : "bg-slate-50/50 border-slate-200"}`}
    >
      <div className="p-3 border-b border-slate-200/50">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${columna.dot}`} />
            <button
              type="button"
              onClick={onEdit}
              className="text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors text-left"
            >
              {columna.titulo}
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${columna.badge}`}>
              {lista.length}
            </span>
            {onDelete && (
              <button onClick={onDelete} className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between h-4">
          {totalFmt && lista.length > 0 ? (
            <p className="text-xs text-slate-500">Vol: <span className="font-medium text-slate-700">{totalFmt}</span></p>
          ) : <span />}
          {isActive && <p className="text-[10px] uppercase font-bold text-indigo-600">Soltar aquí</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <SortableContext items={lista.map((t) => `card:${t.id}`)} strategy={verticalListSortingStrategy}>
          {lista.length === 0 ? (
            <div className={`h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 ${isActive ? "border-indigo-300 bg-indigo-50/50" : "border-slate-200"}`}>
              <span className="text-sm font-medium">Sin tarjetas</span>
            </div>
          ) : (
            lista.map((tarjeta) => (
              <SortableTarjeta key={tarjeta.id} tarjeta={tarjeta} stageId={columna.id} onArchivar={onArchivarTarjeta} />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const PipelineClientes = ({ clientes: clientesReales = [] }) => {
  const [tarjetas, setTarjetas] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [modal, setModal] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorMovimiento, setErrorMovimiento] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [activeStageId, setActiveStageId] = useState(null);

  const tarjetasRef = useRef([]);
  const dragSnapshotRef = useRef([]);
  const dragOriginStageRef = useRef(null);

  useEffect(() => { tarjetasRef.current = tarjetas; }, [tarjetas]);

  const sincronizarTablero = async () => {
    const [dataTablero, dataColumnas] = await Promise.all([
      tarjetasService.getTablero(),
      tarjetasService.getColumnas(),
    ]);
    const columnasNormalizadas = normalizarColumnas(dataColumnas);
    const rawTarjetas = Array.isArray(dataTablero) ? dataTablero : dataTablero?.tarjetas ?? [];
    const ids = new Set();
    const limpias = rawTarjetas.filter((t) => {
      const id = String(t?.id ?? "");
      if (!id || ids.has(id)) return false;
      ids.add(id);
      return true;
    });
    setColumnas(columnasNormalizadas);
    setTarjetas(limpias);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setErrorCarga("");
        await sincronizarTablero();
      } catch (error) {
        console.error("Error al cargar el pipeline:", error);
        setErrorCarga("No se pudo cargar el pipeline.");
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // ── Archivado: optimistic UI + llamada real al backend ──────────────────
  const handleArchivarTarjeta = async (tarjetaId) => {
    const confirmado = window.confirm("¿Archivar esta oportunidad? Desaparecerá del tablero activo.");
    if (!confirmado) return;

    const snapshot = tarjetasRef.current;
    setTarjetas((prev) => prev.filter((t) => String(t.id) !== String(tarjetaId)));

    try {
      await tarjetasService.archivarTarjeta(tarjetaId);
      toast.success("Oportunidad archivada.");
    } catch (err) {
      console.error("Error al archivar tarjeta:", err);
      setTarjetas(snapshot);
      toast.error(err?.response?.data?.detail || "No se pudo archivar. La tarjeta fue restaurada.");
    }
  };

  const clienteMap = useMemo(() => {
    const map = new Map();
    clientesReales.forEach((c) => {
      const id = c?.id ?? c?.cliente_id;
      if (id != null) map.set(String(id), c);
    });
    return map;
  }, [clientesReales]);

  const tarjetasConCliente = useMemo(
    () => tarjetas.map((t) => ({
      ...t,
      cliente: clienteMap.get(String(t?.cliente_id ?? "")) ?? null,
    })),
    [tarjetas, clienteMap]
  );

  const tarjetasById = useMemo(() => {
    const map = new Map();
    tarjetasConCliente.forEach((t) => map.set(String(t.id), t));
    return map;
  }, [tarjetasConCliente]);

  const tarjetasPorColumna = useMemo(() => {
    const grouped = new Map();
    columnas.forEach((col) => grouped.set(col.id, []));
    tarjetasConCliente.forEach((t) => {
      if (grouped.has(t.stage_id)) grouped.get(t.stage_id).push(t);
    });
    return grouped;
  }, [columnas, tarjetasConCliente]);

  const tarjetasSinColumnaValida = useMemo(
    () => tarjetasConCliente.filter((t) => !columnas.some((col) => col.id === t.stage_id)),
    [tarjetasConCliente, columnas]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getDestinationStageId = (over) => {
    if (!over?.data?.current) return null;
    const { type, stageId } = over.data.current;
    return type === "column" || type === "card" ? stageId : null;
  };

  const handleDragStart = (event) => {
    setErrorMovimiento("");
    setActiveId(event.active.id);
    const originStage = event.active.data.current?.stageId ?? null;
    dragSnapshotRef.current = tarjetasRef.current;
    dragOriginStageRef.current = originStage;
    setActiveStageId(originStage);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeData = active.data.current;
    const overData = over.data.current;
    if (!activeData || !overData) return;

    const sourceStageId = activeData.stageId;
    const targetStageId = getDestinationStageId(over);
    if (!sourceStageId || !targetStageId) return;
    setActiveStageId(targetStageId);

    if (sourceStageId === targetStageId) {
      if (overData.type === "card" && String(active.id) !== String(over.id)) {
        setTarjetas((prev) => {
          const oldIndex = prev.findIndex((t) => `card:${t.id}` === active.id);
          const newIndex = prev.findIndex((t) => `card:${t.id}` === over.id);
          if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
      return;
    }

    const tarjetaId = String(activeData.tarjetaId);
    const overCardId = overData.type === "card" ? overData.tarjetaId : null;
    setTarjetas((prev) => moveTarjetaInState(prev, tarjetaId, targetStageId, overCardId));
    active.data.current.stageId = targetStageId;
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    const activeData = active.data.current;
    setActiveId(null);
    setActiveStageId(null);

    if (!over || !activeData) {
      dragSnapshotRef.current = [];
      dragOriginStageRef.current = null;
      return;
    }

    const tarjetaId = activeData.tarjetaId;
    const targetStageId = getDestinationStageId(over);
    if (!tarjetaId || !targetStageId) {
      dragSnapshotRef.current = [];
      dragOriginStageRef.current = null;
      return;
    }

    const originStageId = dragOriginStageRef.current;
    if (originStageId === targetStageId) {
      dragSnapshotRef.current = [];
      dragOriginStageRef.current = null;
      return;
    }

    try {
      await tarjetasService.moverTarjeta(tarjetaId, targetStageId);
    } catch (error) {
      console.error("Error al mover tarjeta:", error);
      setTarjetas((prev) =>
        prev.map((t) => String(t.id) === String(tarjetaId) ? { ...t, stage_id: originStageId } : t)
      );
      setErrorMovimiento(String(
        error?.response?.data?.detail ||
        "No se pudo guardar el movimiento. La tarjeta volvió a su columna original."
      ));
    } finally {
      dragSnapshotRef.current = [];
      dragOriginStageRef.current = null;
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveStageId(null);
    setTarjetas(dragSnapshotRef.current.length ? dragSnapshotRef.current : tarjetasRef.current);
    dragSnapshotRef.current = [];
    dragOriginStageRef.current = null;
  };

  const crearColumna = async (nombre) => {
    const limpio = String(nombre ?? "").trim();
    if (!limpio || columnas.length >= 9) return;
    if (columnas.some((col) => col.titulo.toLowerCase() === limpio.toLowerCase())) {
      setErrorMovimiento("Ya existe una etapa con ese nombre.");
      return;
    }
    try {
      setErrorMovimiento("");
      const nueva = await tarjetasService.crearColumna({ nombre: limpio });
      setColumnas((prev) => [
        ...prev,
        { id: nueva.id, titulo: nueva.nombre, orden: nueva.orden ?? prev.length, ...getColumnPalette(prev.length) },
      ]);
    } catch (error) {
      setErrorMovimiento(String(error?.response?.data?.detail || "No se pudo crear la etapa."));
    }
  };

  const editarColumna = async (id, nuevoNombre) => {
    const limpio = String(nuevoNombre ?? "").trim();
    if (!limpio) return;
    if (columnas.some((col) => col.titulo.toLowerCase() === limpio.toLowerCase() && col.id !== id)) {
      setErrorMovimiento("Ese nombre ya está en uso por otra etapa.");
      return;
    }
    const columnasPrevias = columnas;
    setColumnas((prev) => prev.map((col) => (col.id === id ? { ...col, titulo: limpio } : col)));
    try {
      setErrorMovimiento("");
      await tarjetasService.editarColumna(id, { nombre: limpio });
      setTarjetas((prev) =>
        prev.map((t) => t.stage_id === id ? { ...t, posicion_tablero: limpio } : t)
      );
    } catch (error) {
      setColumnas(columnasPrevias);
      setErrorMovimiento(String(error?.response?.data?.detail || "No se pudo renombrar la etapa."));
    }
  };

  const eliminarColumna = async (id) => {
    if (columnas.length <= 3) return;
    const confirmado = window.confirm("Eliminar esta etapa moverá sus tarjetas a la primera columna. ¿Deseas continuar?");
    if (!confirmado) return;
    const primerId = columnas[0]?.id;
    if (!primerId || primerId === id) return;
    const afectadas = tarjetas.filter((t) => t.stage_id === id);
    const columnasPrevias = columnas;
    const tarjetasPrevias = tarjetas;
    setColumnas((prev) => prev.filter((col) => col.id !== id));
    setTarjetas((prev) => prev.map((t) => (t.stage_id === id ? { ...t, stage_id: primerId } : t)));
    try {
      setErrorMovimiento("");
      await tarjetasService.eliminarColumna(id, primerId);
      if (afectadas.length) await sincronizarTablero();
    } catch (error) {
      setColumnas(columnasPrevias);
      setTarjetas(tarjetasPrevias);
      setErrorMovimiento(String(
        error?.response?.data?.detail ||
        "No se pudieron guardar algunos cambios de columna. Recarga la vista para sincronizar."
      ));
    }
  };

  const activeTarjeta = activeId ? tarjetasById.get(String(activeId).replace("card:", "")) : null;
  const totalLeads = tarjetas.length;
  const totalValorGlobal = formatValorCLP(tarjetas.reduce((acc, t) => acc + (Number(t.valor_estimado) || 0), 0));

  if (cargando) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500 font-medium">Construyendo tablero...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-90px)] min-h-[500px] w-full flex-col font-sans">
      <PipelineHeader totalLeads={totalLeads} totalValorGlobal={totalValorGlobal} columnas={columnas} />

      {(errorCarga || errorMovimiento || tarjetasSinColumnaValida.length > 0) && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm">
          <span className="font-medium">
            ⚠ {errorCarga || errorMovimiento || `${tarjetasSinColumnaValida.length} tarjeta(s) con stage_id sin columna activa.`}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex h-full gap-3 min-w-max px-1">
            {columnas.map((columna) => (
              <ColumnDropZone
                key={columna.id}
                columna={columna}
                lista={tarjetasPorColumna.get(columna.id) ?? []}
                activeStageId={activeStageId}
                onEdit={() => setModal({ tipo: "editar", id: columna.id, valorInicial: columna.titulo })}
                onDelete={columnas.length > 3 ? () => eliminarColumna(columna.id) : null}
                onArchivarTarjeta={handleArchivarTarjeta}
              />
            ))}

            {columnas.length < 9 && (
              <button
                onClick={() => setModal({ tipo: "nueva" })}
                className="group flex h-full min-h-[200px] w-[288px] shrink-0 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 text-slate-500 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white border border-slate-200 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-colors">
                  <Plus size={20} />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-semibold">Añadir etapa</span>
                  <span className="block text-xs text-slate-400 mt-1">Límite: {columnas.length}/9</span>
                </div>
              </button>
            )}
          </div>

          <DragOverlay>
            {activeTarjeta ? <TarjetaCard tarjeta={activeTarjeta} dragOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <NombreModal
        visible={!!modal}
        titulo={modal?.tipo === "nueva" ? "Crear nueva etapa" : "Renombrar etapa"}
        valorInicial={modal?.valorInicial}
        onCancel={() => setModal(null)}
        onConfirm={(valor) => {
          if (modal?.tipo === "nueva") crearColumna(valor);
          else editarColumna(modal?.id, valor);
          setModal(null);
        }}
      />
    </div>
  );
};

export default PipelineClientes;