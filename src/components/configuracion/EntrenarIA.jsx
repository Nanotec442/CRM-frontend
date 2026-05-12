import React, { useState, useRef } from "react";
import { BrainCircuit, UploadCloud, Loader2, CheckCircle, AlertCircle, Sparkles, Link as LinkIcon } from "lucide-react";
import { toast } from "react-toastify";
import iaService from "../../services/iaService";

export default function EntrenarIA() {
  // --- ESTADOS ARCHIVOS ---
  const [dragActive, setDragActive] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [fileSuccessMsg, setFileSuccessMsg] = useState(null);
  const inputRef = useRef(null);

  // --- ESTADOS URL ---
  const [urlInput, setUrlInput] = useState("");
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [urlFeedback, setUrlFeedback] = useState({ type: null, message: "" }); // type: 'error' | 'success'

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
      entrenarModeloArchivo(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      entrenarModeloArchivo(e.target.files[0]);
    }
  };

  // --- LÓGICA DE API (ARCHIVOS) ---
  const entrenarModeloArchivo = async (file) => {
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError("El documento excede el límite de 15MB permitido.");
      toast.error("Archivo demasiado pesado.");
      return;
    }

    setIsProcessingFile(true);
    setFileError(null);
    setFileSuccessMsg(null);

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const response = await iaService.entrenarPdf(formData);
      const mensajeExito = response?.mensaje || "Documento procesado e indexado en la base de conocimiento.";
      setFileSuccessMsg(mensajeExito);
      toast.success("¡IA entrenada con documento!");
    } catch (err) {
      console.error("Error entrenando IA:", err);
      if (err.response) {
        const errMsg = err.response.data?.detail || "Error del servidor al procesar el documento.";
        setFileError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        toast.error("Fallo al procesar el documento.");
      } else {
        setFileError("Error de red. Verifica tu conexión a internet.");
        toast.error("Error de conexión.");
      }
    } finally {
      setIsProcessingFile(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  // --- LÓGICA DE API (URL) ---
  const entrenarModeloUrl = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    // Validación básica de URL
    try {
      new URL(urlInput);
    } catch (_) {
      setUrlFeedback({ type: "error", message: "Por favor, ingresa una URL válida que empiece con http:// o https://" });
      return;
    }

    setIsProcessingUrl(true);
    setUrlFeedback({ type: null, message: "" });

    try {
      const response = await iaService.entrenarUrl({ url: urlInput });
      const mensajeExito = response?.mensaje || "URL procesada e indexada en la base de conocimiento.";
      setUrlFeedback({ type: "success", message: mensajeExito });
      setUrlInput(""); // Limpiar el input
      toast.success("¡IA entrenada desde URL!");
    } catch (err) {
      console.error("Error entrenando IA con URL:", err);
      if (err.response) {
        const errMsg = err.response.data?.detail || "Error del servidor al procesar la URL.";
        setUrlFeedback({ type: "error", message: typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg) });
        toast.error("Fallo al procesar la URL.");
      } else {
        setUrlFeedback({ type: "error", message: "Error de red. Verifica tu conexión a internet." });
        toast.error("Error de conexión.");
      }
    } finally {
      setIsProcessingUrl(false);
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
            Sube documentos técnicos, manuales o políticas, o proporciona la URL de tu sitio web. 
            Esta información alimentará el motor RAG de PIVOT, entrenando al asistente para dar 
            respuestas exactas basadas en el contexto real de tu negocio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        
        {/* ================================================== */}
        {/* SECCIÓN 1: SUBIDA DE ARCHIVOS                      */}
        {/* ================================================== */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">1. Subir Documento</h3>
          <div 
            className={`relative group border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[220px]
              ${dragActive ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]' : 'border-slate-200 bg-slate-50 hover:bg-slate-50/50 hover:border-indigo-300'}
              ${isProcessingFile ? 'opacity-70 pointer-events-none blur-[1px]' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isProcessingFile ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="relative">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" strokeWidth={1.5} />
                </div>
                <p className="text-slate-800 font-bold text-sm">Extrayendo texto y vectorizando...</p>
                <p className="text-xs text-slate-500 mt-1">Esto puede tomar unos segundos.</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-3 group-hover:-translate-y-1 transition-transform">
                  <UploadCloud size={28} className="text-indigo-500" strokeWidth={1.5} />
                </div>
                <p className="text-slate-700 font-medium mb-1 text-base">
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
                  disabled={isProcessingFile}
                />
              </>
            )}
          </div>

          {/* Feedback Archivos */}
          {fileError && (
            <div className="mt-4 flex items-center gap-3 text-rose-600 bg-rose-50 p-3 rounded-xl text-sm font-medium border border-rose-100 animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" /> <p>{fileError}</p>
            </div>
          )}
          {fileSuccessMsg && !fileError && (
            <div className="mt-4 flex items-center gap-3 text-emerald-700 bg-emerald-50 p-3 rounded-xl text-sm font-medium border border-emerald-100 animate-in slide-in-from-top-2">
              <CheckCircle size={18} className="shrink-0 text-emerald-500" />
              <div>
                <p className="font-bold">¡Archivo procesado!</p>
                <p className="text-emerald-600/80 text-xs mt-0.5">{fileSuccessMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* DIVISOR                                            */}
        {/* ================================================== */}
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">O utiliza un enlace</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* ================================================== */}
        {/* SECCIÓN 2: SCRAPING DE URL                         */}
        {/* ================================================== */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">2. Entrenar con Sitio Web</h3>
          <form onSubmit={entrenarModeloUrl} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon size={18} className="text-slate-400" />
              </div>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={isProcessingUrl}
                placeholder="https://www.miempresa.com/quienes-somos"
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow disabled:bg-slate-50 disabled:text-slate-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isProcessingUrl || !urlInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessingUrl ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Procesando...
                </>
              ) : (
                "Extraer y Entrenar"
              )}
            </button>
          </form>

          {/* Feedback URL */}
          {urlFeedback.type === "error" && (
            <div className="mt-4 flex items-center gap-3 text-rose-600 bg-rose-50 p-3 rounded-xl text-sm font-medium border border-rose-100 animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" /> <p>{urlFeedback.message}</p>
            </div>
          )}
          {urlFeedback.type === "success" && (
            <div className="mt-4 flex items-center gap-3 text-emerald-700 bg-emerald-50 p-3 rounded-xl text-sm font-medium border border-emerald-100 animate-in slide-in-from-top-2">
              <CheckCircle size={18} className="shrink-0 text-emerald-500" />
              <div>
                <p className="font-bold">¡URL analizada!</p>
                <p className="text-emerald-600/80 text-xs mt-0.5">{urlFeedback.message}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}