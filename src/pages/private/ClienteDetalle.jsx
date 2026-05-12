import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  ArrowLeft, User, Mail, Phone, Building2, Fingerprint,
  Edit2, Archive, Loader2, Calendar, KanbanSquare,
  FileText, Download, Clock, CheckCircle, XCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { clientesService } from "../../services/clientesService";
import { documentosService } from "../../services/documentosService";
import ClienteForm from "../../components/clientes/ClienteForm";

function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(false);
  const [archivando, setArchivando] = useState(false);
  const [documentos, setDocumentos] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Verificar si el usuario es superadmin desde el JWT
  const esSuperAdmin = (() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const payload = jwtDecode(token);
      return payload.is_superadmin === true;
    } catch {
      return false;
    }
  })();

  const puedeAdministrar = (() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const payload = jwtDecode(token);
      return payload.permisos?.administrar_empresa === true || payload.is_superadmin === true;
    } catch { return false; }
  })();

  const cargarCliente = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientesService.obtener(id);
      setCliente(data);
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo cargar el cliente.");
    } finally {
      setLoading(false);
    }
  };

  const cargarDocumentos = async () => {
    try {
      setLoadingDocs(true);
      const data = await documentosService.listarPorCliente(id);
      setDocumentos(Array.isArray(data) ? data : []);
    } catch {
      setDocumentos([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    cargarCliente();
    cargarDocumentos();
  }, [id]);

  const handleGuardar = async (formData) => {
    try {
      const actualizado = await clientesService.modificar(id, formData);
      setCliente((prev) => ({ ...prev, ...actualizado }));
      setEditando(false);
      toast.success("Cliente actualizado correctamente.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al actualizar el cliente.");
    }
  };

  const handleArchivar = async () => {
    const estaInactivo = cliente?.estado?.toLowerCase() === "inactivo";
    const accion = estaInactivo ? "reactivar" : "archivar";
    const nuevoEstado = estaInactivo ? "Activo" : "Inactivo";

    if (!window.confirm(
      `¿${accion === "archivar" ? "Archivar" : "Reactivar"} a ${cliente?.nombre_completo}?`
    )) return;

    setArchivando(true);
    try {
      await clientesService.modificar(id, { estado: nuevoEstado });
      setCliente((prev) => ({ ...prev, estado: nuevoEstado }));
      toast.success(`Cliente ${nuevoEstado === "Activo" ? "reactivado" : "archivado"} correctamente.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || `No se pudo ${accion} el cliente.`);
    } finally {
      setArchivando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center">
        <p className="text-slate-500 font-medium mb-4">{error}</p>
        <button
          onClick={() => navigate("/panel/clientes")}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          Volver a Clientes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 font-sans pb-10">

      {/* Botón volver */}
      <button
        onClick={() => navigate("/panel/clientes")}
        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver a Clientes
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white text-lg font-bold flex items-center justify-center shrink-0 shadow-sm">
            {(cliente?.nombre_completo ?? "?")
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0]?.toUpperCase() ?? "")
              .join("")}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {cliente?.nombre_completo}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Cliente desde {formatearFecha(cliente?.fecha_creacion)}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditando(!editando)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Edit2 size={15} />
            {editando ? "Cancelar" : "Editar"}
          </button>

          {puedeAdministrar && (
            <button
              onClick={handleArchivar}
              disabled={archivando}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-colors disabled:opacity-70 ${cliente?.estado?.toLowerCase() === "inactivo"
                  ? "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                  : "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100"
                }`}
            >
              {archivando ? (
                <Loader2 size={15} className="animate-spin" />
              ) : cliente?.estado?.toLowerCase() === "inactivo" ? (
                <CheckCircle size={15} />
              ) : (
                <Archive size={15} />
              )}
              {cliente?.estado?.toLowerCase() === "inactivo" ? "Reactivar" : "Archivar"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna izquierda — Datos del cliente */}
        <div className="lg:col-span-1 space-y-4">

          {/* Formulario de edición o tarjeta de datos */}
          {editando ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Editar Cliente</h2>
              <ClienteForm
                clienteEditando={{
                  nombre: cliente?.nombre_completo,
                  email: cliente?.email,
                  telefono: cliente?.telefono,
                  empresa: cliente?.empresa,
                  notas: cliente?.notas,
                }}
                onGuardar={handleGuardar}
                onCancelar={() => setEditando(false)}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-700">Información de Contacto</h2>
              </div>
              <div className="p-6 space-y-4">

                <InfoRow icon={<Mail size={16} />} label="Email" value={cliente?.email} />
                <InfoRow icon={<Phone size={16} />} label="Teléfono" value={cliente?.telefono} />
                <InfoRow icon={<Building2 size={16} />} label="Empresa" value={cliente?.empresa} />
                <InfoRow icon={<Fingerprint size={16} />} label="RUT" value={cliente?.rut_documento} />
                <InfoRow icon={<User size={16} />} label="Origen" value={cliente?.origen} />

                {/* Estado */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Estado</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${cliente?.estado?.toLowerCase() === "activo"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : cliente?.estado?.toLowerCase() === "inactivo"
                      ? "bg-slate-100 text-slate-600 border-slate-200"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}>
                    {cliente?.estado ?? "Nuevo"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha — Tarjetas del pipeline */}
        <div className="lg:col-span-2 space-y-4">

          {/* Tarjetas en el pipeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <KanbanSquare size={16} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-700">
                Oportunidades en Pipeline ({cliente?.tarjetas?.length ?? 0})
              </h2>
            </div>

            {!cliente?.tarjetas?.length ? (
              <div className="px-6 py-10 text-center">
                <KanbanSquare size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm text-slate-500 font-medium">
                  Sin oportunidades en el pipeline.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {cliente.tarjetas.map((tarjeta) => (
                  <div key={tarjeta.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {tarjeta.posicion_tablero ?? "Sin etapa"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Actualizado {formatearFecha(tarjeta.fecha_actualizacion)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {tarjeta.valor_estimado > 0 && (
                        <span className="text-sm font-bold text-emerald-600">
                          ${Number(tarjeta.valor_estimado).toLocaleString("es-CL")}
                        </span>
                      )}
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${tarjeta.activa
                        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                        {tarjeta.activa ? "Activa" : "Archivada"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fecha de creación */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Calendar size={16} className="text-slate-500" />
              <h2 className="text-sm font-bold text-slate-700">Actividad</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Registrado en PIVOT</span>
                <span className="font-semibold text-slate-800">{formatearFecha(cliente?.fecha_creacion)}</span>
              </div>
            </div>
          </div>

        </div>
        {/* Documentos del cliente */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-700">
              Documentos ({documentos.length})
            </h2>
          </div>
          {loadingDocs ? (
            <div className="py-8 text-center">
              <Loader2 size={20} className="animate-spin mx-auto text-slate-400" />
            </div>
          ) : documentos.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <FileText size={28} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">Sin documentos registrados.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {documentos.map((doc) => (
                <div key={doc.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{doc.tipo_documento}</p>
                    <p className="text-xs text-slate-400">
                      {doc.fecha_generacion
                        ? new Date(doc.fecha_generacion).toLocaleDateString("es-CL")
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${doc.estado_firma === "Firmado"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : doc.estado_firma === "Anulado"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                      {doc.estado_firma ?? "Pendiente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Componente auxiliar para filas de info
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-slate-400 mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-700 mt-0.5 truncate">
          {value || <span className="text-slate-300">—</span>}
        </p>
      </div>
    </div>
  );
}

export default ClienteDetalle;