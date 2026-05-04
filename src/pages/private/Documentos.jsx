import React, { useState, useEffect } from "react";
import { FileText, Search, Clock, CheckCircle, AlertCircle, FileSignature, Download, Eye } from "lucide-react";
// import { documentosService } from "../../services/documentosService"; // Descomentar cuando tengas el servicio

function Documentos() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Simulamos la carga inicial (aquí irá tu llamada a la API)
  useEffect(() => {
    setTimeout(() => {
      setDocumentos([
        { id: 1, titulo: "Contrato de Prestación de Servicios", cliente: "Juan Pérez", tipo: "Legal (API)", estado: "pendiente", fecha: "2026-04-29" },
        { id: 2, titulo: "Recepción de Equipo", cliente: "María González", tipo: "Física (Pantalla)", estado: "firmado", fecha: "2026-04-28" },
        { id: 3, titulo: "Acuerdo de Confidencialidad", cliente: "Tech Solutions Limitada", tipo: "Legal (API)", estado: "firmado", fecha: "2026-04-25" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const docsFiltrados = documentos.filter(doc => 
    doc.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
    doc.cliente.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* --- CABECERA --- */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documentos y Contratos</h1>
          <p className="mt-2 text-slate-600">
            Gestiona el estado de las firmas legales y documentos físicos de tus clientes.
          </p>
        </div>
        
        <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm">
          + Generar Documento
        </button>
      </section>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Buscador */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Buscar por documento o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 bg-white"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha Emisión</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10 text-slate-500">Cargando documentos...</td></tr>
              ) : docsFiltrados.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-slate-500">No se encontraron documentos.</td></tr>
              ) : (
                docsFiltrados.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${doc.tipo.includes('API') ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{doc.titulo}</p>
                          <p className="text-xs text-slate-500">{doc.tipo}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700">{doc.cliente}</td>
                    
                    <td className="px-6 py-4 text-slate-600">{doc.fecha}</td>
                    
                    <td className="px-6 py-4">
                      <EstadoFirma estado={doc.estado} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* Si está pendiente y es por API, mostramos botón de firmar */}
                        {doc.estado === 'pendiente' && doc.tipo.includes('API') && (
                          <button title="Abrir Firma Embebida" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <FileSignature size={18} />
                          </button>
                        )}

                        <button title="Ver Documento" className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                          <Eye size={18} />
                        </button>

                        <button title="Descargar PDF" className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                          <Download size={18} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Badge visual para el estado de la firma
function EstadoFirma({ estado }) {
  if (estado === 'firmado') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle size={12} /> Firmado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <Clock size={12} /> Pendiente
    </span>
  );
}

export default Documentos;