import { useState, useEffect } from "react";
import rolesService from "../../services/rolesService"; // Ajusta la ruta a tu servicio de roles

const PERMISOS_DISPONIBLES = [
  { id: "administrar_roles", label: "Administrar Roles (Peligro)" },
  { id: "ver_clientes", label: "Ver Clientes" },
  { id: "crear_clientes", label: "Crear/Editar Clientes" },
  { id: "eliminar_clientes", label: "Eliminar Clientes" },
  { id: "ver_reservas", label: "Ver Reservas" },
  { id: "crear_reservas", label: "Crear/Editar Reservas" },
];

const RolesConfig = () => {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [errorRoles, setErrorRoles] = useState(null);

  const [nombreRol, setNombreRol] = useState("");
  const [permisosSeleccionados, setPermisosSeleccionados] = useState({});

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      setLoadingRoles(true);
      const data = await rolesService.listar();
      setRoles(data);
    } catch (err) {
      setErrorRoles("No se pudieron cargar los roles.");
      console.error(err);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleTogglePermiso = (idPermiso) => {
    setPermisosSeleccionados((prev) => ({
      ...prev,
      [idPermiso]: !prev[idPermiso],
    }));
  };

  const handleCrearRol = async (e) => {
    e.preventDefault();
    if (!nombreRol.trim()) return alert("El nombre del rol es obligatorio");

    try {
      const nuevoRol = await rolesService.crear({
        nombre: nombreRol,
        permisos: permisosSeleccionados,
      });

      setRoles([...roles, nuevoRol]);
      setNombreRol("");
      setPermisosSeleccionados({});
      // Aquí podrías usar una librería de toasts si tienes una
      alert("¡Rol creado con éxito!"); 
    } catch (err) {
      alert(err.response?.data?.detail || "Error al crear el rol");
    }
  };

  const handleEliminarRol = async (idRol) => {
    if (!window.confirm("¿Seguro que deseas eliminar este rol?")) return;

    try {
      await rolesService.eliminar(idRol);
      setRoles(roles.filter((r) => r.id !== idRol));
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "No se puede eliminar este rol (puede tener usuarios asignados)."
      );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Gestión de Roles y Permisos</h2>
        <p className="text-sm text-slate-500 mt-1">Crea perfiles de acceso para los miembros de tu equipo.</p>
      </div>

      {errorRoles && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {errorRoles}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Formulario de Nuevo Rol */}
        <div className="xl:col-span-1">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 h-fit">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Crear Nuevo Perfil</h3>
            <form onSubmit={handleCrearRol}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre del Rol
                </label>
                <input
                  type="text"
                  placeholder="Ej. Vendedor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm transition-all"
                  value={nombreRol}
                  onChange={(e) => setNombreRol(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Permisos de Acceso
                </label>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {PERMISOS_DISPONIBLES.map((permiso) => (
                    <label key={permiso.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-200/50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                        checked={!!permisosSeleccionados[permiso.id]}
                        onChange={() => handleTogglePermiso(permiso.id)}
                      />
                      <span className="text-sm text-slate-700 select-none">{permiso.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                Guardar Perfil
              </button>
            </form>
          </div>
        </div>

        {/* Tabla de Roles */}
        <div className="xl:col-span-2">
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Permisos Activos</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loadingRoles ? (
                    <tr>
                      <td colSpan="3" className="px-5 py-8 text-center text-slate-500 font-medium">Cargando roles...</td>
                    </tr>
                  ) : roles.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-5 py-8 text-center text-slate-400">Aún no has creado roles para tu equipo.</td>
                    </tr>
                  ) : (
                    roles.map((rol) => (
                      <tr key={rol.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-slate-900">{rol.nombre}</td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(rol.permisos || {})
                              .filter(([_, activo]) => activo)
                              .map(([clave]) => (
                                <span key={clave} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md whitespace-nowrap font-medium border border-slate-200">
                                  {clave}
                                </span>
                              ))}
                            {Object.values(rol.permisos || {}).every(v => !v) && "Sin permisos"}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleEliminarRol(rol.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors px-2 py-1 rounded-md hover:bg-red-50"
                          >
                            Eliminar
                          </button>
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
    </div>
  );
};

export default RolesConfig;