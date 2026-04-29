import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { PenTool, Eraser, CheckCircle2, Type, MousePointer2 } from 'lucide-react';

export default function FirmaFisica({ onGuardar, onCancelar }) {
  const sigCanvas = useRef(null);
  
  // Estados para controlar el modo de firma
  const [modo, setModo] = useState('escribir'); // 'escribir' | 'dibujar'
  const [textoFirma, setTextoFirma] = useState('');

  // Importamos una fuente cursiva de Google Fonts al cargar el componente
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const limpiarFirma = () => {
    if (modo === 'dibujar') {
      sigCanvas.current.clear();
    } else {
      setTextoFirma('');
    }
  };

  const guardarFirma = () => {
    let imagenBase64 = '';

    if (modo === 'dibujar') {
      if (sigCanvas.current.isEmpty()) {
        alert("Por favor, dibuja tu firma antes de guardar.");
        return;
      }
      imagenBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    
    } else {
      if (!textoFirma.trim()) {
        alert("Por favor, escribe tu nombre para generar la firma.");
        return;
      }
      
      // Truco: Creamos un Canvas invisible para convertir el texto en imagen
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      // Estilos del texto
      ctx.font = '60px "Caveat", cursive';
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Dibujamos el texto en el centro
      ctx.fillText(textoFirma, canvas.width / 2, canvas.height / 2);
      
      imagenBase64 = canvas.toDataURL('image/png');
    }

    onGuardar(imagenBase64);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-lg animate-in zoom-in-95 duration-300 font-sans">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
          <PenTool size={22} strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Firma de Conformidad</h3>
          <p className="text-sm text-slate-500 font-medium">Ingresa la firma para validar el proceso.</p>
        </div>
      </div>

      {/* SELECTOR DE MODO (TABS) */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-4">
        <button
          onClick={() => setModo('escribir')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            modo === 'escribir' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Type size={16} /> Teclado
        </button>
        <button
          onClick={() => setModo('dibujar')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            modo === 'dibujar' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <MousePointer2 size={16} /> Dibujar (Táctil)
        </button>
      </div>

      {/* ÁREA DE FIRMA */}
      <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden mb-6 relative group h-48 flex items-center justify-center">
        
        {modo === 'dibujar' ? (
          <>
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="#0f172a" 
              canvasProps={{ 
                className: 'w-full h-full cursor-crosshair touch-none absolute inset-0'
              }} 
            />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none group-hover:opacity-0 transition-opacity">
              Dibuja aquí
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 relative">
             <input 
               type="text"
               value={textoFirma}
               onChange={(e) => setTextoFirma(e.target.value)}
               placeholder="Escribe tu nombre completo..."
               className="w-full text-center bg-transparent border-b-2 border-slate-300 focus:border-indigo-500 outline-none pb-2 text-slate-600 transition-colors z-10"
             />
             {/* Vista previa de la firma cursiva */}
             {textoFirma && (
               <div 
                 className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80"
                 style={{ fontFamily: "'Caveat', cursive", fontSize: '3.5rem', color: '#0f172a' }}
               >
                 {textoFirma}
               </div>
             )}
          </div>
        )}

      </div>

      {/* BOTONES */}
      <div className="flex gap-3">
        <button 
          onClick={limpiarFirma} 
          className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors flex justify-center items-center gap-2"
        >
          <Eraser size={18} /> Limpiar
        </button>
        <button 
          onClick={guardarFirma} 
          className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md active:scale-[0.98] flex justify-center items-center gap-2"
        >
          <CheckCircle2 size={18} /> Confirmar
        </button>
      </div>
      
      {onCancelar && (
        <button onClick={onCancelar} className="w-full mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider">
          Cancelar
        </button>
      )}
    </div>
  );
}