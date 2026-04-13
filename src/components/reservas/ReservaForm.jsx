import { useEffect, useState } from "react";
import { reservasService } from "../../services/reservasService";
import { clientesService } from "../../services/clientesService";
import { useActivo } from "../../hooks/useActivo";

const ReservaForm = ({ onSuccess }) => {
  const { activos, loading: loadingActivos, fetchActivos } = useActivo();
  
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // Ahora el estado maneja inicio y fin de forma independiente
  const [form, setForm] = useState({
    cliente_id: "",
    activo_id: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  useEffect(() => {
    cargarClientes();
    if (activos.length === 0) fetchActivos();
  }, []);

  const cargarClientes = async () => {
    setLoadingClientes(true);
    try {
      const data = await clientesService.listar();
      // Prevención por si la API devuelve un objeto en lugar del arreglo directo
      const dataReal = Array.isArray(data) ? data : (data.clientes || []);
      setClientes(dataReal);
    } catch (error) {
      console.error("Error cargando clientes", error);
    } finally {
      setLoadingClientes(false);
    }
  };

  // Función para calcular X horas después de una fecha
  const calcularFechaFin = (fechaIsoString, horas = 1) => {
    if (!fechaIsoString) return "";
    const date = new Date(fechaIsoString);
    date.setHours(date.getHours() + horas);
    // Para que el input type="datetime-local" lo lea bien, hay que quitarle la 'Z' del final 
    // y dejarlo en formato YYYY-MM-DDTHH:mm
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const handleInicioChange = (e) => {
    const nuevaFechaInicio = e.target.value;
    setForm({
      ...form,
      fecha_inicio: nuevaFechaInicio,
      // Magia UX: Si cambio el inicio, el fin se auto-ajusta a 1 hora después por comodidad
      fecha_fin: calcularFechaFin(nuevaFechaInicio, 1),
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!form.cliente_id) return alert("Por favor, selecciona un cliente.");
      if (!form.activo_id) return alert("Por favor, selecciona un activo.");
      if (!form.fecha_inicio || !form.fecha_fin) return alert("Por favor, selecciona las fechas.");

      const inicio = new Date(form.fecha_inicio);
      const fin = new Date(form.fecha_fin);

      if (fin <= inicio) {
        return alert("Error: La fecha de fin debe ser posterior a la de inicio.");
      }
      
      const payload = {
        cliente_id: form.cliente_id,
        activo_id: form.activo_id,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
      };

      await reservasService.crear(payload);

      // Limpiamos el formulario
      setForm({
        cliente_id: "",
        activo_id: "",
        fecha_inicio: "",
        fecha_fin: "",
      });

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Error backend:", error.response?.data);
      const errorMsg = error.response?.data?.detail || "Error creando reserva";
      alert(`Error: ${errorMsg}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full"
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">
          📅
        </span>
        <h2 className="text-xl font-bold text-slate-800">Nueva Reserva</h2>
      </div>

      {/* CLIENTE */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Cliente
        </label>
        <select
          name="cliente_id"
          value={form.cliente_id}
          onChange={handleChange}
          required
          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 hover:bg-white transition-all outline-none text-sm text-slate-700"
        >
          <option value="">
            {loadingClientes ? "Cargando clientes..." : "Seleccionar cliente"}
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre_completo || c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* ACTIVO */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Activo / Recurso
        </label>
        <select
          name="activo_id"
          value={form.activo_id}
          onChange={handleChange}
          required
          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 hover:bg-white transition-all outline-none text-sm text-slate-700"
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

      {/* RANGO DE FECHAS (Lado a lado) */}
      <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
            Inicio
          </label>
          <input
            type="datetime-local"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleInicioChange}
            required
            className="w-full p-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-700 outline-none transition-all cursor-pointer bg-white"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
            Fin
          </label>
          <input
            type="datetime-local"
            name="fecha_fin"
            value={form.fecha_fin}
            onChange={handleChange}
            required
            // Evitamos que elijan una fecha de fin menor a la de inicio en el calendario
            min={form.fecha_inicio} 
            className="w-full p-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-700 outline-none transition-all cursor-pointer bg-white"
          />
        </div>
      </div>

      {/* BOTÓN */}
      <button
        type="submit"
        className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-transform hover:-translate-y-0.5 shadow-md cursor-pointer"
      >
        Confirmar Reserva
      </button>
    </form>
  );
};

export default ReservaForm;