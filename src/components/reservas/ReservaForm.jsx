import { useEffect, useState } from "react";
import { reservasService } from "../../services/reservasService";
import { clientesService } from "../../services/clientesService";
// Importamos tu hook ya creado en lugar del servicio directo
import { useActivo } from "../../hooks/useActivo";

const ReservaForm = ({ onSuccess }) => {
  // Usamos tu hook para gestionar activos
  const { activos, loading: loadingActivos, fetchActivos } = useActivo();
  
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [form, setForm] = useState({
    cliente_id: "",
    activo_id: "",
    fecha: "",
  });

  useEffect(() => {
    cargarClientes();
    // Si fetchActivos no se llama automáticamente en el useEffect de useActivo, lo llamamos aquí
    if (activos.length === 0) fetchActivos();
  }, []);

  const cargarClientes = async () => {
    setLoadingClientes(true);
    try {
      // Idealmente esto también debería estar en un custom hook (ej: useClientes)
      const data = await clientesService.listar();
      setClientes(data);
    } catch (error) {
      console.error("Error cargando clientes", error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Función mejorada para sumar minutos
  const sumarTiempo = (fechaIsoString, minutos = 60) => {
    const date = new Date(fechaIsoString);
    date.setMinutes(date.getMinutes() + minutos);
    return date.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!form.cliente_id) return alert("Por favor, selecciona un cliente.");
      if (!form.activo_id) return alert("Por favor, selecciona un activo.");
      if (!form.fecha) return alert("Por favor, selecciona una fecha.");

      // Formateo seguro para FastAPI
      const fechaInicio = new Date(form.fecha).toISOString();
      
      const payload = {
        cliente_id: form.cliente_id,
        activo_id: form.activo_id,
        fecha_inicio: fechaInicio,
        // Por defecto, reservamos por 1 hora (60 mins)
        fecha_fin: sumarTiempo(fechaInicio, 60),
      };

      await reservasService.crear(payload);

      // Limpiamos el formulario
      setForm({
        cliente_id: "",
        activo_id: "",
        fecha: "",
      });

      // Notificamos al componente padre (Reservas.jsx) para que recargue la lista
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Error backend:", error.response?.data);
      // Muestra el mensaje exacto del backend si existe (ej: "El horario ya está ocupado")
      const errorMsg = error.response?.data?.detail || "Error creando reserva";
      alert(`Error: ${errorMsg}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-md w-full"
    >
      <h2 className="text-xl font-bold mb-5 text-slate-800">Nueva Reserva</h2>

      {/* CLIENTE */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Cliente
        </label>
        <select
          name="cliente_id"
          value={form.cliente_id}
          onChange={handleChange}
          required
          className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate-500 focus:outline-none bg-white transition-all"
        >
          <option value="">
            {loadingClientes ? "Cargando clientes..." : "Seleccionar cliente"}
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre_completo}
            </option>
          ))}
        </select>
      </div>

      {/* ACTIVO */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Activo / Recurso
        </label>
        <select
          name="activo_id"
          value={form.activo_id}
          onChange={handleChange}
          required
          className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate-500 focus:outline-none bg-white transition-all"
        >
          <option value="">
            {loadingActivos ? "Cargando activos..." : "Seleccionar activo"}
          </option>
          {activos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* FECHA Y HORA */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Fecha y hora de inicio
        </label>
        <input
          type="datetime-local"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
          className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">
          * La reserva se creará por defecto con 1 hora de duración.
        </p>
      </div>

      {/* BOTÓN */}
      <button
        type="submit"
        className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
      >
        Crear Reserva
      </button>
    </form>
  );
};

export default ReservaForm;