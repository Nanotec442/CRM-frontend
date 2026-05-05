import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Shield, Pencil, Trash2, X, Check, Loader2, Plus } from "lucide-react";
import rolesService from "../../services/rolesService";

// ── Permisos exactos definidos en el backend (PermisosTenant) ─────────────────
const GRUPOS_PERMISOS = [
  {
    grupo: "CRM y Clientes",
    permisos: [
      { id: "leer_clientes",    label: "Ver Clientes" },
      { id: "crear_clientes",   label: "Crear / Editar Clientes" },
      { id: "editar_clientes",  label: "Modificar Clientes" },
      { id: "borrar_clientes",  label: "Eliminar / Archivar Clientes" },
      { id: "responder_chats",  label: "Responder Chats" },
      { id: "leer_chats",       label: "Ver Historial de Chats" },
    ],
  },
  {
    grupo: "Motor de Reservas",
    permisos: [
      { id: "leer_reservas",     label: "Ver Reservas" },
      { id: "crear_reservas",    label: "Crear Reservas" },
      { id: "editar_reservas",   label: "Modificar Reservas" },
      { id: "cancelar_reservas", label: "Cancelar Reservas" },
    ],
  },
  {
    grupo: "Activos",
    permisos: [
      { id: "leer_activos",      label: "Ver Activos" },
      { id: "crear_activo",      label: "Crear Activos" },
      { id: "editar_activo",     label: "Editar Activos" },
      { id: "desactivar_activo", label: "Desactivar Activos" },
    ],
  },
  {
    grupo: "Tablero Kanban",
    permisos: [
      { id: "leer_tablero",   label: "Ver Tablero" },
      { id: "crear_tarjeta",  label: "Crear Tarjetas" },
      { id: "mover_tarjetas", label: "Mover Tarjetas" },
    ],
  },
  {
    grupo: "Documentos",
    permisos: [
      { id: "leer_documentos",      label: "Ver Documentos" },
      { id: "generar_documentos",   label: "Generar Contratos" },
      { id: "firmar_documentos",    label: "Firmar Documentos" },
    ],
  },
  {
    grupo: "Administración",
    permisos: [
      { id: "administrar_roles",    label: "Gestionar Roles (Peligro)" },
      { id: "administrar_usuarios", label: "Gestionar Equipo" },
      { id: "administrar_empresa",  label: "Configurar Empresa" },
    ],
  },
];

const PERMISOS_PLANOS = GRUPOS_PERMISOS.flatMap((g) => g.permisos);

// Convierte un objeto de permisos {clave: bool} a un Set de claves activas
const permisosASet = (permisos = {}) =>
  new Set(Object.entries(permisos).filter(([, v]) => v).map(([k]) => k));

// Convierte un Set de claves a objeto {clave: true}
const setAPermisos = (set) =>
  Object.fromEntries([...set].map((k) => [k, true]));

