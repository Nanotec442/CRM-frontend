import React, { useState, useRef } from "react";
import { BrainCircuit, UploadCloud, FileText, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import iaService from "../../services/iaService";

export default function EntrenarIA() {
  // --- ESTADOS ---
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const inputRef = useRef(null);

  // --- MANEJO DE DRAG & DROP ---
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
      entrenarModelo(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      entrenarModelo(e.target.files[0]);
    }
  };

  // --- LÓGICA DE API CON AXIOS ---
  const entrenarModelo = async (file) => {
    // Validación de tamaño (Ej: Máx 15MB para documentos)
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("El documento excede el límite de 15MB permitido.");
      toast.error("Archivo demasiado pesado.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);

    // Preparación del payload (El backend espera 'archivo')
    const formData = new FormData();
    formData.append("archivo", file);

    try {
      // Axios se encarga automáticamente de poner el Content-Type a multipart/form-data
      const response = await iaService.entrenarPdf(formData);

      // Éxito en el entrenamiento
      const mensajeExito = response?.mensaje || "Documento procesado e indexado en la base de conocimiento.";
      setSuccessMsg(mensajeExito);
      toast.success("¡IA entrenada con éxito!");

    } catch (err) {
      console.error("Error entrenando IA:", err);
      
      if (err.response) {
        const errMsg = err.response.data?.detail || "Error del servidor al procesar el documento.";
        setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        toast.error("Fallo al procesar el documento.");
      } else {
        setError("Error de red. Verifica tu conexión a internet.");
        toast.error("Error de conexión.");
      }
    } finally {
      setIsProcessing(false);
      // Reseteamos el input para poder subir otro archivo si se desea
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm font-sans">
      
      {/* --- CABECERA Y DESCRIPCIÓN --- */}
      <div className="flex items-start gap-4 mb-8 border-b border-slate-100 pb-6">
        <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shadow-inner mt-1">
          <BrainCircuit size={28} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Base de Conocimiento IA
            <Sparkles size={16} className="text-amber-400" />
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed max-w-2xl">
            Sube documentos técnicos, manuales o políticas de tu empresa (PDF, Word, TXT). 
            Esta información alimentará el motor RAG (Generación Aumentada por Recuperación) de PIVOT, 
            entrenando al asistente para dar respuestas exactas basadas en el contexto real de tu negocio.
          </p>
        </div>
      </div>

      {/* --- ZONA DRAG & DROP --- */}
      <div 
        className={`relative group border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[260px]
          ${dragActive ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]' : 'border-slate-200 bg-slate-50 hover:bg-slate-50/50 hover:border-indigo-300'}
          ${isProcessing ? 'opacity-70 pointer-events-none blur-[1px]' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" strokeWidth={1.5} />
              <BrainCircuit className="w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[130%] animate-pulse" />
            </div>
            <p className="text-slate-800 font-bold">Extrayendo texto y vectorizando...</p>
            <p className="text-xs text-slate-500 mt-1">Esto puede tomar unos segundos dependiendo del tamaño del archivo.</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4 group-hover:-translate-y-1 transition-transform">
              <UploadCloud size={32} className="text-indigo-500" strokeWidth={1.5} />
            </div>
            <p className="text-slate-700 font-medium mb-1 text-lg">
              <span className="font-bold text-indigo-600 cursor-pointer hover:underline">Haz clic aquí</span> o arrastra tu documento
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-2">
              SOPORTA: PDF, DOCX, XLSX, TXT (MÁX. 15MB)
            </p>
            
            <input 
              ref={inputRef}
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleChange}
              accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.csv"
              disabled={isProcessing}
            />
          </>
        )}
      </div>

      {/* --- FEEDBACK VISUAL --- */}
      {error && (
        <div className="mt-6 flex items-center gap-3 text-rose-600 bg-rose-50 p-4 rounded-xl text-sm font-medium border border-rose-100 animate-in slide-in-from-top-2">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMsg && !error && (
        <div className="mt-6 flex items-center gap-3 text-emerald-700 bg-emerald-50 p-4 rounded-xl text-sm font-medium border border-emerald-100 animate-in slide-in-from-top-2">
          <CheckCircle size={20} className="shrink-0 text-emerald-500" />
          <div>
            <p className="font-bold">¡Entrenamiento exitoso!</p>
            <p className="text-emerald-600/80 text-xs mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

    </div>
  );
}
