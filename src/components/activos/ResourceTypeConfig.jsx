import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Loader2, X, Check, Package, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import resourceTypesService from "../../services/resourceTypesService";

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

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 text-sm bg-white";
const labelCls = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5";

const EMPTY_FORM = {
  codigo: "", nombre: "", descripcion: "",
  es_reservable: true, requiere_aprobacion: false,
  duracion_minima_minutos: "", duracion_maxima_minutos: "",
  unidad_reserva: "bloque_horario", estado: "ACTIVO",
  campos_config: [], reglas_config: {},
};

// ── Editor de reglas_config ───────────────────────────────────────────────
function ReglasConfigEditor({ reglasConfig, onChange }) {
  // reglas_config es un dict libre: { tipo_regla: { ...valor } }
  // Lo mostramos como lista editable
  const [reglas, setReglas] = useState(() =>
    Object.entries(reglasConfig || {}).map(([tipo, valor]) => ({ tipo, valor }))
  );
  const [nuevoTipo, setNuevoTipo] = useState("duracion_minima");
  const [nuevoMinutos, setNuevoMinutos] = useState("");
  const [horaDesde, setHoraDesde] = useState("08:00");
  const [horaHasta, setHoraHasta] = useState("20:00");

  const syncParent = (lista) => {
    const config = {};
    lista.forEach(r => { config[r.tipo] = r.valor; });
    onChange(config);
  };

  const buildValor = () => {
    if (["duracion_minima", "duracion_maxima", "anticipacion_minima"].includes(nuevoTipo))
      return { minutos: Number(nuevoMinutos) };
    if (nuevoTipo === "horario_permitido")
      return { desde: horaDesde, hasta: horaHasta };
    return {};
  };

  const handleAgregar = () => {
    if (["duracion_minima", "duracion_maxima", "anticipacion_minima"].includes(nuevoTipo) && !nuevoMinutos) {
      toast.error("Ingresa los minutos."); return;
    }
    if (reglas.find(r => r.tipo === nuevoTipo)) {
      toast.error("Ya existe una regla de ese tipo. Elimínala primero."); return;
    }
    const nueva = [...reglas, { tipo: nuevoTipo, valor: buildValor() }];
    setReglas(nueva);
    syncParent(nueva);
    setNuevoMinutos("");
  };

  const handleEliminar = (tipo) => {
    const nueva = reglas.filter(r => r.tipo !== tipo);
    setReglas(nueva);
    syncParent(nueva);
  };

  const necesitaMinutos = ["duracion_minima", "duracion_maxima", "anticipacion_minima"].includes(nuevoTipo);
  const necesitaHorario = nuevoTipo === "horario_permitido";

  const renderValor = (r) => {
    if (r.valor?.minutos !== undefined) return `${r.valor.minutos} min`;
    if (r.valor?.desde) return `${r.valor.desde} → ${r.valor.hasta}`;
    return "Sin parámetros";
  };

  return (
    <div className="space-y-3">
      <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100">
        <p className="text-xs font-bold text-indigo-700 mb-3 uppercase tracking-wider">
          Reglas base heredadas por todos los activos de este tipo
        </p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className={labelCls}>Tipo de regla</label>
            <select value={nuevoTipo} onChange={e => setNuevoTipo(e.target.value)} className={inputCls}>
              {TIPOS_REGLA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {necesitaMinutos && (
            <div>
              <label className={labelCls}>Minutos</label>
              <input type="number" min="1" value={nuevoMinutos}
                onChange={e => setNuevoMinutos(e.target.value)} className={inputCls} placeholder="Ej: 60" />
            </div>
          )}
          {necesitaHorario && (
            <>
              <div>
                <label className={labelCls}>Desde</label>
                <input type="time" value={horaDesde} onChange={e => setHoraDesde(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Hasta</label>
                <input type="time" value={horaHasta} onChange={e => setHoraHasta(e.target.value)} className={inputCls} />
              </div>
            </>
          )}
        </div>
        <button onClick={handleAgregar} type="button"
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all">
          <Plus size={13} /> Agregar regla base
        </button>
      </div>

      {reglas.length > 0 && (
        <div className="space-y-1.5">
          {reglas.map(r => (
            <div key={r.tipo} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-indigo-400" />
                <span className="text-sm font-medium text-slate-700">
                  {TIPOS_REGLA.find(t => t.value === r.tipo)?.label || r.tipo}
                </span>
                <span className="text-xs text-slate-400">— {renderValor(r)}</span>
              </div>
              <button onClick={() => handleEliminar(r.tipo)} type="button"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────
export default function ResourceTypeConfig() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [expandido, setExpandido] = useState(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await resourceTypesService.listar();
      setTipos(data);
    } catch {
      toast.error("No se pudieron cargar los tipos de recurso.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleGuardar = async () => {
    if (!form.codigo.trim()) { toast.error("El código es obligatorio."); return; }
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio."); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        codigo: form.codigo.toUpperCase().trim(),
        duracion_minima_minutos: form.duracion_minima_minutos ? Number(form.duracion_minima_minutos) : null,
        duracion_maxima_minutos: form.duracion_maxima_minutos ? Number(form.duracion_maxima_minutos) : null,
      };
      if (editando) {
        const updated = await resourceTypesService.actualizar(editando, payload);
        setTipos(prev => prev.map(t => t.id === editando ? updated : t));
        toast.success("Tipo actualizado.");
      } else {
        const created = await resourceTypesService.crear(payload);
        setTipos(prev => [...prev, created]);
        toast.success("Tipo de recurso creado.");
      }
      cancelar();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = (tipo) => {
    setEditando(tipo.id);
    setForm({
      codigo:                  tipo.codigo || "",
      nombre:                  tipo.nombre || "",
      descripcion:             tipo.descripcion || "",
      es_reservable:           tipo.es_reservable ?? true,
      requiere_aprobacion:     tipo.requiere_aprobacion ?? false,
      duracion_minima_minutos: tipo.duracion_minima_minutos ?? "",
      duracion_maxima_minutos: tipo.duracion_maxima_minutos ?? "",
      unidad_reserva:          tipo.unidad_reserva || "bloque_horario",
      estado:                  tipo.estado || "ACTIVO",
      campos_config:           tipo.campos_config || [],
      reglas_config:           tipo.reglas_config || {},
    });
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDesactivar = async (tipo) => {
    if (!window.confirm(`¿Desactivar el tipo "${tipo.nombre}"?`)) return;
    try {
      await resourceTypesService.desactivar(tipo.id);
      await cargar();
      toast.success("Tipo desactivado.");
    } catch {
      toast.error("No se pudo desactivar.");
    }
  };

  const cancelar = () => {
    setEditando(null);
    setForm(EMPTY_FORM);
    setMostrarForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package size={20} className="text-indigo-500" /> Tipos de Recurso
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Define las categorías base: Vehículo, Sala, Doctor, Tour. Incluye reglas heredadas por todos sus activos.
          </p>
        </div>
        {!mostrarForm && (
          <button onClick={() => setMostrarForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all">
            <Plus size={14} /> Nuevo tipo
          </button>
        )}
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">
              {editando ? "Editar tipo de recurso" : "Nuevo tipo de recurso"}
            </h4>
            <button onClick={cancelar} className="p-1 text-slate-400 hover:text-slate-700"><X size={16} /></button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Código único *</label>
              <input name="codigo" value={form.codigo} onChange={handleChange}
                className={inputCls} placeholder="VEHICULO, SALA, DOCTOR..." />
            </div>
            <div>
              <label className={labelCls}>Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange}
                className={inputCls} placeholder="Vehículo, Sala, Doctor..." />
            </div>
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
              rows={2} className={`${inputCls} resize-none`} placeholder="Opcional" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Unidad de reserva</label>
              <select name="unidad_reserva" value={form.unidad_reserva} onChange={handleChange} className={inputCls}>
                {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange} className={inputCls}>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Duración mínima (min)</label>
              <input name="duracion_minima_minutos" type="number" min="0"
                value={form.duracion_minima_minutos} onChange={handleChange}
                className={inputCls} placeholder="Sin límite" />
            </div>
            <div>
              <label className={labelCls}>Duración máxima (min)</label>
              <input name="duracion_maxima_minutos" type="number" min="0"
                value={form.duracion_maxima_minutos} onChange={handleChange}
                className={inputCls} placeholder="Sin límite" />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="es_reservable" checked={form.es_reservable}
                onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
              <span className="text-sm font-medium text-slate-700">Reservable</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="requiere_aprobacion" checked={form.requiere_aprobacion}
                onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
              <span className="text-sm font-medium text-slate-700">Requiere aprobación</span>
            </label>
          </div>

          {/* Reglas base del tipo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              Reglas base del tipo
            </label>
            <ReglasConfigEditor
              reglasConfig={form.reglas_config}
              onChange={(config) => setForm(prev => ({ ...prev, reglas_config: config }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={cancelar}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
              Cancelar
            </button>
            <button onClick={handleGuardar} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {editando ? "Guardar cambios" : "Crear tipo"}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Cargando tipos...</div>
      ) : tipos.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm italic">
          Sin tipos de recurso. Crea uno para categorizar tus activos.
        </div>
      ) : (
        <div className="space-y-2">
          {tipos.map(t => {
            const reglas = Object.entries(t.reglas_config || {});
            const abierto = expandido === t.id;
            return (
              <div key={t.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${t.estado === "ACTIVO" ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{t.nombre}</p>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{t.codigo}</span>
                        {t.es_reservable && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">Reservable</span>
                        )}
                        {reglas.length > 0 && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                            {reglas.length} regla{reglas.length > 1 ? "s" : ""} base
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {UNIDADES.find(u => u.value === t.unidad_reserva)?.label || t.unidad_reserva}
                        {t.duracion_minima_minutos && ` · Mín: ${t.duracion_minima_minutos} min`}
                        {t.duracion_maxima_minutos && ` · Máx: ${t.duracion_maxima_minutos} min`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {reglas.length > 0 && (
                      <button onClick={() => setExpandido(abierto ? null : t.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        {abierto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    )}
                    <button onClick={() => handleEditar(t)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Pencil size={15} />
                    </button>
                    {t.estado === "ACTIVO" && (
                      <button onClick={() => handleDesactivar(t)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Reglas expandidas */}
                {abierto && reglas.length > 0 && (
                  <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reglas base</p>
                    <div className="space-y-1">
                      {reglas.map(([tipo, valor]) => (
                        <div key={tipo} className="flex items-center gap-2 text-xs text-slate-600">
                          <ShieldCheck size={12} className="text-indigo-400 shrink-0" />
                          <span className="font-medium">{TIPOS_REGLA.find(t => t.value === tipo)?.label || tipo}</span>
                          {valor?.minutos !== undefined && <span className="text-slate-400">— {valor.minutos} min</span>}
                          {valor?.desde && <span className="text-slate-400">— {valor.desde} → {valor.hasta}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}