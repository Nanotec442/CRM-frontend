import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { reservasService } from "../../services/reservasService";
import { clientesService } from "../../services/clientesService";
import { useActivo } from "../../hooks/useActivo";

/**
 * Formulario de creación de reservas.
 * Al seleccionar un activo, autocompleta el monto con su precio_base.
 */
const ReservaForm = ({ onSuccess }) => {
  const { activos, loading: loadingActivos, fetchActivos } = useActivo();

  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    cliente_id: "",
    activo_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    monto_total: "",
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

  const calcularFechaFin = (fechaIsoString, horas = 1) => {
    if (!fechaIsoString) return "";
    const date = new Date(fechaIsoString);
    date.setHours(date.getHours() + horas);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const handleInicioChange = (e) => {
    const nuevaFechaInicio = e.target.value;
    setForm((prev) => ({
      ...prev,
      fecha_inicio: nuevaFechaInicio,
      fecha_fin: calcularFechaFin(nuevaFechaInicio, 1),
    }));
  };

  const handleActivoChange = (e) => {
    const activoId = e.target.value;
    const activoSeleccionado = activos.find((a) => a.id === activoId);

    setForm((prev) => ({
      ...prev,
      activo_id: activoId,
      // Autocompletar con precio_base del activo si existe
      monto_total: activoSeleccionado?.precio_base
        ? String(Math.round(Number(activoSeleccionado.precio_base)))
        : prev.monto_total,
    }));
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const inicio = new Date(form.fecha_inicio);
    const fin = new Date(form.fecha_fin);

    if (fin <= inicio) {
      toast.error("La fecha de fin debe ser posterior a la de inicio.");
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        cliente_id: form.cliente_id,
        activo_id: form.activo_id,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        monto_total: form.monto_total ? Number(form.monto_total) : null,
      };

      await reservasService.crear(payload);

      setForm({
        cliente_id: "",
        activo_id: "",
        fecha_inicio: "",
        fecha_fin: "",
        monto_total: "",
      });

      toast.success("Reserva creada correctamente.");
      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Error al crear la reserva.";
      toast.error(typeof errorMsg === "string" ? errorMsg : "Error al crear la reserva.");
    } finally {
      setGuardando(false);
    }
  };

  const inputClasses =
    "mt-1.5 w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700";
  const labelClasses =
    "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1";

  // Activo seleccionado para mostrar info de precio
  const activoSeleccionado = activos.find((a) => a.id === form.activo_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Cliente */}
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

      {/* Activo */}
      <div>
        <label className={labelClasses}>Activo / Recurso</label>
        <select
          name="activo_id"
          value={form.activo_id}
          onChange={handleActivoChange}
          required
          className={inputClasses}
        >
          <option value="">
            {loadingActivos ? "Cargando activos..." : "Seleccionar recurso"}
          </option>
          {activos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
              {a.precio_base ? ` — $${Number(a.precio_base).toLocaleString("es-CL")}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Monto */}
      <div>
        <label className={labelClasses}>
          Monto Total (CLP)
          {activoSeleccionado?.precio_base && (
            <span className="ml-2 text-indigo-500 normal-case font-medium">
              Precio base: ${Number(activoSeleccionado.precio_base).toLocaleString("es-CL")}
            </span>
          )}
        </label>
        <div className="relative mt-1.5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
            $
          </span>
          <input
            type="number"
            name="monto_total"
            value={form.monto_total}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700"
          />
        </div>
        <p className="text-[10px] text-slate-400 ml-1 mt-1">
          Se autocompleta con el precio base del activo. Puedes ajustarlo.
        </p>
      </div>

      {/* Fechas */}
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

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
        >
          {guardando ? "Creando reserva..." : "Confirmar Reserva"}
        </button>
      </div>
    </form>
  );
};

export default ReservaForm;