import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Building2, MapPin, Globe, Fingerprint,
  Users, Mail, Phone, Loader2, Save, ToggleLeft, ToggleRight
} from "lucide-react";
import { toast } from "react-toastify";
import empresasService from "../../services/empresasService";

export default function EmpresaDetalle() {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  const [empresa, setEmpresa] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await empresasService.obtenerEmpresa(tenantId);
        setEmpresa(data);
        setForm({
          nombre: data.nombre ?? "",
          rut_empresa: data.rut_empresa ?? "",
          tipo_empresa: data.tipo_empresa ?? "",
          direccion: data.direccion ?? "",
          estado_cuenta: data.estado_cuenta ?? "Activa",
        });
        // Los usuarios vienen en data.usuarios si el backend los incluye
        setUsuarios(Array.isArray(data.usuarios) ? data.usuarios : []);
      } catch {
        toast.error("No se pudo cargar la empresa.");
        navigate("/superadmin/empresas");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [tenantId]);

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const actualizada = await empresasService.modificarEmpresa(tenantId, form);
      setEmpresa(actualizada);
      toast.success("Empresa actualizada correctamente.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al actualizar la empresa.");
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async () => {
    const nuevoEstado = empresa.estado_cuenta?.toLowerCase() === "activa" ? "Inactiva" : "Activa";
    try {
      await empresasService.modificarEmpresa(tenantId, { estado_cuenta: nuevoEstado });
      setEmpresa((prev) => ({ ...prev, estado_cuenta: nuevoEstado }));
      setForm((prev) => ({ ...prev, estado_cuenta: nuevoEstado }));
      toast.success(`Empresa ${nuevoEstado === "Activa" ? "activada" : "desactivada"}.`);
    } catch {
      toast.error("No se pudo cambiar el estado.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Cargando empresa...</p>
      </div>
    );
  }

  const activa = empresa?.estado_cuenta?.toLowerCase() === "activa";

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Botón volver */}
      <button
        onClick={() => navigate("/superadmin/empresas")}
        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver a Empresas
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white text-xl font-bold flex items-center justify-center shadow-sm">
            {(empresa?.nombre ?? "?")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{empresa?.nombre}</h1>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border mt-1 ${
              activa
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-600 border-rose-200"
            }`}>
              {activa ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>

        <button
          onClick={handleToggleEstado}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all ${
            activa
              ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          }`}
        >
          {activa ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          {activa ? "Desactivar" : "Activar"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Formulario de edición */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Building2 size={16} className="text-indigo-600" /> Datos de la Empresa
            </h2>
          </div>
          <div className="p-6 space-y-4">

            <Campo label="Nombre" icon={<Building2 size={16} />}>
              <input
                value={form.nombre ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              />
            </Campo>

            <Campo label="RUT Comercial" icon={<Fingerprint size={16} />}>
              <input
                value={form.rut_empresa ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, rut_empresa: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              />
            </Campo>

            <Campo label="Rubro" icon={<Globe size={16} />}>
              <input
                value={form.tipo_empresa ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, tipo_empresa: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              />
            </Campo>

            <Campo label="Dirección" icon={<MapPin size={16} />}>
              <input
                value={form.direccion ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              />
            </Campo>

            <div className="pt-2">
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-70"
              >
                {guardando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>

        {/* Usuarios de la empresa */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Users size={16} className="text-indigo-600" />
              Usuarios ({usuarios.length})
            </h2>
          </div>

          {usuarios.length === 0 ? (
            <div className="py-12 text-center">
              <Users size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">Sin usuarios registrados.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {usuarios.map((u) => {
                const nombre = `${u.nombre ?? ""} ${u.apellido ?? ""}`.trim() || u.email;
                const iniciales = nombre.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
                return (
                  <div key={u.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {iniciales}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{nombre}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {u.email && (
                          <span className="text-xs text-slate-400 flex items-center gap-1 truncate">
                            <Mail size={10} /> {u.email}
                          </span>
                        )}
                        {u.telefono && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone size={10} /> {u.telefono}
                          </span>
                        )}
                      </div>
                    </div>
                    {u.is_superadmin && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold shrink-0">
                        Admin
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Campo({ label, icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}