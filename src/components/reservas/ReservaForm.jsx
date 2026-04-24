import { useEffect, useState } from "react";
import { reservasService } from "../../services/reservasService";
import { clientesService } from "../../services/clientesService";
import { useActivo } from "../../hooks/useActivo";

/**
 * Formulario de creación de reservas.
 * Implementa lógica de auto-ajuste de tiempo (UX) y normalización de fechas para datetime-local.
 */
const ReservaForm = ({ onSuccess }) => {
  const { activos, loading: loadingActivos, fetchActivos } = useActivo();
  
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

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
      const dataReal = Array.isArray(data) ? data : (data.clientes || []);
      setClientes(dataReal);
    } catch (error) {
      console.error("Error cargando clientes", error);
    } finally {
      setLoadingClientes(false);
    }
  };

  /**
   * Calcula una fecha de finalización sugerida (1 hora después) para mejorar la UX.
   */
  const calcularFechaFin = (fechaIsoString, horas = 1) => {
    if (!fechaIsoString) return "";
    const date = new Date(fechaIsoString);
    date.setHours(date.getHours() + horas);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const handleInicioChange = (e) => {
    const nuevaFechaInicio = e.target.value;
    setForm({
      ...form,
      fecha_inicio: nuevaFechaInicio,
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

      setForm({
        cliente_id: "",
        activo_id: "",
        fecha_inicio: "",
        fecha_fin: "",
      });

      if (onSuccess) onSuccess();

    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Error creando reserva";
      alert(`Error: ${errorMsg}`);
    }
  };

  const inputClasses = "mt-1.5 w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700";
  const labelClasses = "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Selector: Cliente */}
      <div>
        <label className={labelClasses}>Cliente Responsable</label>
        <select
          name="cliente_id"
          value={form.cliente_id}
          onChange={handleChange}
          required
          className={inputClasses}
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

      {/* Selector: Activo */}
      <div>
        <label className={labelClasses}>Activo / Recurso</label>
        <select
          name="activo_id"
          value={form.activo_id}
          onChange={handleChange}
          required
          className={inputClasses}
        >
          <option value="">
            {loadingActivos ? "Cargando activos..." : "Seleccionar recurso"}
          </option>
          {activos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Rango de Fechas Técnico */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div>
          <label className={labelClasses}>Inicio</label>
          <input
            type="datetime-local"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleInicioChange}
            required
            className={inputClasses}
          />
        </div>
        
        <div>
          <label className={labelClasses}>Término</label>
          <input
            type="datetime-local"
            name="fecha_fin"
            value={form.fecha_fin}
            onChange={handleChange}
            required
            min={form.fecha_inicio} 
            className={inputClasses}
          />
        </div>
      </div>

      {/* Acción Principal */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
        >
          Confirmar Reserva
        </button>
      </div>
    </form>
  );
};

export default ReservaForm;