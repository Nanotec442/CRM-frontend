import React, { useState, useRef } from 'react';
import { Package, Tag, Activity, FileText, Save, Loader2, AlertCircle, ArrowLeft, HelpCircle, Barcode, MapPin, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import iaService from "../../services/iaService";

const ESTADOS = ["Disponible", "Mantenimiento", "Fuera de servicio"];

const INITIAL_FORM = {
  sku: "",
  codigo_interno: "",
  nombre: "",
  resource_type_id: "",
  tipo: "",
  categoria: "",
  descripcion: "",
  estado: "Disponible",
  precio_base: "",
  buffer_limpieza_minutos: "",
  capacidad: "",
  ubicacion: "",
};

function NuevoActivoVista({ onGuardar, onVolver, resourceTypes = [] }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) procesarArchivoIA(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) procesarArchivoIA(e.target.files[0]);
  };

  const procesarArchivoIA = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo excede el límite de 10MB permitido.");
      return;
    }
    setIsProcessing(true);
    setError(null);

    const payload = new FormData();
    payload.append('archivo', file);

    try {
      const data = await iaService.cargaInteligenteActivos(payload);
      if (data.datos?.activos?.length > 0) {
        const info = data.datos.activos[0];
        setFormData(prev => ({
          ...prev,
          sku:                     info.sku                     || prev.sku,
          nombre:                  info.nombre                  || prev.nombre,
          tipo:                    info.tipo                    || prev.tipo,
          categoria:               info.categoria               || prev.categoria,
          descripcion:             info.descripcion             || prev.descripcion,
          estado:                  info.estado                  || prev.estado,
          buffer_limpieza_minutos: info.buffer_limpieza_minutos || prev.buffer_limpieza_minutos,
          precio_base:             info.precio_base             || prev.precio_base,
          capacidad:               info.capacidad               || prev.capacidad,
          ubicacion:               info.ubicacion               || prev.ubicacion,
        }));
        toast.success("¡Datos del activo extraídos con éxito!");
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Sesión inválida. Inicia sesión nuevamente.");
      } else {
        const errMsg = err.response?.data?.detail || "Error al procesar el documento.";
        setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        toast.error("La IA no pudo procesar este documento.");
      }
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    setError(null);
    if (!formData.nombre.trim()) { toast.error("El nombre es obligatorio.");        return; }
    if (!formData.sku.trim())    { toast.error("El SKU es obligatorio.");           return; }
    if (!formData.tipo.trim())   { toast.error("El tipo/categoría es obligatorio."); return; }

    setIsSaving(true);
    try {
      await onGuardar({
        sku:                     formData.sku.trim(),
        codigo_interno:          formData.codigo_interno.trim() || null,
        nombre:                  formData.nombre.trim(),
        resource_type_id:        formData.resource_type_id || null,
        tipo:                    formData.tipo.trim(),
        categoria:               formData.categoria.trim() || null,
        descripcion:             formData.descripcion.trim() || null,
        estado:                  formData.estado,
        precio_base:             formData.precio_base ? Number(formData.precio_base) : null,
        moneda:                  "CLP",
        buffer_limpieza_minutos: formData.buffer_limpieza_minutos ? Number(formData.buffer_limpieza_minutos) : 0,
        capacidad:               formData.capacidad ? Number(formData.capacidad) : null,
        ubicacion:               formData.ubicacion.trim() || null,
      });
    } catch {
      // el hook ya muestra el toast de error
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 text-sm font-medium bg-white";
  const labelCls = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-6xl w-full mx-auto space-y-6 animate-in fade-in duration-500 font-sans pb-10">

      <button onClick={onVolver}
        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver al inventario
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* Columna izquierda — IA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Registro Inteligente</h2>
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                Powered by AI
              </span>
            </div>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Sube facturas, garantías o manuales técnicos. Extraeremos los datos del recurso automáticamente.
            </p>

            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[200px]
                ${dragActive ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'}
                ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag}
              onDragOver={handleDrag} onDrop={handleDrop}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center animate-in fade-in">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" strokeWidth={2} />
                  <p className="text-slate-800 font-semibold text-sm">Analizando recurso...</p>
                </div>
              ) : (
                <>
                  <FileText size={32} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
                  <p className="text-sm text-slate-600 mb-1">
                    <span className="text-indigo-600 font-semibold cursor-pointer">Haz clic para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">PDF, JPG, PNG (MÁX. 10MB)</p>
                  <input ref={inputRef} type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange} accept=".pdf,.docx,.jpg,.jpeg,.png" />
                </>
              )}
            </div>

            {error ? (
              <div className="mt-4 flex items-center gap-2.5 text-rose-600 bg-rose-50 p-3 rounded-lg text-xs font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2.5">
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isProcessing ? "bg-indigo-500 animate-pulse" : "bg-emerald-500"}`} />
                <span className="text-sm text-slate-500 italic font-medium">
                  {isProcessing ? "Extrayendo especificaciones..." : "IA lista para procesar"}
                </span>
              </div>
            )}
          </div>

          <div className="bg-indigo-50/80 border border-indigo-100 p-5 rounded-2xl">
            <h4 className="text-indigo-900 font-bold text-sm flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[12px]">
                <HelpCircle size={12} strokeWidth={3} />
              </span>
              Motor de recursos genérico
            </h4>
            <p className="text-indigo-800/80 text-xs mt-2.5 leading-relaxed font-medium">
              Este módulo gestiona cualquier recurso operable: vehículos, salas, profesionales, maquinaria o tours. El núcleo es el mismo, solo cambia la configuración.
            </p>
          </div>
        </div>

        {/* Columna derecha — Formulario */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <Package size={20} className="text-slate-400" />
                Especificaciones del Recurso
              </h3>
            </div>

            <div className="p-6 md:p-8 space-y-5">

              {resourceTypes.length > 0 && (
                <div>
                  <label className={labelCls}>Tipo de Recurso</label>
                  <select name="resource_type_id" value={formData.resource_type_id} onChange={handleChange} className={inputCls}>
                    <option value="">— Sin tipo específico —</option>
                    {resourceTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>{rt.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>SKU <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Barcode className="absolute left-3.5 top-2.5 text-slate-300" size={18} />
                    <input name="sku" value={formData.sku} onChange={handleChange}
                      className={`${inputCls} pl-11`} placeholder="SALA-001, VEH-042..." />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Código Interno</label>
                  <input name="codigo_interno" value={formData.codigo_interno} onChange={handleChange}
                    className={inputCls} placeholder="Opcional" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Nombre del Recurso <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Package className="absolute left-3.5 top-2.5 text-slate-300" size={18} />
                  <input name="nombre" value={formData.nombre} onChange={handleChange}
                    className={`${inputCls} pl-11`} placeholder="Sala Reuniones 1, Retroexcavadora CAT..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tipo <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-2.5 text-slate-300" size={18} />
                    <input name="tipo" value={formData.tipo} onChange={handleChange}
                      className={`${inputCls} pl-11`} placeholder="Vehículo, Sala..." />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Subcategoría</label>
                  <input name="categoria" value={formData.categoria} onChange={handleChange}
                    className={inputCls} placeholder="Opcional" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}
                  rows={2} placeholder="Descripción opcional"
                  className={`${inputCls} resize-none`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Precio Base (CLP)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-400 font-bold text-sm">$</span>
                    <input name="precio_base" type="number" min="0" value={formData.precio_base}
                      onChange={handleChange} className={`${inputCls} pl-8`} placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Buffer (min)</label>
                  <input name="buffer_limpieza_minutos" type="number" min="0"
                    value={formData.buffer_limpieza_minutos} onChange={handleChange}
                    className={inputCls} placeholder="15" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Capacidad</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-2.5 text-slate-300" size={16} />
                    <input name="capacidad" type="number" min="1" value={formData.capacidad}
                      onChange={handleChange} className={`${inputCls} pl-11`} placeholder="Ej: 10" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Ubicación</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-2.5 text-slate-300" size={16} />
                    <input name="ubicacion" value={formData.ubicacion} onChange={handleChange}
                      className={`${inputCls} pl-11`} placeholder="Piso 2, Bodega..." />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Estado inicial</label>
                <div className="relative">
                  <Activity className="absolute left-3.5 top-2.5 text-slate-300" size={16} />
                  <select name="estado" value={formData.estado} onChange={handleChange}
                    className={`${inputCls} pl-11 appearance-none`}>
                    {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button type="button" onClick={handleGuardar} disabled={isSaving}
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSaving
                    ? <><Loader2 size={18} className="animate-spin" /> Guardando...</>
                    : <><Save size={18} className="group-hover:scale-110 transition-transform" /> Guardar Recurso en Inventario</>
                  }
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-3 uppercase tracking-widest font-bold">
                  Verifica los datos antes de guardar.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default NuevoActivoVista;