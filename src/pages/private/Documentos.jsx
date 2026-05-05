import { useState, useEffect, useCallback } from "react";
import { FileText, Search, Clock, CheckCircle, XCircle, FileSignature, Download, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { documentosService } from "../../services/documentosService";

function Documentos() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // El backend lista documentos por cliente_id.
  // Aquí cargamos todos los documentos del tenant listando por cliente null
  // o puedes pasar un cliente_id específico desde props/context.
  // Por ahora usamos listarPorCliente con el tenant completo si el backend lo soporta,
  // o mostramos un estado vacío hasta que se filtre por cliente.
  const cargarDocumentos = useCallback(async (clienteId = null) => {
    if (!clienteId) {
      // Sin cliente seleccionado no podemos listar — el backend requiere cliente_id
      setDocumentos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await documentosService.listarPorCliente(clienteId);
      setDocumentos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando documentos:", err);
      setError(err.response?.data?.detail || "No se pudieron cargar los documentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial sin filtro de cliente
    setLoading(false);
  }, []);

  const handleDescargar = async (documentoId) => {
    try {
      const blob = await documentosService.descargar(documentoId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `documento_${documentoId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("No se pudo descargar el documento.");
    }
  };

  const handleAnular = async (documentoId) => {
    const motivo = window.prompt("Ingresa el motivo de anulación:");
    if (!motivo) return;

    try {
      await documentosService.anular(documentoId);
      toast.success("Documento anulado correctamente.");
      setDocumentos((prev) =>
        prev.map((d) =>
          d.id === documentoId ? { ...d, estado_firma: "Anulado" } : d
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo anular el documento.");
    }
  };

  const handleVerCertificado = async (documentoId) => {
    try {
      const cert = await documentosService.obtenerCertificado(documentoId);
      toast.info(
        `Firmado el ${new Date(cert.fecha_firma).toLocaleDateString("es-CL")} · Hash: ${cert.hash_sha256?.slice(0, 16)}...`,
        { autoClose: 6000 }
      );
    } catch (err) {
      toast.error("Este documento no tiene certificado de firma válido.");
    }
  };

  const docsFiltrados = documentos.filter((doc) => {
    const q = busqueda.toLowerCase();
    return (
      (doc.tipo_documento ?? "").toLowerCase().includes(q) ||
      (doc.estado_firma ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 font-sans pb-10">

      {/* Cabecera */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documentos y Contratos</h1>
          <p className="mt-2 text-slate-600">
            Gestiona firmas legales, contratos y su estado de validez.
          </p>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <p>⚠ {error}</p>
          <button onClick={() => setError(null)} className="font-semibold underline hover:no-underline">
            Cerrar
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Buscador */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por tipo o estado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha emisión</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-500">
                    Cargando documentos...
                  </td>
                </tr>
              ) : docsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-slate-400">
                    <FileText size={36} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-slate-500">
                      {documentos.length === 0
                        ? "Selecciona un cliente para ver sus documentos."
                        : "No se encontraron documentos."}
                    </p>
                  </td>
                </tr>
              ) : (
                docsFiltrados.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{doc.tipo_documento}</p>
                          <p className="text-xs text-slate-400 font-mono">{String(doc.id).slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {doc.fecha_generacion
                        ? new Date(doc.fecha_generacion).toLocaleDateString("es-CL")
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <EstadoFirma estado={doc.estado_firma} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                        {/* Ver certificado legal (solo si está firmado) */}
                        {doc.estado_firma === "Firmado" && (
                          <button
                            title="Ver evidencia legal"
                            onClick={() => handleVerCertificado(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                        )}

                        {/* Descargar PDF */}
                        <button
                          title="Descargar PDF"
                          onClick={() => handleDescargar(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Download size={18} />
                        </button>

                        {/* Anular (solo si está pendiente o firmado) */}
                        {["Pendiente", "Firmado"].includes(doc.estado_firma) && (
                          <button
                            title="Anular documento"
                            onClick={() => handleAnular(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
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

function EstadoFirma({ estado }) {
  const map = {
    Firmado: { icon: <CheckCircle size={12} />, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    Pendiente: { icon: <Clock size={12} />, cls: "bg-amber-50 text-amber-700 border-amber-200" },
    Anulado: { icon: <XCircle size={12} />, cls: "bg-red-50 text-red-700 border-red-200" },
  };

  const config = map[estado] ?? map["Pendiente"];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.cls}`}>
      {config.icon}
      {estado ?? "Pendiente"}
    </span>
  );
}

export default Documentos;