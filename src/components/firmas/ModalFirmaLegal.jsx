import React, { useState, useEffect } from 'react';
import { FileSignature, Loader2, X } from 'lucide-react';

export default function ModalFirmaLegal({ isOpen, onClose }) {
  const [urlFirma, setUrlFirma] = useState(null);
  const [cargando, setCargando] = useState(true);

  const obtenerLinkDeFirma = async () => {
    setCargando(true);
    setUrlFirma(null);
    try {
      setTimeout(() => {
        setUrlFirma("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
        setCargando(false);
      }, 2000);
    } catch (error) {
      console.error("Error al obtener el link de firma", error);
      setCargando(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
      obtenerLinkDeFirma();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <FileSignature size={20} strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Firma de Contrato Legal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 bg-slate-100 relative">
          {cargando ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-800 font-bold">Generando documento seguro...</p>
              <p className="text-sm text-slate-500 mt-1">Conectando con proveedor de firmas.</p>
            </div>
          ) : urlFirma ? (
            <iframe
              src={urlFirma}
              className="w-full h-full border-0"
              title="Firma Legal Embebida"
              allow="camera; microphone; geolocation"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-rose-500 font-bold">No se pudo cargar el documento de firma.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}