// ── Componente principal ───────────────────────────────────────────────────────
const RolesConfig = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Formulario de creación
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [permisosNuevo, setPermisosNuevo] = useState(new Set());

  // Edición inline
  const [editando, setEditando] = useState(null); // { id, nombre, permisos: Set }

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      setLoading(true);
      const data = await rolesService.listar();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("No se pudieron cargar los roles.");
    } finally {
      setLoading(false);
    }
  };

  // ── Crear ────────────────────────────────────────────────────────────────────
  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nombreNuevo.trim()) {
      toast.error("El nombre del rol es obligatorio.");
      return;
    }
    setGuardando(true);
    try {
      const nuevo = await rolesService.crear({
        nombre: nombreNuevo.trim(),
        permisos: setAPermisos(permisosNuevo),
      });
      setRoles((prev) => [...prev, nuevo]);
      setNombreNuevo("");
      setPermisosNuevo(new Set());
      toast.success(`Rol "${nuevo.nombre}" creado correctamente.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al crear el rol.");
    } finally {
      setGuardando(false);
    }
  };

  // ── Editar ───────────────────────────────────────────────────────────────────
  const iniciarEdicion = (rol) => {
    setEditando({
      id: rol.id,
      nombre: rol.nombre,
      permisos: permisosASet(rol.permisos),
    });
  };

  const handleGuardarEdicion = async () => {
    if (!editando.nombre.trim()) {
      toast.error("El nombre del rol es obligatorio.");
      return;
    }
    setGuardando(true);
    try {
      const actualizado = await rolesService.modificar(editando.id, {
        nombre: editando.nombre.trim(),
        permisos: setAPermisos(editando.permisos),
      });
      setRoles((prev) =>
        prev.map((r) => (r.id === editando.id ? actualizado : r))
      );
      setEditando(null);
      toast.success(`Rol "${actualizado.nombre}" actualizado.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al actualizar el rol.");
    } finally {
      setGuardando(false);
    }
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────────
  const handleEliminar = async (rol) => {
    if (!window.confirm(`¿Eliminar el rol "${rol.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await rolesService.eliminar(rol.id);
      setRoles((prev) => prev.filter((r) => r.id !== rol.id));
      toast.success(`Rol "${rol.nombre}" eliminado.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se puede eliminar este rol.");
    }
  };

  // ── Toggle permisos ──────────────────────────────────────────────────────────
  const togglePermisoNuevo = (id) => {
    setPermisosNuevo((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePermisoEdicion = (id) => {
    setEditando((prev) => {
      const next = new Set(prev.permisos);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ...prev, permisos: next };
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Shield size={20} className="text-indigo-600" />
          Gestión de Roles y Permisos
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Crea perfiles de acceso para los miembros de tu equipo. Los permisos deben coincidir con los módulos que usarán.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

        {/* ── Formulario de creación ── */}
        <div className="xl:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-indigo-600" />
            Crear Nuevo Rol
          </h3>

          <form onSubmit={handleCrear} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Nombre del Rol
              </label>
              <input
                type="text"
                placeholder="Ej. Vendedor, Recepcionista..."
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all bg-white"
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Permisos de Acceso
              </label>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {GRUPOS_PERMISOS.map((grupo) => (
                  <div key={grupo.grupo}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      {grupo.grupo}
                    </p>
                    <div className="space-y-1">
                      {grupo.permisos.map((permiso) => (
                        <label
                          key={permiso.id}
                          className="flex items-center gap-2.5 cursor-pointer p-1.5 hover:bg-slate-200/50 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                            checked={permisosNuevo.has(permiso.id)}
                            onChange={() => togglePermisoNuevo(permiso.id)}
                          />
                          <span className="text-sm text-slate-700 select-none">{permiso.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {guardando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {guardando ? "Guardando..." : "Crear Rol"}
            </button>
          </form>
        </div>

        {/* ── Tabla de roles ── */}
        <div className="xl:col-span-2 border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Permisos Activos</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-5 py-10 text-center text-slate-400">
                    <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                    Cargando roles...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-5 py-10 text-center text-slate-400">
                    Aún no has creado roles para tu equipo.
                  </td>
                </tr>
              ) : (
                roles.map((rol) =>
                  editando?.id === rol.id ? (
                    // ── Fila en modo edición ──
                    <tr key={rol.id} className="bg-indigo-50/30">
                      <td className="px-5 py-4" colSpan="3">
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editando.nombre}
                            onChange={(e) => setEditando((prev) => ({ ...prev, nombre: e.target.value }))}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium bg-white"
                            autoFocus
                          />

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                            {GRUPOS_PERMISOS.map((grupo) => (
                              <div key={grupo.grupo}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                  {grupo.grupo}
                                </p>
                                {grupo.permisos.map((permiso) => (
                                  <label
                                    key={permiso.id}
                                    className="flex items-center gap-2 cursor-pointer py-0.5"
                                  >
                                    <input
                                      type="checkbox"
                                      className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300"
                                      checked={editando.permisos.has(permiso.id)}
                                      onChange={() => togglePermisoEdicion(permiso.id)}
                                    />
                                    <span className="text-xs text-slate-700 select-none">{permiso.label}</span>
                                  </label>
                                ))}
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={handleGuardarEdicion}
                              disabled={guardando}
                              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
                            >
                              {guardando ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                              Guardar cambios
                            </button>
                            <button
                              onClick={() => setEditando(null)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-600 text-sm font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
                            >
                              <X size={14} />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // ── Fila normal ──
                    <tr key={rol.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">
                        {rol.nombre}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(rol.permisos || {})
                            .filter(([, activo]) => activo)
                            .map(([clave]) => {
                              const label = PERMISOS_PLANOS.find((p) => p.id === clave)?.label ?? clave;
                              return (
                                <span
                                  key={clave}
                                  className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium border border-slate-200"
                                >
                                  {label}
                                </span>
                              );
                            })}
                          {Object.values(rol.permisos || {}).every((v) => !v) && (
                            <span className="text-xs text-slate-400">Sin permisos</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => iniciarEdicion(rol)}
                            title="Editar rol"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleEliminar(rol)}
                            title="Eliminar rol"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolesConfig;