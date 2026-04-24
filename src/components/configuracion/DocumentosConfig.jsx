import React, { useState, useRef } from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify'; // Agregamos toastify por si se cae la red

// Importamos la instancia centralizada de Axios
import api from "../../services/api";

const DocumentosConfig = ({ onAIComplete }) => {
  // --- ESTADOS DEL COMPONENTE ---
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const inputRef = useRef(null);

  // --- MANEJO DE EVENTOS DRAG & DROP ---
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
      procesarArchivo(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      procesarArchivo(e.target.files[0]);
    }
  };

  // --- LÓGICA DE PROCESAMIENTO CON AXIOS ---
  const procesarArchivo = async (file) => {
    // 1. Validación de tamaño (Máx 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("El archivo excede el límite de 10MB permitido.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);

    // 2. Preparación del payload (FastAPI exige el campo 'archivo')
    const formData = new FormData();
    formData.append('archivo', file); 

    try {
      // ✅ 3. Petición limpia usando Axios. El token viaja solo.
      const response = await api.post('/documentos/carga-mixta', formData);

      // 4. Éxito: Extraemos datos y notificamos al padre
      const data = response.data;
      setSuccessMsg(`Documento analizado correctamente. ${data.mensaje || ''}`);
      
      if (onAIComplete) {
        onAIComplete(data.datos || {});
      }

    } catch (err) {
      console.error("Error procesando documento:", err);
      
      // ✅ 5. Manejo de errores estilo Axios
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setError("Sesión inválida. Por favor, vuelve a iniciar sesión.");
          toast.error("Tu sesión expiró.");
        } else {
          const errMsg = err.response.data?.detail || "Error del servidor al procesar el documento.";
          setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        }
      } else {
        setError("Error de conexión. Revisa tu internet.");
        toast.error("Fallo de red.");
      }
    } finally {
      setIsProcessing(false);
      // Limpiamos el input para permitir subir el mismo archivo en caso de error
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  // --- RENDERIZADO DE LA INTERFAZ ---
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Carga Inteligente Mixta</h2>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
          Powered by AI
        </span>
      </div>
      
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
        Sube facturas, contratos o documentos legales. Nuestra IA procesará el contenido y extraerá la información relevante por ti.
      </p>

      {/* Zona Drag & Drop */}
      <div 
        className={`relative group border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[200px]
          ${dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'}
          ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center animate-in fade-in">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" strokeWidth={2} />
            <p className="text-slate-800 font-semibold text-sm">Procesando documento...</p>
          </div>
        ) : (
          <>
            <FileText size={40} className="mb-4 text-slate-300 group-hover:text-indigo-400 transition-colors" strokeWidth={1.5} />
            <p className="text-slate-600 mb-1">
              <span className="font-semibold text-indigo-600 cursor-pointer">Haz clic para subir</span> o arrastra y suelta
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-tighter">PDF, DOCX, JPG, PNG (Máx. 10MB)</p>
            
            <input 
              ref={inputRef}
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleChange}
              accept=".pdf,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
              disabled={isProcessing}
            />
          </>
        )}
      </div>

      {/* Alertas de Feedback (UI Integrada) */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg text-xs font-medium animate-in fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMsg && !error && (
        <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg text-xs font-medium animate-in fade-in">
          <CheckCircle size={16} className="shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Footer de estado */}
      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="relative flex h-2.5 w-2.5">
          {isProcessing ? (
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500 animate-pulse"></span>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </>
          )}
        </div>
        <span className="text-sm text-slate-500 font-medium italic">
          {isProcessing ? "Conectando con motor de IA..." : "IA lista para procesar información"}
        </span>
      </div>

    </div>
  );
};

export default DocumentosConfig;