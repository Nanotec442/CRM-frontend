import { useState } from "react";
import {
  ChevronDown, ChevronUp, Plus, Trash2, Pencil,
  ShieldCheck, Package, Check, X, Loader2, Info
} from "lucide-react";
import { toast } from "react-toastify";
import resourceTypesService from "../../services/resourceTypesService";

// ── Constantes ────────────────────────────────────────────────────────────
const ESTADOS = ["Disponible", "Mantenimiento", "Fuera de servicio", "Inactivo"];

const UNIDADES = [
  { value: "bloque_horario", label: "Bloque horario" },
  { value: "dia",            label: "Día completo" },
  { value: "turno",          label: "Turno" },
  { value: "hora",           label: "Por hora" },
  { value: "unidad",         label: "Por unidad" },
];

const TIPOS_REGLA = [
  { value: "duracion_minima",     label: "Duración mínima (min)" },
  { value: "duracion_maxima",     label: "Duración máxima (min)" },
  { value: "anticipacion_minima", label: "Anticipación mínima (min)" },
  { value: "no_pasado",           label: "No reservas en el pasado" },
  { value: "horario_permitido",   label: "Horario permitido" },
];

const inputCls = "mt-1.5 w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700";
const inputDisabledCls = "mt-1.5 w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed";
const labelCls = "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1";
const miniInputCls = "w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700";
const miniLabelCls = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";

const EMPTY_RT = {
  codigo: "", nombre: "", descripcion: "",
  es_reservable: true, requiere_aprobacion: false,
  duracion_minima_minutos: "", duracion_maxima_minutos: "",
  unidad_reserva: "bloque_horario", estado: "ACTIVO",
  reglas_config: {},
};

