import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, ToggleLeft, ToggleRight, Trash2, Loader2, Building2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import empresasService from "../../services/empresasService";
import ModalCrearEmpresa from "./ModalCrearEmpresa";

export default function EmpresasList() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalCrear, setModalCrear] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await empresasService.listarTodasEmpresas();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch {
      toast.error("No se pudieron cargar las empresas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleToggleEstado = async (empresa) => {
    const nuevoEstado = empresa.estado_cuenta?.toLowerCase() === "activa" ? "Inactiva" : "Activa";
    try {
      await empresasService.modificarEmpresa(empresa.id, { estado_cuenta: nuevoEstado });
      setEmpresas((prev) =>
        prev.map((e) => e.id === empresa.id ? { ...e, estado_cuenta: nuevoEstado } : e)
      );
      toast.success(`Empresa ${nuevoEstado === "Activa" ? "activada" : "desactivada"}.`);
    } catch {
      toast.error("No se pudo cambiar el estado.");
    }
  };

  const handleEliminar = async (empresa) => {
    if (!window.confirm(`¿Eliminar "${empresa.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await empresasService.eliminarEmpresa(empresa.id);
      setEmpresas((prev) => prev.filter((e) => e.id !== empresa.id));
      toast.success("Empresa eliminada.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo eliminar la empresa.");
    }
  };

  const empresasFiltradas = empresas
    .filter((e) => e?.id) // Filtrar empresas sin ID válido
    .filter((e) => {
      const q = busqueda.toLowerCase();
      return (
        (e.nombre ?? "").toLowerCase().includes(q) ||
        (e.rut_empresa ?? "").toLowerCase().includes(q) ||
        (e.tipo_empresa ?? "").toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Empresas</h1>
          <p className="mt-2 text-slate-500">Gestiona todas las empresas registradas en PIVOT.</p>
        </div>
        <button
          onClick={() => setModalCrear(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all"
        >
          <Plus size={16} /> Nueva Empresa
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">

        {/* Buscador */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o rubro..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rubro</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registro</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 size={24} className="animate-spin mx-auto text-slate-400" />
                  </td>
                </tr>
              ) : empresasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Building2 size={32} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400 font-medium text-sm">
                      {busqueda ? `Sin resultados para "${busqueda}"` : "No hay empresas registradas."}
                    </p>
                  </td>
                </tr>
              ) : (
                empresasFiltradas.map((empresa) => {
                  const activa = empresa.estado_cuenta?.toLowerCase() === "activa";
                  return (
                    <tr key={empresa.id ?? empresa.tenant_id ?? Math.random()} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {(empresa.nombre ?? "?")[0].toUpperCase()}
                          </div>
                          <p className="font-semibold text-slate-900">{empresa.nombre}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{empresa.rut_empresa || "—"}</td>
                      <td className="px-6 py-4 text-slate-500">{empresa.tipo_empresa || "—"}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {empresa.fecha_registro
                          ? new Date(empresa.fecha_registro).toLocaleDateString("es-CL")
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          activa
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-600 border-rose-200"
                        }`}>
                          {activa ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Ver detalle */}
                          <Link
                            to={`/superadmin/empresas/${empresa.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Ver detalle"
                          >
                            <Eye size={16} />
                          </Link>

                          {/* Activar / Desactivar */}
                          <button
                            onClick={() => handleToggleEstado(empresa)}
                            title={activa ? "Desactivar" : "Activar"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              activa
                                ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {activa ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => handleEliminar(empresa)}
                            title="Eliminar empresa"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && empresasFiltradas.length > 0 && (
          <div className="px-6 py-3.5 border-t border-slate-100 text-xs font-medium text-slate-500 bg-slate-50/30">
            {empresasFiltradas.length} empresa{empresasFiltradas.length !== 1 ? "s" : ""}
            {busqueda && ` para "${busqueda}"`}
          </div>
        )}
      </div>

      {/* Modal crear empresa */}
      {modalCrear && (
        <ModalCrearEmpresa
          onClose={() => setModalCrear(false)}
          onCreada={(nueva) => {
            setEmpresas((prev) => [nueva, ...prev]);
            setModalCrear(false);
          }}
        />
      )}
    </div>
  );
}