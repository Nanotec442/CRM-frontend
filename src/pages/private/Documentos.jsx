import { useState, useEffect, useCallback } from "react";
import {
  FileText, Search, Clock, CheckCircle, XCircle,
  Download, Eye, FileSignature, Ban, Loader2, Users
} from "lucide-react";
import { toast } from "react-toastify";
import { documentosService } from "../../services/documentosService";
import { clientesService } from "../../services/clientesService";
import FirmaFisica from "../../components/firmas/FirmaFisica";

function Documentos() {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [firmaState, setFirmaState] = useState({ isOpen: false, documentoId: null });

  useEffect(() => {
    clientesService.listar()
      .then((data) => setClientes(Array.isArray(data) ? data : []))
      .catch(() => toast.error("No se pudieron cargar los clientes."))
      .finally(() => setLoadingClientes(false));
  }, []);

  const cargarDocumentos = useCallback(async (clienteId) => {
    try {
      setLoading(true);
      const data = await documentosService.listarPorCliente(clienteId);
      setDocumentos(Array.isArray(data) ? data : []);
    } catch {
      toast.error("No se pudieron cargar los documentos.");
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente("");
    cargarDocumentos(cliente.id ?? cliente.cliente_id);
  };

  const handleDescargar = async (documentoId) => {
    try {
      const blob = await documentosService.descargar(documentoId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `documento_${documentoId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("No se pudo descargar el documento.");
    }
  };

  const handleVerCertificado = async (documentoId) => {
    try {
      const cert = await documentosService.obtenerCertificado(documentoId);
      toast.info(
        `Firmado: ${new Date(cert.fecha_firma).toLocaleDateString("es-CL")} · Hash: ${cert.hash_sha256?.slice(0, 16)}...`,
        { autoClose: 8000 }
      );
    } catch {
      toast.error("Este documento no tiene certificado de firma válido.");
    }
  };

  const handleAnular = async (documentoId) => {
    const motivo = window.prompt("Ingresa el motivo de anulación:");
    if (!motivo) return;
    try {
      await documentosService.anular(documentoId);
      toast.success("Documento anulado correctamente.");
      setDocumentos((prev) =>
        prev.map((d) => d.id === documentoId ? { ...d, estado_firma: "Anulado" } : d)
      );
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo anular el documento.");
    }
  };

  const handleFirmarFisica = async (imagenBase64) => {
    try {
      await documentosService.firmarAlternativo(firmaState.documentoId, {
        firma_base64: imagenBase64,
      });
      toast.success("Documento firmado correctamente.");
      setDocumentos((prev) =>
        prev.map((d) =>
          d.id === firmaState.documentoId ? { ...d, estado_firma: "Firmado" } : d
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al firmar el documento.");
    } finally {
      setFirmaState({ isOpen: false, documentoId: null });
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    const q = busquedaCliente.toLowerCase();
    return (
      (c.nombre_completo ?? c.nombre ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  });

  const docsFiltrados = documentos.filter((doc) =>
    (doc.tipo_documento ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (doc.estado_firma ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans pb-10">

      <section>
        <h1 className="text-3xl font-bold text-slate-900">Documentos y Contratos</h1>
        <p className="mt-2 text-slate-600">
          Gestiona firmas legales, contratos y su estado de validez por cliente.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Panel izquierdo — Clientes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Cliente
              </p>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[500px]">
              {loadingClientes ? (
                <div className="py-8 text-center">
                  <Loader2 size={20} className="animate-spin mx-auto text-slate-400" />
                </div>
              ) : clientesFiltrados.length === 0 ? (
                <div className="py-8 text-center">
                  <Users size={24} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400">Sin resultados</p>
                </div>
              ) : (
                clientesFiltrados.map((c) => {
                  const id = c.id ?? c.cliente_id;
                  const nombre = c.nombre_completo ?? c.nombre ?? "Sin nombre";
                  const seleccionado = clienteSeleccionado?.id === id || clienteSeleccionado?.cliente_id === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleSeleccionarCliente(c)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-50 transition-colors ${
                        seleccionado
                          ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <p className={`text-sm font-semibold truncate ${seleccionado ? "text-indigo-700" : "text-slate-800"}`}>
                        {nombre}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{c.email}</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Panel derecho — Documentos */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-indigo-600" />
                <p className="text-sm font-bold text-slate-700">
                  {clienteSeleccionado
                    ? `Documentos de ${clienteSeleccionado.nombre_completo ?? clienteSeleccionado.nombre}`
                    : "Selecciona un cliente"}
                </p>
              </div>
              {clienteSeleccionado && (
                <div className="relative max-w-xs w-full">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
                  />
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Documento</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!clienteSeleccionado ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center">
                        <Users size={36} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 font-medium text-sm">
                          Selecciona un cliente para ver sus documentos
                        </p>
                      </td>
                    </tr>
                  ) : loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center">
                        <Loader2 size={24} className="animate-spin mx-auto text-slate-400" />
                      </td>
                    </tr>
                  ) : docsFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center">
                        <FileText size={36} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 font-medium text-sm">
                          Sin documentos registrados para este cliente.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    docsFiltrados.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                              <FileText size={16} />
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
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {doc.estado_firma === "Pendiente" && (
                              <button
                                title="Firmar documento"
                                onClick={() => setFirmaState({ isOpen: true, documentoId: doc.id })}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <FileSignature size={16} />
                              </button>
                            )}
                            {doc.estado_firma === "Firmado" && (
                              <button
                                title="Ver evidencia legal"
                                onClick={() => handleVerCertificado(doc.id)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                            <button
                              title="Descargar PDF"
                              onClick={() => handleDescargar(doc.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Download size={16} />
                            </button>
                            {["Pendiente", "Firmado"].includes(doc.estado_firma) && (
                              <button
                                title="Anular documento"
                                onClick={() => handleAnular(doc.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Ban size={16} />
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
      </div>

      {/* Modal firma física */}
      {firmaState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <FirmaFisica
            onGuardar={handleFirmarFisica}
            onCancelar={() => setFirmaState({ isOpen: false, documentoId: null })}
          />
        </div>
      )}
    </div>
  );
}

function EstadoFirma({ estado }) {
  const map = {
    Firmado:  { icon: <CheckCircle size={12} />, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    Pendiente:{ icon: <Clock size={12} />,       cls: "bg-amber-50 text-amber-700 border-amber-200" },
    Anulado:  { icon: <XCircle size={12} />,     cls: "bg-red-50 text-red-700 border-red-200" },
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