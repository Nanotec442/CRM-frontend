import React, { useState, useRef } from 'react';
import { Package, Tag, Activity, FileText, Save, Loader2, CheckCircle, AlertCircle, ArrowLeft, UploadCloud, HelpCircle, Barcode } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function NuevoActivoVista({ onGuardar, onVolver }) {
  // --- ESTADOS DEL FORMULARIO ---
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    estado: "Operativo",
    tiempo_buffer_minutos: "",
    precio_base: ""
  });

  // --- ESTADOS DE LA IA ---
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const inputRef = useRef(null);

  // --- MANEJADORES DE ARCHIVOS ---
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      procesarArchivoIA(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      procesarArchivoIA(e.target.files[0]);
    }
  };

  // --- LÓGICA DE API (Carga Inteligente de Activos) ---
  const procesarArchivoIA = async (file) => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("El archivo excede el límite de 10MB permitido.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const payload = new FormData();
    payload.append('archivo', file);

    try {
      const token = localStorage.getItem("token"); 
      
      // APUNTAMOS AL ENDPOINT DE ACTIVOS
      const response = await fetch(`${API_URL}/activos/carga-inteligente`, {
        method: 'POST',
        body: payload,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 401 || response.status === 403) {
           throw new Error("Sesión inválida. Inicia sesión nuevamente.");
        }
        const errorMessage = errorData?.detail 
          ? JSON.stringify(errorData.detail)
          : `Error del servidor: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      

      if (data.datos && data.datos.activos && data.datos.activos.length > 0) {
        const info = data.datos.activos[0];
        setFormData(prev => ({
          ...prev,
          nombre: info.nombre || prev.nombre,
          tipo: info.tipo || prev.tipo,
          estado: info.estado || prev.estado,
          numero_serie: info.numero_serie || prev.numero_serie,
          notas: info.notas || prev.notas
        }));

        setMostrarAlerta(true);
        setTimeout(() => setMostrarAlerta(false), 5000);
      }

    } catch (err) {
      console.error("Error en IA:", err);
      setError(err.message || "Ocurrió un error al procesar el documento.");
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        
        {/* --- COLUMNA IZQUIERDA: Módulos de IA (2/5) --- */}
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
              className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-55
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
                    ref={inputRef} type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleChange} accept=".pdf,.docx,.jpg,.jpeg,.png" 
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
                <div className="relative flex h-2.5 w-2.5">
                  {isProcessing ? (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500 animate-pulse"></span>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  )}
                </div>
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
              Sube la orden de compra o la hoja de especificaciones. Gemini identificará el tipo de recurso, modelo y número de serie para agilizar tu inventario.
            </p>
          </div>
        </div>

        {/* --- COLUMNA DERECHA: Formulario (3/5) --- */}
        <div className="lg:col-span-3 relative">
          
          {mostrarAlerta && (
            <div className="absolute -top-12 left-0 right-0 flex justify-center z-10">
              <div className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-in slide-in-from-top-4">
                <CheckCircle size={16} />
                ACTIVO DETECTADO Y RELLENADO
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <Package size={20} className="text-slate-400" />
                Especificaciones del Recurso
              </h3>
            </div>

            {/* FORMULARIO */}
            <form className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nombre del Activo */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre del Activo *</label>
                  <div className="relative">
                    <Package className="absolute left-3.5 top-3.5 text-slate-300" size={18} />
                    <input 
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 text-sm font-medium"
                      placeholder="Ej: Sala 1, Retroexcavadora..."
                    />
                  </div>
                </div>

                {/* Tipo / Categoría */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Categoría / Tipo</label>
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
                      <option value="operativo">Operativo</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="fuera_servicio">Fuera de servicio</option>
                    </select>
                  </div>
                </div>

                {/* Buffer */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Buffer (Minutos)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-300 font-bold text-sm">⏱</span>
                    <input 
                      name="tiempo_buffer_minutos"
                      type="number"
                      min="0"
                      value={formData.tiempo_buffer_minutos}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 text-sm"
                      placeholder="15"
                    />
                  </div>
                </div>

                {/* Precio Base */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Precio Base ($)</label>
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

              {/* FOOTER Y BOTÓN */}
              <div className="pt-4">
                <button 
                  type="button"
                  onClick={async () => {
                    if(!formData.nombre) {
                       setError("El nombre del activo es obligatorio.");
                       return;
                    }
                    await onGuardar({
                      ...formData,
                      precio_base: formData.precio_base ? Number(formData.precio_base) : 0,
                      tiempo_buffer_minutos: formData.tiempo_buffer_minutos ? Number(formData.tiempo_buffer_minutos) : 0,
                    });
                  }}
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <Save size={18} className="group-hover:scale-110 transition-transform" />
                  Guardar Activo en Inventario
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
                  VERIFICA LOS DATOS EXTRAÍDOS ANTES DE GUARDAR.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NuevoActivoVista;