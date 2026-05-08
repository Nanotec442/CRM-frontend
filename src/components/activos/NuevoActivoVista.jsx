import React, { useState, useRef } from 'react';
import { Package, Tag, Activity, FileText, Save, Loader2, AlertCircle, ArrowLeft, HelpCircle, Barcode } from 'lucide-react';
import { toast } from 'react-toastify';
import iaService from "../../services/iaService";

function NuevoActivoVista({ onGuardar, onVolver }) {
  const [formData, setFormData] = useState({
    sku: "",
    nombre: "",
    tipo: "",
    estado: "Operativo",
    buffer_limpieza_minutos: "",
    precio_base: "",
  });

  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
          sku:                    info.sku                    || prev.sku,
          nombre:                 info.nombre                 || prev.nombre,
          tipo:                   info.tipo                   || prev.tipo,
          estado:                 info.estado                 || prev.estado,
          buffer_limpieza_minutos: info.buffer_limpieza_minutos || prev.buffer_limpieza_minutos,
          precio_base:            info.precio_base            || prev.precio_base,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    if (!formData.nombre.trim()) {
      setError("El nombre del activo es obligatorio.");
      toast.error("El nombre del activo es obligatorio.");
      return;
    }
    if (!formData.sku.trim()) {
      setError("El SKU es obligatorio.");
      toast.error("El SKU es obligatorio.");
      return;
    }
    if (!formData.tipo.trim()) {
      setError("El tipo/categoría es obligatorio.");
      toast.error("El tipo/categoría es obligatorio.");
      return;
    }

    await onGuardar({
      sku:                    formData.sku.trim(),
      nombre:                 formData.nombre.trim(),
      tipo:                   formData.tipo.trim(),
      estado:                 formData.estado,
      buffer_limpieza_minutos: formData.buffer_limpieza_minutos ? Number(formData.buffer_limpieza_minutos) : 0,
      precio_base:            formData.precio_base ? Number(formData.precio_base) : 0,
    });
  };

  return (
    <div className="max-w-6xl w-full mx-auto space-y-6 animate-in fade-in duration-500 font-sans pb-10">

      <button
        onClick={onVolver}
        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
      >
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
              Sube facturas de compra, garantías o manuales técnicos. Extraeremos los datos del equipo por ti.
            </p>

            <div
              className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[220px]
                ${dragActive ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'}
                ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center animate-in fade-in">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" strokeWidth={2} />
                  <p className="text-slate-800 font-semibold text-sm">Analizando equipo...</p>
                </div>
              ) : (
                <>
                  <FileText size={32} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
                  <p className="text-sm text-slate-600 mb-1">
                    <span className="text-indigo-600 font-semibold cursor-pointer">Haz clic para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">PDF, JPG, PNG (MÁX. 10MB)</p>
                  <input
                    ref={inputRef}
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                  />
                </>
              )}
            </div>

            {error ? (
              <div className="mt-6 flex items-center gap-2.5 text-rose-600 bg-rose-50 p-3 rounded-lg text-xs font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-2.5">
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
              Extracción de Activos
            </h4>
            <p className="text-indigo-800/80 text-xs mt-2.5 leading-relaxed font-medium">
              Sube la orden de compra o la hoja de especificaciones. Gemini identificará el tipo de recurso, modelo y características para agilizar tu inventario.
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

            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* SKU — obligatorio */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    SKU <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Barcode className="absolute left-3.5 top-3.5 text-slate-300" size={18} />
                    <input
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 text-sm font-medium"
                      placeholder="Ej: SALA-001, VEH-042..."
                    />
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Categoría / Tipo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-3.5 text-slate-300" size={18} />
                    <input
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 text-sm"
                      placeholder="Ej: Vehículo, Espacio Físico..."
                    />
                  </div>
                </div>

                {/* Nombre */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Nombre del Activo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3.5 top-3.5 text-slate-300" size={18} />
                    <input
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 text-sm font-medium"
                      placeholder="Ej: Sala Reuniones 1, Retroexcavadora CAT..."
                    />
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Estado Inicial</label>
                  <div className="relative">
                    <Activity className="absolute left-3.5 top-3.5 text-slate-300" size={18} />
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 text-sm appearance-none bg-white"
                    >
                      <option value="Operativo">Operativo</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Fuera de servicio">Fuera de servicio</option>
                    </select>
                  </div>
                </div>

                {/* Buffer */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Buffer limpieza (min)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-300 font-bold text-sm">⏱</span>
                    <input
                      name="buffer_limpieza_minutos"
                      type="number"
                      min="0"
                      value={formData.buffer_limpieza_minutos}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 text-sm"
                      placeholder="15"
                    />
                  </div>
                </div>

                {/* Precio base */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Precio Base (CLP)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-300 font-bold text-sm">$</span>
                    <input
                      name="precio_base"
                      type="number"
                      min="0"
                      value={formData.precio_base}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleGuardar}
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <Save size={18} className="group-hover:scale-110 transition-transform" />
                  Guardar Activo en Inventario
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
                  Verifica los datos extraídos antes de guardar.
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