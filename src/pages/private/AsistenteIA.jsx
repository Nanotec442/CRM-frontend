import { useState, useRef, useEffect } from "react";

const AsistenteIA = () => {
  // Estado para el texto del input
  const [inputTexto, setInputTexto] = useState("");
  
  // Estado para almacenar los mensajes del chat
  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      rol: "ia",
      texto: "¡Hola, Daniel! Soy el asistente de IA de PIVOT 360LAB. Puedo ayudarte a gestionar reservas, consultar disponibilidad de activos o analizar documentos de clientes. ¿En qué te ayudo hoy?",
      hora: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  // Estado temporal para simular que la IA está "escribiendo"
  const [iaEscribiendo, setIaEscribiendo] = useState(false);
  
  // Referencia para hacer auto-scroll al final del chat
  const mensajesEndRef = useRef(null);

  // Auto-scroll al fondo cada vez que cambian los mensajes
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // Función para manejar el envío de mensajes
  const enviarMensaje = (texto) => {
    if (!texto.trim()) return;

    // 1. Agregar el mensaje del usuario al chat
    const nuevoMensajeUsuario = {
      id: Date.now(),
      rol: "usuario",
      texto: texto,
      hora: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
    };
    
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setInputTexto("");
    setIaEscribiendo(true);

    // 2. Simular respuesta de la IA (Esto lo cambiarás por tu llamada a FastAPI después)
    setTimeout(() => {
      const respuestaIA = {
        id: Date.now() + 1,
        rol: "ia",
        texto: "En este momento estoy en versión de demostración. Pronto podré conectarme a tu base de datos para responder esta consulta real. ¡Sigue desarrollando PIVOT 360LAB!",
        hora: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
      };
      setMensajes((prev) => [...prev, respuestaIA]);
      setIaEscribiendo(false);
    }, 1500); // Simula 1.5 segundos de "pensamiento"
  };

  // Sugerencias de preguntas para que el panel no se vea vacío
  const sugerencias = [
    "¿Qué activos están disponibles hoy?",
    "Muéstrame las reservas canceladas.",
    "¿Cómo extraigo datos de un carnet?",
    "Resumen de clientes de esta semana.",
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* Header del Asistente */}
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-blue-600 text-white p-3 rounded-xl shadow-md">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Asistente IA (Copiloto)</h1>
          <p className="text-sm text-slate-500">Conectado a la base de conocimiento de PIVOT</p>
        </div>
      </div>

      {/* Contenedor Principal del Chat */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Área de Mensajes (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          
          {/* Mapeo de Mensajes */}
          {mensajes.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.rol === "usuario" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[75%] px-5 py-3 rounded-2xl ${
                  msg.rol === "usuario"
                    ? "bg-slate-800 text-white rounded-tr-sm"
                    : "bg-white text-slate-700 border border-gray-200 shadow-sm rounded-tl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.texto}</p>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 mx-1">{msg.hora}</span>
            </div>
          ))}

          {/* Indicador de "IA Escribiendo..." */}
          {iaEscribiendo && (
            <div className="flex items-start">
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
              </div>
            </div>
          )}
          
          {/* Referencia invisible para el auto-scroll */}
          <div ref={mensajesEndRef} />
        </div>

        {/* Área Inferior (Sugerencias y Barra de Entrada) */}
        <div className="p-4 bg-white border-t border-gray-100">
          
          {/* Tarjetas de Sugerencias (Solo se muestran si hay pocos mensajes) */}
          {mensajes.length <= 2 && (
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {sugerencias.map((sug, index) => (
                <button
                  key={index}
                  onClick={() => enviarMensaje(sug)}
                  className="text-xs bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-full transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Formulario de Entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviarMensaje(inputTexto);
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              placeholder="Haz una pregunta o pide que redacte un contrato..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
              disabled={iaEscribiendo}
            />
            <button
              type="submit"
              disabled={!inputTexto.trim() || iaEscribiendo}
              className={`px-5 py-3 rounded-xl flex items-center justify-center transition-all ${
                inputTexto.trim() && !iaEscribiendo
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-2">
             <span className="text-[10px] text-gray-400">
               La IA puede cometer errores. Verifica la información antes de tomar decisiones operativas.
             </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AsistenteIA;