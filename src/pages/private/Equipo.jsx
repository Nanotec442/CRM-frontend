import { useState, useEffect } from "react";
import { Users, Plus, Search, ArrowLeft, Mail, Phone, Lock, User as UserIcon, Shield, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import empresasService from "../../services/empresasService";
import rolesService from "../../services/rolesService";

/**
 * @component Equipo
 * @description Módulo para gestionar los subusuarios del Tenant.
 * Usa POST /empresas/ (crearSubusuario) con role_id obligatorio.
 */
function Equipo() {
  const [vistaActual, setVistaActual] = useState("lista");

  // Datos de la lista
  const [equipo, setEquipo] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Roles disponibles para el selector
  const [roles, setRoles] = useState([]);
  const [cargandoRoles, setCargandoRoles] = useState(false);

  // Formulario — campos exactos de UsuarioSubCreate
  const [formData, setFormData] = useState({
    nombre_completo: "",
    email: "",
    telefono: "",
    password: "",
    role_id: "",
  });
  const [guardando, setGuardando] = useState(false);

  // Carga la lista cuando volvemos a la vista de lista
  useEffect(() => {
    if (vistaActual === "lista") obtenerEquipo();
  }, [vistaActual]);

  // Carga roles cuando abre el formulario
  useEffect(() => {
    obtenerRoles();
  }, [vistaActual]);

  const obtenerEquipo = async () => {
    setCargandoLista(true);
    try {
      const data = await empresasService.listarSubusuarios();
      setEquipo(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("No se pudo cargar la lista del equipo.");
      }
      setEquipo([]);
    } finally {
      setCargandoLista(false);
    }
  };

  const obtenerRoles = async () => {
    setCargandoRoles(true);
    try {
      const data = await rolesService.listar();
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      toast.error("No se pudieron cargar los roles disponibles.");
    } finally {
      setCargandoRoles(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role_id) {
      toast.error("Debes seleccionar un rol para el empleado.");
      return;
    }

    setGuardando(true);
    try {
      // Dividimos nombre_completo en nombre + apellido (requerido por UsuarioSubCreate)
      const partes = formData.nombre_completo.trim().split(" ");
      const nombre = partes[0] || "";
      const apellido = partes.slice(1).join(" ") || " ";

      const payload = {
        nombre,
        apellido,
        email: formData.email,
        telefono: formData.telefono || undefined,
        password: formData.password,
        role_id: formData.role_id, // UUID — obligatorio en el backend
      };

      await empresasService.crearSubusuario(payload);

      toast.success("¡Empleado agregado a tu empresa con éxito!");
      setFormData({ nombre_completo: "", email: "", telefono: "", password: "", role_id: "" });
      setVistaActual("lista");
    } catch (err) {
      const errMsg = err.response?.data?.detail;
      toast.error(typeof errMsg === "string" ? errMsg : "Verifica los datos ingresados.");
    } finally {
      setGuardando(false);
    }
  };

  const equipoFiltrado = equipo.filter((m) =>
    `${m.nombre} ${m.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ── Vista: Formulario nuevo empleado ────────────────────────────────────
  if (vistaActual === "nuevo") {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-10">

        <button
          onClick={() => setVistaActual("lista")}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver a la lista del equipo
        </button>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm ring-1 ring-slate-200">
          <div className="mb-8 border-b border-slate-100 pb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Shield size={24} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Nuevo Empleado</h2>
              <p className="text-sm text-slate-500 font-medium">Asigna un nuevo usuario a tu organización.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Nombre Completo */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Nombre Completo
                </label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej. Ana Gómez"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="ana@tuempresa.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Teléfono <span className="text-slate-400 normal-case font-normal">(opcional)</span>
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+56 9..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Contraseña de acceso
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Selector de Rol — obligatorio en el backend */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Rol asignado <span className="text-red-400">*</span>
                </label>
                {cargandoRoles ? (
                  <div className="flex items-center gap-2 py-3 text-sm text-slate-400">
                    <Loader2 size={16} className="animate-spin" /> Cargando roles...
                  </div>
                ) : roles.length === 0 ? (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    No hay roles configurados. Ve a <strong>Configuración → Roles</strong> y crea uno primero.
                  </p>
                ) : (
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700"
                  >
                    <option value="" disabled>Selecciona un rol...</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>

            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={guardando || roles.length === 0}
                className="bg-slate-900 text-white px-8 py-3.5 rounded-xl hover:bg-slate-800 transition-all font-bold text-sm shadow-md active:scale-[0.98] flex items-center gap-2 disabled:opacity-70 group"
              >
                {guardando && <Loader2 size={16} className="animate-spin" />}
                {guardando ? "Guardando..." : "Crear Empleado"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── Vista: Lista del equipo ──────────────────────────────────────────────
  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-500">

      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Equipo</h1>
          <p className="mt-2 text-slate-600">Administra los accesos y permisos de tu personal en PIVOT.</p>
        </div>
        <button
          onClick={() => setVistaActual("nuevo")}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:bg-indigo-700 transition-colors active:scale-95"
        >
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </section>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">

        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4 hidden sm:table-cell">Contacto</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargandoLista ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 size={24} className="mx-auto animate-spin mb-2" />
                    Cargando equipo...
                  </td>
                </tr>
              ) : equipoFiltrado.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <Users size={40} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500 font-medium">No hay usuarios para mostrar.</p>
                    {busqueda === "" && (
                      <p className="text-xs text-slate-400 mt-1">
                        Haz clic en "Nuevo Usuario" para agregar a tu primer empleado.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                equipoFiltrado.map((miembro) => (
                  <tr key={miembro.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          {miembro.nombre?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{miembro.nombre} {miembro.apellido}</p>
                          <p className="text-[11px] text-slate-500 sm:hidden">{miembro.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <p className="text-slate-900 font-medium">{miembro.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{miembro.telefono || "Sin teléfono"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                        {miembro.is_superadmin 
                        ? "Propietario" 
                        : roles.find((r) => r.id === miembro.role_id)?.nombre ?? "Sin rol"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        miembro.estado === "Activo"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${miembro.estado === "Activo" ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {miembro.estado || "Activo"}
                      </span>
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

export default Equipo;