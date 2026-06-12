import { useState, useEffect } from "react";
import {
  ArrowLeft, Plus, Trash2, Loader2, Save,
  Clock, CalendarOff, ShieldCheck, RefreshCw
} from "lucide-react";
import { toast } from "react-toastify";
import activosService, { reglasService, disponibilidadService } from "../../services/activosService";

// ── Constantes ────────────────────────────────────────────────────────────
const TIPOS_REGLA = [
  { value: "duracion_minima",     label: "Duración mínima" },
  { value: "duracion_maxima",     label: "Duración máxima" },
  { value: "anticipacion_minima", label: "Anticipación mínima" },
  { value: "no_pasado",           label: "No reservas en el pasado" },
  { value: "horario_permitido",   label: "Horario permitido" },
];

const TIPOS_BLOQUEO = [
  { value: "bloque",        label: "Bloqueo general" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "evento",        label: "Evento especial" },
];

const ESTADOS_ACTIVO = ["Disponible", "Mantenimiento", "Fuera de servicio", "Inactivo"];
const TABS = [
  { id: "general",        label: "General" },
  { id: "reglas",         label: "Condiciones operativas" },
  { id: "disponibilidad", label: "Disponibilidad" },
];

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 text-sm bg-white";
const labelCls = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5";

// ── Tab: General ──────────────────────────────────────────────────────────
function TabGeneral({ activo, resourceTypes, onGuardar }) {
  const [form, setForm] = useState({
    nombre:                  activo.nombre || "",
    sku:                     activo.sku || "",
    codigo_interno:          activo.codigo_interno || "",
    resource_type_id:        activo.resource_type_id || "",
    tipo:                    activo.tipo || "",
    categoria:               activo.categoria || "",
    descripcion:             activo.descripcion || "",
    estado:                  activo.estado || "Disponible",
    precio_base:             activo.precio_base ?? "",
    buffer_limpieza_minutos: activo.buffer_limpieza_minutos ?? 0,
    capacidad:               activo.capacidad ?? "",
    ubicacion:               activo.ubicacion || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await onGuardar(activo.id, {
        ...form,
        resource_type_id:        form.resource_type_id || null,
        precio_base:             form.precio_base !== "" ? Number(form.precio_base) : null,
        buffer_limpieza_minutos: Number(form.buffer_limpieza_minutos) || 0,
        capacidad:               form.capacidad !== "" ? Number(form.capacidad) : null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {resourceTypes.length > 0 && (
        <div>
          <label className={labelCls}>Tipo de Recurso</label>
          <select name="resource_type_id" value={form.resource_type_id} onChange={handleChange} className={inputCls}>
            <option value="">— Sin tipo específico —</option>
            {resourceTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.nombre}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nombre *</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Código único (SKU)</label>
          <input name="sku" value={form.sku} onChange={handleChange} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Código Interno</label>
          <input name="codigo_interno" value={form.codigo_interno} onChange={handleChange} className={inputCls} placeholder="Opcional" />
        </div>
        <div>
          <label className={labelCls}>Estado operativo</label>
          <select name="estado" value={form.estado} onChange={handleChange} className={inputCls}>
            {ESTADOS_ACTIVO.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Categoría</label>
          <input name="categoria" value={form.categoria} onChange={handleChange} className={inputCls} placeholder="Opcional" />
        </div>
        <div>
          <label className={labelCls}>Tipo (legacy)</label>
          <input name="tipo" value={form.tipo} onChange={handleChange} className={inputCls} placeholder="Opcional" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Descripción</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2} className={`${inputCls} resize-none`} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Precio Base (CLP/hr)</label>
          <input name="precio_base" type="number" min="0" value={form.precio_base} onChange={handleChange} className={inputCls} placeholder="0" />
        </div>
        <div>
          <label className={labelCls}>Capacidad</label>
          <input name="capacidad" type="number" min="1" value={form.capacidad} onChange={handleChange} className={inputCls} placeholder="—" />
        </div>
        <div>
          <label className={labelCls}>Intervalo entre usos (min)</label>
          <input name="buffer_limpieza_minutos" type="number" min="0" value={form.buffer_limpieza_minutos} onChange={handleChange} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Ubicación</label>
        <input name="ubicacion" value={form.ubicacion} onChange={handleChange} className={inputCls} placeholder="Piso 2, Sede Norte..." />
      </div>
      <div className="pt-2 flex justify-end">
        <button onClick={handleGuardar} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

// ── Tab: Condiciones Operativas (Reglas) ──────────────────────────────────
function TabReglas({ activoId }) {
  const [reglas, setReglas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tipo_regla: "duracion_minima", nombre: "", prioridad: 100, activa: true,
  });
  const [minutos, setMinutos] = useState("");
  const [horaDesde, setHoraDesde] = useState("08:00");
  const [horaHasta, setHoraHasta] = useState("20:00");

  useEffect(() => {
    reglasService.listar(activoId)
      .then(setReglas)
      .catch(() => toast.error("No se pudieron cargar las condiciones."))
      .finally(() => setLoading(false));
  }, [activoId]);

  const buildValor = () => {
    const tipo = form.tipo_regla;
    if (["duracion_minima", "duracion_maxima", "anticipacion_minima"].includes(tipo))
      return { minutos: Number(minutos) };
    if (tipo === "horario_permitido") return { desde: horaDesde, hasta: horaHasta };
    return {};
  };

  const handleCrear = async () => {
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio."); return; }
    const necesitaMinutos = ["duracion_minima", "duracion_maxima", "anticipacion_minima"].includes(form.tipo_regla);
    if (necesitaMinutos && !minutos) { toast.error("Ingresa los minutos."); return; }

    setSaving(true);
    try {
      const nueva = await reglasService.crear(activoId, { ...form, valor: buildValor() });
      setReglas(prev => [...prev, nueva]);
      setForm({ tipo_regla: "duracion_minima", nombre: "", prioridad: 100, activa: true });
      setMinutos("");
      toast.success("Condición operativa agregada.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al crear la condición.");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (reglaId) => {
    if (!window.confirm("¿Eliminar esta condición?")) return;
    try {
      await reglasService.eliminar(activoId, reglaId);
      setReglas(prev => prev.filter(r => r.id !== reglaId));
      toast.success("Condición eliminada.");
    } catch {
      toast.error("No se pudo eliminar.");
    }
  };

  const necesitaMinutos = ["duracion_minima", "duracion_maxima", "anticipacion_minima"].includes(form.tipo_regla);
  const necesitaHorario = form.tipo_regla === "horario_permitido";

  const renderValor = (r) => {
    const v = r.valor || {};
    if (v.minutos !== undefined) return `${v.minutos} min`;
    if (v.desde) return `${v.desde} → ${v.hasta}`;
    return "Sin parámetros";
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-500" />
          Nueva condición operativa
        </h4>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Define cómo se puede reservar u operar este recurso: duración mínima, anticipación, horario permitido, etc.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Tipo de condición</label>
            <select value={form.tipo_regla}
              onChange={e => setForm(p => ({ ...p, tipo_regla: e.target.value }))} className={inputCls}>
              {TIPOS_REGLA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Descripción</label>
            <input value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              className={inputCls}
              placeholder={`Ej: ${TIPOS_REGLA.find(t => t.value === form.tipo_regla)?.label}`} />
          </div>
        </div>

        {necesitaMinutos && (
          <div className="mb-4">
            <label className={labelCls}>Minutos</label>
            <input type="number" min="1" value={minutos}
              onChange={e => setMinutos(e.target.value)} className={inputCls} placeholder="Ej: 60" />
          </div>
        )}
        {necesitaHorario && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Desde</label>
              <input type="time" value={horaDesde} onChange={e => setHoraDesde(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hasta</label>
              <input type="time" value={horaHasta} onChange={e => setHoraHasta(e.target.value)} className={inputCls} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 mb-4">
          <div>
            <label className={labelCls}>Prioridad</label>
            <input type="number" min="1" value={form.prioridad}
              onChange={e => setForm(p => ({ ...p, prioridad: Number(e.target.value) }))}
              className={`${inputCls} w-28`} />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.activa}
                onChange={e => setForm(p => ({ ...p, activa: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
              <span className="text-sm font-medium text-slate-700">Activa</span>
            </label>
          </div>
        </div>

        <button onClick={handleCrear} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-60">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Agregar condición
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Cargando...</div>
      ) : reglas.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm italic">
          Sin condiciones operativas. Las reservas no tienen restricciones adicionales.
        </div>
      ) : (
        <div className="space-y-2">
          {reglas.map(r => (
            <div key={r.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${r.activa ? "bg-emerald-500" : "bg-slate-300"}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{r.nombre}</p>
                  <p className="text-xs text-slate-400">
                    {TIPOS_REGLA.find(t => t.value === r.tipo_regla)?.label} — {renderValor(r)} — prioridad {r.prioridad}
                  </p>
                </div>
              </div>
              <button onClick={() => handleEliminar(r.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Disponibilidad / Bloqueos ────────────────────────────────────────
function TabDisponibilidad({ activoId }) {
  const [bloqueos, setBloqueos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tipo: "bloque", fecha_inicio: "", fecha_fin: "",
    motivo: "", origen: "manual", activa: true,
  });

  useEffect(() => {
    disponibilidadService.listar(activoId)
      .then(setBloqueos)
      .catch(() => toast.error("No se pudieron cargar los bloqueos."))
      .finally(() => setLoading(false));
  }, [activoId]);

  const handleCrear = async () => {
    if (!form.fecha_inicio || !form.fecha_fin) {
      toast.error("Las fechas son obligatorias."); return;
    }
    if (form.fecha_fin <= form.fecha_inicio) {
      toast.error("La fecha fin debe ser posterior al inicio."); return;
    }
    setSaving(true);
    try {
      const nuevo = await disponibilidadService.crear(activoId, { ...form, detalles: {} });
      setBloqueos(prev => [...prev, nuevo]);
      setForm({ tipo: "bloque", fecha_inicio: "", fecha_fin: "", motivo: "", origen: "manual", activa: true });
      toast.success("Bloqueo registrado.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al crear el bloqueo.");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (dispId) => {
    if (!window.confirm("¿Eliminar este bloqueo?")) return;
    try {
      await disponibilidadService.eliminar(activoId, dispId);
      setBloqueos(prev => prev.filter(b => b.id !== dispId));
      toast.success("Bloqueo eliminado.");
    } catch {
      toast.error("No se pudo eliminar.");
    }
  };

  const formatFecha = (f) => f
    ? new Date(f).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })
    : "—";

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CalendarOff size={16} className="text-rose-500" />
          Registrar bloqueo de disponibilidad
        </h4>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Marca períodos donde el recurso no está disponible: mantención, feriado, evento interno o bloqueo manual.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Tipo de bloqueo</label>
            <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className={inputCls}>
              {TIPOS_BLOQUEO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Motivo</label>
            <input value={form.motivo} onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))}
              className={inputCls} placeholder="Ej: Mantención programada" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Inicio del bloqueo</label>
            <input type="datetime-local" value={form.fecha_inicio}
              onChange={e => setForm(p => ({ ...p, fecha_inicio: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Fin del bloqueo</label>
            <input type="datetime-local" value={form.fecha_fin}
              onChange={e => setForm(p => ({ ...p, fecha_fin: e.target.value }))} className={inputCls} />
          </div>
        </div>
        <button onClick={handleCrear} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-all disabled:opacity-60">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Registrar bloqueo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Cargando...</div>
      ) : bloqueos.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm italic">
          Sin bloqueos registrados. El recurso está disponible en todos los horarios.
        </div>
      ) : (
        <div className="space-y-2">
          {bloqueos.map(b => (
            <div key={b.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <Clock size={15} className="text-rose-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {TIPOS_BLOQUEO.find(t => t.value === b.tipo)?.label || b.tipo}
                    {b.motivo && <span className="font-normal text-slate-500"> — {b.motivo}</span>}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatFecha(b.fecha_inicio)} → {formatFecha(b.fecha_fin)}
                  </p>
                </div>
              </div>
              <button onClick={() => handleEliminar(b.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────
export default function ActivoDetalle({ activo, resourceTypes = [], onVolver, onGuardar, onRefresh }) {
  const [tab, setTab] = useState("general");

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <button onClick={onVolver}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al inventario
        </button>
        {onRefresh && (
          <button onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors">
            <RefreshCw size={13} /> Recargar
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{activo.nombre}</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {activo.resource_type?.nombre
                  ? <span className="font-medium text-indigo-600">{activo.resource_type.nombre}</span>
                  : <span className="italic">Recurso genérico</span>
                }
                {activo.sku && <span className="ml-2 font-mono text-slate-400">· {activo.sku}</span>}
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
              activo.estado === "Disponible"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : activo.estado === "Mantenimiento"
                ? "bg-amber-50 text-amber-700 border-amber-100"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}>
              {activo.estado}
            </span>
          </div>

          <div className="flex gap-0 border-b border-slate-100 -mb-5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                  tab === t.id
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {tab === "general" && (
            <TabGeneral activo={activo} resourceTypes={resourceTypes} onGuardar={onGuardar} />
          )}
          {tab === "reglas" && (
            <TabReglas activoId={activo.id} />
          )}
          {tab === "disponibilidad" && (
            <TabDisponibilidad activoId={activo.id} />
          )}
        </div>
      </div>
    </div>
  );
}