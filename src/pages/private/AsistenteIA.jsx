import { useState, useRef, useEffect } from "react";

/**
 * Asistente de IA (Copiloto) de PIVOT.
 * Interfaz de chat interactiva para consultas sobre la base de datos y procesamiento de documentos.
 */
const AsistenteIA = () => {
  const [inputTexto, setInputTexto] = useState("");
  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      rol: "ia",
      texto: "¡Hola, Daniel! Soy el asistente de IA de PIVOT. Puedo ayudarte a gestionar reservas, consultar disponibilidad de activos o analizar documentos de clientes. ¿En qué te ayudo hoy?",
      hora: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [iaEscribiendo, setIaEscribiendo] = useState(false);
  const mensajesEndRef = useRef(null);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarMensaje = (texto) => {
    if (!texto.trim()) return;

    const nuevoMensajeUsuario = {
      id: Date.now(),
      rol: "usuario",
      texto: texto,
      hora: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
    };
    
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setInputTexto("");
    setIaEscribiendo(true);

    // Simulación de respuesta (Pendiente conexión con FastAPI/Gemini)
    setTimeout(() => {
      const respuestaIA = {
        id: Date.now() + 1,
        rol: "ia",
        texto: "Entendido. Estoy procesando tu consulta técnica sobre PIVOT. Actualmente estoy en fase de demostración, pero pronto podré ejecutar acciones directamente en tu base de datos.",
        hora: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
      };
      setMensajes((prev) => [...prev, respuestaIA]);
      setIaEscribiendo(false);
    }, 1500);
  };

  const sugerencias = [
    "¿Qué activos están disponibles hoy?",
    "Muéstrame las reservas pendientes.",
    "Extraer datos de identificación.",
    "Resumen de actividad semanal.",
  ];

  return (
    <div className="space-y-6 font-sans h-[calc(100vh-140px)] flex flex-col">
      {/* Encabezado */}
      <section className="flex items-center gap-4">
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-lg shadow-slate-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Asistente IA</h1>
          <p className="text-slate-600">Copiloto inteligente conectado a PIVOT.</p>
        </div>
      </section>

      {/* Contenedor del Chat */}
      <main className="flex-1 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden flex flex-col">
        
        {/* Área de Conversación */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {mensajes.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.rol === "usuario" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.rol === "usuario"
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                }`}
              >
                {msg.texto}
              </div>
              <span className="text-[10px] font-medium text-slate-400 mt-1.5 px-1 uppercase tracking-wider">
                {msg.hora}
              </span>
            </div>
          ))}

          {iaEscribiendo && (
            <div className="flex items-start">
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={mensajesEndRef} />
        </div>

        {/* Input y Acciones */}
        <footer className="p-6 bg-white border-t border-slate-100">
          {mensajes.length <= 2 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {sugerencias.map((sug, index) => (
                <button
                  key={index}
                  onClick={() => enviarMensaje(sug)}
                  className="text-xs font-medium bg-white hover:bg-slate-900 hover:text-white text-slate-600 border border-slate-200 rounded-xl px-4 py-2 transition-all active:scale-95"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviarMensaje(inputTexto);
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              placeholder="Haz una consulta sobre el negocio..."
              className="w-full pl-5 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 focus:bg-white outline-none transition-all text-sm"
              disabled={iaEscribiendo}
            />
            <button
              type="submit"
              disabled={!inputTexto.trim() || iaEscribiendo}
              className={`absolute right-2 p-2.5 rounded-xl transition-all ${
                inputTexto.trim() && !iaEscribiendo
                  ? "bg-slate-900 text-white shadow-md hover:scale-105"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </form>
          <p className="text-center mt-4 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            Pivot Intelligence Unit • 2026
          </p>
        </footer>
      </main>
    </div>
  );
};

export default AsistenteIA;