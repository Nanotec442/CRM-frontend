import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { reservasService } from "../../services/reservasService";
import { clientesService } from "../../services/clientesService";
import { useActivo } from "../../hooks/useActivo";

/**
 * Formulario de creación de reservas.
 * Calcula el monto dinámicamente según precio_base × duración.
 */
const ReservaForm = ({ onSuccess }) => {
  const { activos, loading: loadingActivos, fetchActivos } = useActivo();

  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [montoCalculado, setMontoCalculado] = useState(null);

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

  const recalcularMonto = useCallback((activoId, fechaInicio, fechaFin) => {
    const activo = activos.find(a => a.id === activoId);
    if (!activo?.precio_base || !fechaInicio || !fechaFin) {
      setMontoCalculado(null);
      return null;
    }
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    if (fin <= inicio) { setMontoCalculado(null); return null; }
    const horas = (fin - inicio) / (1000 * 60 * 60);
    const monto = Math.round(Number(activo.precio_base) * horas);
    setMontoCalculado(monto);
    return monto;
  }, [activos]);

  const cargarClientes = async () => {
    setLoadingClientes(true);
    try {
      const data = await clientesService.listar();
      setClientes(Array.isArray(data) ? data : (data.clientes || []));
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
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const handleInicioChange = (e) => {
    const nuevaFechaInicio = e.target.value;
    const nuevaFechaFin = calcularFechaFin(nuevaFechaInicio, 1);
    setForm(prev => ({ ...prev, fecha_inicio: nuevaFechaInicio, fecha_fin: nuevaFechaFin }));
    recalcularMonto(form.activo_id, nuevaFechaInicio, nuevaFechaFin);
  };

  const handleFinChange = (e) => {
    const nuevaFechaFin = e.target.value;
    setForm(prev => ({ ...prev, fecha_fin: nuevaFechaFin }));
    recalcularMonto(form.activo_id, form.fecha_inicio, nuevaFechaFin);
  };

  const handleActivoChange = (e) => {
    const activoId = e.target.value;
    setForm(prev => ({ ...prev, activo_id: activoId, monto_total: "" }));
    recalcularMonto(activoId, form.fecha_inicio, form.fecha_fin);
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inicio = new Date(form.fecha_inicio);
    const fin = new Date(form.fecha_fin);
    if (fin <= inicio) { toast.error("La fecha de fin debe ser posterior a la de inicio."); return; }

    setGuardando(true);
    try {
      const montoFinal = form.monto_total ? Number(form.monto_total) : montoCalculado ?? null;
      await reservasService.crear({
        cliente_id: form.cliente_id,
        activo_id: form.activo_id,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        monto_total: montoFinal,
      });
      setForm({ cliente_id: "", activo_id: "", fecha_inicio: "", fecha_fin: "", monto_total: "" });
      setMontoCalculado(null);
      toast.success("Reserva creada correctamente.");
      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Error al crear la reserva.";
      toast.error(typeof errorMsg === "string" ? errorMsg : "Error al crear la reserva.");
    } finally {
      setGuardando(false);
    }
  };

  const inputClasses = "mt-1.5 w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700";
  const labelClasses = "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1";

  const activoSeleccionado = activos.find(a => a.id === form.activo_id);

  const duracionTexto = (() => {
    if (!form.fecha_inicio || !form.fecha_fin) return null;
    const inicio = new Date(form.fecha_inicio);
    const fin = new Date(form.fecha_fin);
    if (fin <= inicio) return null;
    const horas = (fin - inicio) / (1000 * 60 * 60);
    if (horas < 24) return `${horas % 1 === 0 ? horas : horas.toFixed(1)} hora${horas !== 1 ? "s" : ""}`;
    const dias = horas / 24;
    return `${dias % 1 === 0 ? dias : dias.toFixed(1)} día${dias !== 1 ? "s" : ""}`;
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Cliente */}
      <div>
        <label className={labelClasses}>Cliente Responsable</label>
        <select name="cliente_id" value={form.cliente_id} onChange={handleChange} required className={inputClasses}>
          <option value="">{loadingClientes ? "Cargando clientes..." : "Seleccionar cliente"}</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre_completo || c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Activo */}
      <div>
        <label className={labelClasses}>Activo / Recurso</label>
        <select name="activo_id" value={form.activo_id} onChange={handleActivoChange} required className={inputClasses}>
          <option value="">{loadingActivos ? "Cargando activos..." : "Seleccionar recurso"}</option>
          {activos.map(a => (
            <option key={a.id} value={a.id}>
              {a.nombre}{a.precio_base ? ` — $${Number(a.precio_base).toLocaleString("es-CL")}/hr` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div>
          <label className={labelClasses}>Inicio</label>
          <input type="datetime-local" name="fecha_inicio" value={form.fecha_inicio}
            onChange={handleInicioChange} required className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Término</label>
          <input type="datetime-local" name="fecha_fin" value={form.fecha_fin}
            onChange={handleFinChange} required min={form.fecha_inicio} className={inputClasses} />
        </div>
      </div>

      {/* Preview precio dinámico */}
      {activoSeleccionado?.precio_base && (
        <div className={`rounded-2xl p-4 border transition-all ${
          montoCalculado !== null ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {montoCalculado !== null ? "Monto estimado" : "Precio base"}
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                ${(montoCalculado ?? Number(activoSeleccionado.precio_base)).toLocaleString("es-CL")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">
                ${Number(activoSeleccionado.precio_base).toLocaleString("es-CL")} / hora
              </p>
              {duracionTexto && (
                <p className="text-xs font-bold text-emerald-700 mt-0.5">× {duracionTexto}</p>
              )}
            </div>
          </div>
          {montoCalculado !== null && (
            <p className="text-[10px] text-slate-400 mt-2">
              Calculado automáticamente. Puedes ajustarlo manualmente abajo si necesitas.
            </p>
          )}
        </div>
      )}

      {/* Monto manual (opcional) */}
      <div>
        <label className={labelClasses}>
          Monto Total (CLP)
          <span className="ml-1 normal-case font-normal text-slate-400">— opcional, sobreescribe el cálculo</span>
        </label>
        <div className="relative mt-1.5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
          <input type="number" name="monto_total" value={form.monto_total} onChange={handleChange}
            placeholder={montoCalculado !== null ? montoCalculado.toString() : "0"}
            min="0"
            className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700" />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button type="submit" disabled={guardando}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
          {guardando ? "Creando reserva..." : "Confirmar Reserva"}
        </button>
      </div>
    </form>
  );
};

export default ReservaForm;