// ── Mini editor de reglas base del tipo ──────────────────────────────────
function ReglasConfigMini({ reglasConfig, onChange }) {
  const reglas = Object.entries(reglasConfig || {});
  const [tipo, setTipo] = useState("duracion_minima");
  const [minutos, setMinutos] = useState("");
  const [desde, setDesde] = useState("08:00");
  const [hasta, setHasta] = useState("20:00");

  const necesitaMinutos = ["duracion_minima", "duracion_maxima", "anticipacion_minima"].includes(tipo);
  const necesitaHorario = tipo === "horario_permitido";

  const agregar = () => {
    if (necesitaMinutos && !minutos) { toast.error("Ingresa los minutos."); return; }
    if (reglasConfig?.[tipo]) { toast.error("Ya existe esa regla."); return; }
    const valor = necesitaMinutos ? { minutos: Number(minutos) } : necesitaHorario ? { desde, hasta } : {};
    onChange({ ...reglasConfig, [tipo]: valor });
    setMinutos("");
  };

  const eliminar = (t) => {
    const nuevo = { ...reglasConfig };
    delete nuevo[t];
    onChange(nuevo);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        <select value={tipo} onChange={e => setTipo(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400 text-slate-700">
          {TIPOS_REGLA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        {necesitaMinutos && (
          <input type="number" min="1" value={minutos} onChange={e => setMinutos(e.target.value)}
            placeholder="min" className="w-20 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
        )}
        {necesitaHorario && (
          <>
            <input type="time" value={desde} onChange={e => setDesde(e.target.value)}
              className="px-2 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
            <input type="time" value={hasta} onChange={e => setHasta(e.target.value)}
              className="px-2 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
          </>
        )}
        <button type="button" onClick={agregar}
          className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={12} />
        </button>
      </div>
      {reglas.map(([t, v]) => (
        <div key={t} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-indigo-400" />
            <span className="text-xs text-slate-600">{TIPOS_REGLA.find(r => r.value === t)?.label || t}</span>
            {v?.minutos !== undefined && <span className="text-xs text-slate-400">— {v.minutos} min</span>}
            {v?.desde && <span className="text-xs text-slate-400">— {v.desde}→{v.hasta}</span>}
          </div>
          <button type="button" onClick={() => eliminar(t)}
            className="p-0.5 text-slate-300 hover:text-rose-500 transition-colors">
            <Trash2 size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Panel de Resource Types colapsable ───────────────────────────────────
function ResourceTypePanel({ resourceTypes, onResourceTypesChange }) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formRT, setFormRT] = useState(EMPTY_RT);
  const [mostrarFormRT, setMostrarFormRT] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangeRT = (e) => {
    const { name, value, type, checked } = e.target;
    setFormRT(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleGuardarRT = async () => {
    if (!formRT.codigo.trim() || !formRT.nombre.trim()) {
      toast.error("Código y nombre son obligatorios."); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formRT,
        codigo: formRT.codigo.toUpperCase().trim(),
        duracion_minima_minutos: formRT.duracion_minima_minutos ? Number(formRT.duracion_minima_minutos) : null,
        duracion_maxima_minutos: formRT.duracion_maxima_minutos ? Number(formRT.duracion_maxima_minutos) : null,
        campos_config: [],
      };
      let resultado;
      if (editando) {
        resultado = await resourceTypesService.actualizar(editando, payload);
        onResourceTypesChange(prev => prev.map(t => t.id === editando ? resultado : t));
        toast.success("Tipo de recurso actualizado.");
      } else {
        resultado = await resourceTypesService.crear(payload);
        onResourceTypesChange(prev => [...prev, resultado]);
        toast.success("Tipo de recurso creado.");
      }
      setEditando(null);
      setFormRT(EMPTY_RT);
      setMostrarFormRT(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditarRT = (rt) => {
    setEditando(rt.id);
    setFormRT({
      codigo: rt.codigo || "",
      nombre: rt.nombre || "",
      descripcion: rt.descripcion || "",
      es_reservable: rt.es_reservable ?? true,
      requiere_aprobacion: rt.requiere_aprobacion ?? false,
      duracion_minima_minutos: rt.duracion_minima_minutos ?? "",
      duracion_maxima_minutos: rt.duracion_maxima_minutos ?? "",
      unidad_reserva: rt.unidad_reserva || "bloque_horario",
      estado: rt.estado || "ACTIVO",
      reglas_config: rt.reglas_config || {},
    });
    setMostrarFormRT(true);
  };

  const handleDesactivarRT = async (rt) => {
    if (!window.confirm(`¿Desactivar el tipo "${rt.nombre}"?`)) return;
    try {
      await resourceTypesService.desactivar(rt.id);
      onResourceTypesChange(prev => prev.filter(t => t.id !== rt.id));
      toast.success("Tipo desactivado.");
    } catch {
      toast.error("No se pudo desactivar.");
    }
  };

  const cancelarRT = () => {
    setEditando(null);
    setFormRT(EMPTY_RT);
    setMostrarFormRT(false);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
        <div className="flex items-center gap-2">
          <Package size={15} className="text-indigo-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tipos de Recurso</span>
          {resourceTypes.length > 0 && (
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
              {resourceTypes.length}
            </span>
          )}
        </div>
        {abierto ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
      </button>

      {abierto && (
        <div className="p-4 space-y-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Define la plantilla del recurso: Vehículo, Sala, Doctor, Tour… Al seleccionar un tipo en el formulario, los campos se completan automáticamente.
          </p>

          {resourceTypes.length > 0 && (
            <div className="space-y-1.5">
              {resourceTypes.map(rt => (
                <div key={rt.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{rt.nombre}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{rt.codigo}</span>
                      {Object.keys(rt.reglas_config || {}).length > 0 && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded font-bold">
                          {Object.keys(rt.reglas_config).length} reglas
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {UNIDADES.find(u => u.value === rt.unidad_reserva)?.label || rt.unidad_reserva}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => handleEditarRT(rt)}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => handleDesactivarRT(rt)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!mostrarFormRT && (
            <button type="button" onClick={() => setMostrarFormRT(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-indigo-300 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-50 transition-colors">
              <Plus size={13} /> Nuevo tipo de recurso
            </button>
          )}

          {mostrarFormRT && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{editando ? "Editar tipo" : "Nuevo tipo"}</span>
                <button type="button" onClick={cancelarRT} className="p-0.5 text-slate-400 hover:text-slate-700">
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={miniLabelCls}>Código *</label>
                  <input name="codigo" value={formRT.codigo} onChange={handleChangeRT}
                    className={miniInputCls} placeholder="SALA, VEH, DOC..." />
                </div>
                <div>
                  <label className={miniLabelCls}>Nombre *</label>
                  <input name="nombre" value={formRT.nombre} onChange={handleChangeRT}
                    className={miniInputCls} placeholder="Sala, Vehículo, Doctor..." />
                </div>
              </div>

              <div>
                <label className={miniLabelCls}>Descripción</label>
                <input name="descripcion" value={formRT.descripcion} onChange={handleChangeRT}
                  className={miniInputCls} placeholder="Opcional" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={miniLabelCls}>Unidad de operación</label>
                  <select name="unidad_reserva" value={formRT.unidad_reserva} onChange={handleChangeRT} className={miniInputCls}>
                    {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={miniLabelCls}>Duración mínima (min)</label>
                  <input name="duracion_minima_minutos" type="number" min="0"
                    value={formRT.duracion_minima_minutos} onChange={handleChangeRT}
                    className={miniInputCls} placeholder="Sin límite" />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="es_reservable" checked={formRT.es_reservable}
                    onChange={handleChangeRT} className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600" />
                  <span className="text-xs text-slate-600 font-medium">Reservable</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="requiere_aprobacion" checked={formRT.requiere_aprobacion}
                    onChange={handleChangeRT} className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600" />
                  <span className="text-xs text-slate-600 font-medium">Requiere aprobación</span>
                </label>
              </div>

              <div>
                <label className={miniLabelCls}>Condiciones operativas del tipo</label>
                <ReglasConfigMini
                  reglasConfig={formRT.reglas_config}
                  onChange={(config) => setFormRT(prev => ({ ...prev, reglas_config: config }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={cancelarRT}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
                  Cancelar
                </button>
                <button type="button" onClick={handleGuardarRT} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-60">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  {editando ? "Actualizar" : "Crear tipo"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Formulario principal ──────────────────────────────────────────────────
const ActivoForm = ({ onSubmit, resourceTypes = [], onResourceTypesChange }) => {
  const [form, setForm] = useState({
    nombre: "", sku: "", codigo_interno: "",
    resource_type_id: "",
    categoria: "", descripcion: "", precio_base: "",
    intervalo_entre_usos: "",   // renombrado desde buffer_limpieza_minutos
    capacidad: "", ubicacion: "", estado: "Disponible",
    reglas: [],
  });

  // Cuando se elige un tipo, autocompletar y bloquear campos que define el tipo
  const handleResourceTypeChange = (e) => {
    const rtId = e.target.value;
    const rt = resourceTypes.find(r => r.id === rtId);

    if (rt) {
      const reglasBase = Object.entries(rt.reglas_config || {}).map(([tipo_regla, valor]) => ({
        tipo_regla,
        nombre: TIPOS_REGLA.find(t => t.value === tipo_regla)?.label || tipo_regla,
        valor,
        prioridad: 100,
        activa: true,
      }));

      setForm(prev => ({
        ...prev,
        resource_type_id: rtId,
        // El nombre genérico del tipo define el campo "tipo" del activo
        intervalo_entre_usos: rt.duracion_minima_minutos ?? prev.intervalo_entre_usos,
        reglas: reglasBase,
      }));
    } else {
      setForm(prev => ({ ...prev, resource_type_id: "", reglas: [] }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tipoSeleccionado = resourceTypes.find(r => r.id === form.resource_type_id);
    onSubmit({
      nombre:                  form.nombre,
      sku:                     form.sku || null,
      codigo_interno:          form.codigo_interno || null,
      resource_type_id:        form.resource_type_id || null,
      // tipo se deriva del resource_type o de la categoría libre
      tipo:                    tipoSeleccionado?.nombre || form.categoria || null,
      categoria:               form.categoria || null,
      descripcion:             form.descripcion || null,
      estado:                  form.estado,
      precio_base:             form.precio_base ? Number(form.precio_base) : null,
      moneda:                  "CLP",
      buffer_limpieza_minutos: form.intervalo_entre_usos ? Number(form.intervalo_entre_usos) : 0,
      capacidad:               form.capacidad ? Number(form.capacidad) : null,
      ubicacion:               form.ubicacion || null,
      reglas:                  form.reglas,
      disponibilidades:        [],
    });
    setForm({
      nombre: "", sku: "", codigo_interno: "", resource_type_id: "",
      categoria: "", descripcion: "", precio_base: "",
      intervalo_entre_usos: "", capacidad: "", ubicacion: "", estado: "Disponible",
      reglas: [],
    });
  };

  const tipoSeleccionado = resourceTypes.find(r => r.id === form.resource_type_id);
  const sinTipo = !form.resource_type_id;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Paso 1: Tipo de recurso ── */}
      <div>
        <label className={labelCls}>
          Tipo de Recurso
          <span className="ml-1 normal-case font-normal text-slate-400">— opcional</span>
        </label>
        <select name="resource_type_id" value={form.resource_type_id}
          onChange={handleResourceTypeChange} className={inputCls}>
          <option value="">— Sin tipo (recurso genérico) —</option>
          {resourceTypes.map(rt => (
            <option key={rt.id} value={rt.id}>{rt.nombre}</option>
          ))}
        </select>

        {/* Indicador de autocompletado */}
        {tipoSeleccionado && (
          <div className="mt-2 flex items-start gap-1.5 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
            <Info size={13} className="text-indigo-500 mt-0.5 shrink-0" />
            <div className="text-[11px] text-indigo-700 leading-relaxed">
              <span className="font-bold">Plantilla aplicada:</span> {tipoSeleccionado.nombre}
              {tipoSeleccionado.unidad_reserva && (
                <span className="ml-1 text-indigo-500">
                  · Unidad: {UNIDADES.find(u => u.value === tipoSeleccionado.unidad_reserva)?.label}
                </span>
              )}
              {form.reglas.length > 0 && (
                <span className="ml-1 text-indigo-500">· {form.reglas.length} condiciones operativas aplicadas</span>
              )}
            </div>
          </div>
        )}

        {sinTipo && (
          <p className="text-[10px] text-slate-400 mt-1 ml-1">
            Sin tipo, el recurso se registra como genérico. Puedes configurar el tipo más adelante.
          </p>
        )}
      </div>

      {/* ── Paso 2: Identidad del recurso concreto ── */}
      <div>
        <label className={labelCls}>Nombre del recurso <span className="text-rose-500">*</span></label>
        <input name="nombre" value={form.nombre} onChange={handleChange} required
          placeholder={tipoSeleccionado ? `Ej: ${tipoSeleccionado.nombre} #1, Sur-A...` : "Nombre del recurso"}
          className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Código único (SKU)</label>
          <input name="sku" value={form.sku} onChange={handleChange}
            placeholder="Ej: REC-001" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Código interno</label>
          <input name="codigo_interno" value={form.codigo_interno} onChange={handleChange}
            placeholder="Opcional" className={inputCls} />
        </div>
      </div>

      {/* Categoría libre — solo si no hay tipo seleccionado */}
      {sinTipo && (
        <div>
          <label className={labelCls}>Categoría</label>
          <input name="categoria" value={form.categoria} onChange={handleChange}
            placeholder="Vehículo, Sala, Profesional, Máquina..." className={inputCls} />
        </div>
      )}

      <div>
        <label className={labelCls}>Descripción</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
          rows={2} placeholder="Descripción del recurso"
          className={`${inputCls} resize-none`} />
      </div>

      {/* ── Paso 3: Condiciones operativas ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Precio base (CLP / hora)</label>
          <input name="precio_base" type="number" min="0" value={form.precio_base}
            onChange={handleChange} placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Intervalo entre usos (min)</label>
          <input name="intervalo_entre_usos" type="number" min="0"
            value={form.intervalo_entre_usos} onChange={handleChange}
            placeholder="0" className={inputCls} />
          <p className="text-[10px] text-slate-400 mt-1 ml-1">
            Tiempo de preparación entre reservas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Capacidad</label>
          <input name="capacidad" type="number" min="1" value={form.capacidad}
            onChange={handleChange} placeholder="Personas / unidades" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Ubicación</label>
          <input name="ubicacion" value={form.ubicacion} onChange={handleChange}
            placeholder="Piso 2, Sede Norte..." className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Estado operativo</label>
        <select name="estado" value={form.estado} onChange={handleChange} className={inputCls}>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Condiciones operativas heredadas del tipo — solo informativo */}
      {form.reglas.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
          <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1">
            <ShieldCheck size={11} /> Condiciones operativas del tipo
          </p>
          <div className="space-y-1">
            {form.reglas.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-indigo-700">
                <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                <span>{r.nombre}</span>
                {r.valor?.minutos !== undefined && <span className="text-indigo-400">— {r.valor.minutos} min</span>}
                {r.valor?.desde && <span className="text-indigo-400">— {r.valor.desde}→{r.valor.hasta}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2">
        <button type="submit"
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-slate-200">
          Registrar Recurso
        </button>
      </div>

      {/* Panel colapsable de Resource Types */}
      {onResourceTypesChange && (
        <ResourceTypePanel
          resourceTypes={resourceTypes}
          onResourceTypesChange={onResourceTypesChange}
        />
      )}
    </form>
  );
};

export default ActivoForm;