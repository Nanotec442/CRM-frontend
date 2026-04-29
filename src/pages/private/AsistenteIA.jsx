import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify"; // Importamos la librería de notificaciones
import { Bot, Send, Sparkles } from "lucide-react"; // Iconos más limpios

import iaService from "../../services/iaService";

/**
 * @component AsistenteIA
 * @description Módulo de chat interactivo que conecta al usuario final con el modelo de IA (Gemini/FastAPI).
 * Permite realizar consultas en lenguaje natural sobre la base de datos (reservas, activos, etc.).
 * * @returns {JSX.Element} Interfaz de usuario del chat con animaciones y auto-scroll.
 */
const AsistenteIA = () => {
  // --- 1. ESTADOS DEL COMPONENTE ---
  const [inputTexto, setInputTexto] = useState("");
  const [iaEscribiendo, setIaEscribiendo] = useState(false);
  
  // Estado inicial del historial de mensajes
  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      rol: "ia",
      texto: "¡Hola! Soy el asistente de IA de PIVOT. Puedo ayudarte a gestionar reservas, consultar disponibilidad de activos o analizar métricas. ¿En qué te ayudo hoy?",
      hora: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  // Referencia al final de la lista de mensajes para el auto-scroll
  const mensajesEndRef = useRef(null);

  // --- 2. EFECTOS SECUNDARIOS (Hooks) ---
  /**
   * Efecto que se ejecuta cada vez que el arreglo de 'mensajes' cambia.
   * Hace un scroll suave hacia abajo para mostrar siempre el último mensaje.
   */
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

// --- 3. FUNCIONES CONTROLADORAS ---
  /**
   * Procesa el envío de un nuevo mensaje por parte del usuario y se comunica con el backend usando Axios.
   * @param {string} texto - El contenido del mensaje escrito por el usuario.
   */
  const enviarMensaje = async (texto) => {
    if (!texto.trim()) return; // Evita enviar mensajes vacíos

    // 3.1. Crear y mostrar el mensaje del usuario inmediatamente en la UI
    const nuevoMensajeUsuario = {
      id: Date.now(),
      rol: "usuario",
      texto: texto,
      hora: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
    };
    
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setInputTexto(""); // Limpiamos el input
    setIaEscribiendo(true); // Activamos la animación de "Escribiendo..."

    // 3.2. Comunicación con el backend usando Axios (¡Mucho más limpio!)
    try {
      // ✅ Usamos tu instancia "api". El token se envía solo gracias al interceptor.
      const response = await iaService.chatAyuda({ 
        pregunta: texto 
      });

      // 3.3. Crear y mostrar la respuesta exitosa de la IA
      const respuestaIA = {
        id: Date.now() + 1,
        rol: "ia",
        // Axios ya convierte el JSON, así que accedemos directamente a response.data
        texto: response.respuesta || "Lo siento, no pude procesar una respuesta de texto válida.",
        hora: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
      };
      
      setMensajes((prev) => [...prev, respuestaIA]);

    } catch (error) {
      console.error("Error en Asistente IA:", error);
      
      // 3.4. Manejo de Errores con Axios
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
        } else {
          toast.error("Error del servidor al contactar a la IA.");
        }
      } else {
        toast.error("Error de conexión. Revisa tu internet.");
      }
      
    } finally {
      // 3.5. Apagamos la animación de carga independientemente del resultado
      setIaEscribiendo(false);
    }
  };

  // Sugerencias rápidas predefinidas para ayudar al usuario
  const sugerencias = [
    "¿Qué activos están disponibles hoy?",
    "Muéstrame las reservas pendientes.",
    "¿Cómo extraigo datos de un carnet?",
  ];

  // --- 4. RENDERIZADO DE LA INTERFAZ ---
  return (
    <div className="space-y-6 font-sans h-[calc(100vh-120px)] flex flex-col max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* --- Encabezado --- */}
      <section className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl shadow-inner">
            <Bot size={28} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Asistente Inteligente <Sparkles size={16} className="text-amber-400" />
            </h1>
            <p className="text-sm text-slate-500 font-medium">Copiloto empresarial de PIVOT</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sistemas Operativos</span>
        </div>
      </section>

      {/* --- Contenedor Principal del Chat --- */}
      <main className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
        
        {/* Área de Historial de Conversación */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50/50 scroll-smooth">
          {mensajes.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                msg.rol === "usuario" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                  msg.rol === "usuario"
                    ? "bg-slate-900 text-white rounded-2xl rounded-br-sm" // Globo del usuario (oscuro, punta der)
                    : "bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-bl-sm" // Globo IA (claro, punta izq)
                }`}
              >
                {msg.texto}
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-2 px-1 uppercase tracking-widest">
                {msg.rol === "ia" ? "PIVOT IA • " : "TÚ • "} {msg.hora}
              </span>
            </div>
          ))}

          {/* Animación de "IA Escribiendo..." */}
          {iaEscribiendo && (
            <div className="flex items-start animate-in fade-in">
              <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          
          {/* Div invisible para forzar el scroll al final */}
          <div ref={mensajesEndRef} className="h-4" />
        </div>

        {/* --- Footer: Input y Sugerencias --- */}
        <footer className="p-4 md:p-6 bg-white border-t border-slate-100">
          
          {/* Sugerencias (Se ocultan cuando la conversación avanza para no estorbar) */}
          {mensajes.length <= 2 && (
            <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in">
              {sugerencias.map((sug, index) => (
                <button
                  key={index}
                  onClick={() => enviarMensaje(sug)}
                  className="text-xs font-semibold bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-full px-4 py-2 transition-all active:scale-95"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Formulario de envío de texto */}
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
              placeholder="Pregúntale a PIVOT sobre reservas, métricas o clientes..."
              className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium placeholder:text-slate-400 shadow-inner"
              disabled={iaEscribiendo}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputTexto.trim() || iaEscribiendo}
              className={`absolute right-2 p-3 rounded-full transition-all duration-200 ${
                inputTexto.trim() && !iaEscribiendo
                  ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105 active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
          
        </footer>
      </main>
    </div>
  );
};

export default AsistenteIA;
