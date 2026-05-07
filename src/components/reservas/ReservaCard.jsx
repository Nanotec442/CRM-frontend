import { useState } from "react";
import { toast } from "react-toastify";
import { Loader2, FileText, Pencil, X, Check } from "lucide-react";
import { pagosService } from "../../services/pagosService";
import { documentosService } from "../../services/documentosService";
import { reservasService } from "../../services/reservasService";

const ReservaCard = ({ reserva, onCancelar, onFirmar, onActualizar }) => {
  const [pagando, setPagando] = useState(false);
  const [generandoContrato, setGenerandoContrato] = useState(false);
  const [anulando, setAnulando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formEdit, setFormEdit] = useState({
    fecha_inicio: reserva.fecha_inicio?.slice(0, 16) ?? "",
    fecha_fin: reserva.fecha_fin?.slice(0, 16) ?? "",
    monto_total: reserva.monto_total ?? "",
  });

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });

  const formatearMonto = (monto) => {
    if (!monto) return null;
    return new Intl.NumberFormat("es-CL", {
      style: "currency", currency: "CLP", maximumFractionDigits: 0,
    }).format(Number(monto));
  };

  const getEstadoClasses = (estado) => {
    switch (estado?.toLowerCase()) {
      case "confirmada": return { border: "border-l-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" };
      case "cancelada":  return { border: "border-l-rose-500",    badge: "bg-rose-50 text-rose-700 border-rose-100" };
      default:           return { border: "border-l-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-100" };
    }
  };

  const estilos = getEstadoClasses(reserva.estado);
  const montoPendiente = reserva.monto_total && Number(reserva.monto_total) > 0;
  const estadoPago = reserva.estado_pago?.toLowerCase();
  const estadoReserva = reserva.estado?.toLowerCase();
  const puedePagar = montoPendiente && estadoPago !== "pagado" && estadoReserva !== "cancelada";
  const puedeEditar = estadoReserva !== "cancelada";
  const puedeAnularPago = estadoPago === "pagado";

  // ── Guardar edición ───────────────────────────────────────────────────────
  const handleGuardarEdicion = async () => {
    const inicio = new Date(formEdit.fecha_inicio);
    const fin = new Date(formEdit.fecha_fin);
    if (fin <= inicio) {
      toast.error("La fecha de fin debe ser posterior a la de inicio.");
      return;
    }
    setGuardando(true);
    try {
      const actualizado = await reservasService.actualizar(reserva.id, {
        fecha_inicio: formEdit.fecha_inicio,
        fecha_fin: formEdit.fecha_fin,
        monto_total: formEdit.monto_total ? Number(formEdit.monto_total) : null,
      });
      toast.success("Reserva actualizada correctamente.");
      setEditando(false);
      if (onActualizar) onActualizar(actualizado);
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo actualizar la reserva.");
    } finally {
      setGuardando(false);
    }
  };

  // ── Generar contrato ──────────────────────────────────────────────────────
  const handleGenerarContrato = async () => {
    setGenerandoContrato(true);
    try {
      await documentosService.generarContrato(reserva.id);
      toast.success("Contrato generado. Revísalo en Documentos.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo generar el contrato.");
    } finally {
      setGenerandoContrato(false);
    }
  };

  // ── Pagar ─────────────────────────────────────────────────────────────────
  const handlePagar = async () => {
    setPagando(true);
    try {
      const data = await pagosService.crear({ reserva_id: reserva.id });
      const urlPago = data.test_url || data.url;
      if (!urlPago) { toast.error("No se pudo obtener la URL de pago."); return; }
      window.location.href = urlPago;
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al iniciar el pago con Webpay.");
      setPagando(false);
    }
  };

  // ── Anular pago ───────────────────────────────────────────────────────────
  const handleAnularPago = async () => {
    if (!window.confirm("¿Anular el pago de esta reserva? Esta acción no se puede deshacer.")) return;
    if (!reserva.monto_total) {
      toast.error("No hay monto registrado para anular.");
      return;
    }
    setAnulando(true);
    try {
      // Obtenemos el token del pago via estado
      const estadoData = await pagosService.estado(reserva.token_pago);
      if (!estadoData) throw new Error("No se encontró el pago.");
      await pagosService.refund(reserva.token_pago, Number(reserva.monto_total));
      toast.success("Pago anulado correctamente.");
      if (onActualizar) onActualizar({ ...reserva, estado_pago: "Anulado" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo anular el pago. Verifica en Webpay.");
    } finally {
      setAnulando(false);
    }
  };

  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-[6px] ${estilos.border} transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-slate-300 group flex flex-col`}>

      {/* Cabecera */}
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight truncate group-hover:text-indigo-600 transition-colors">
            {reserva.cliente?.nombre_completo || "Cliente no asignado"}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-slate-500">
            <span className="text-xs">🏢</span>
            <span className="text-xs font-semibold uppercase tracking-wider">
              {reserva.activo?.nombre || "Sin activo"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${estilos.badge}`}>
            {reserva.estado || "Pendiente"}
          </span>
          {montoPendiente && (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
              estadoPago === "pagado"    ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
              estadoPago === "rechazado" ? "bg-rose-50 text-rose-700 border-rose-100" :
              estadoPago === "anulado"   ? "bg-slate-100 text-slate-500 border-slate-200" :
                                          "bg-slate-50 text-slate-600 border-slate-200"
            }`}>
              {estadoPago === "pagado"    ? "✓ Pagado"    :
               estadoPago === "rechazado" ? "✗ Rechazado" :
               estadoPago === "anulado"   ? "Anulado"     :
               formatearMonto(reserva.monto_total)}
            </span>
          )}
        </div>
      </div>

      {/* Fechas / Formulario edición */}
      {editando ? (
        <div className="space-y-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inicio</label>
            <input
              type="datetime-local"
              value={formEdit.fecha_inicio}
              onChange={(e) => setFormEdit((p) => ({ ...p, fecha_inicio: e.target.value }))}
              className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Término</label>
            <input
              type="datetime-local"
              value={formEdit.fecha_fin}
              min={formEdit.fecha_inicio}
              onChange={(e) => setFormEdit((p) => ({ ...p, fecha_fin: e.target.value }))}
              className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monto (CLP)</label>
            <input
              type="number"
              value={formEdit.monto_total}
              min="0"
              onChange={(e) => setFormEdit((p) => ({ ...p, monto_total: e.target.value }))}
              className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleGuardarEdicion}
              disabled={guardando}
              className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-70"
            >
              {guardando ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Guardar
            </button>
            <button
              onClick={() => setEditando(false)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-600 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              <X size={13} /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Inicio</p>
            <p className="text-sm font-bold text-slate-700">{formatearFecha(reserva.fecha_inicio)}</p>
          </div>
          <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Término</p>
            <p className="text-sm font-bold text-slate-700">{formatearFecha(reserva.fecha_fin)}</p>
          </div>
        </div>
      )}

      {/* Acciones */}
      {!editando && (
        <div className="flex flex-col gap-2 mt-auto">

          {/* Webpay */}
          {puedePagar && (
            <button
              onClick={handlePagar}
              disabled={pagando}
              className="w-full flex items-center justify-center gap-2 bg-[#e8001d] hover:bg-[#c0001a] disabled:opacity-70 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-100 active:scale-[0.97]"
            >
              {pagando ? (
                <><Loader2 size={14} className="animate-spin" /> Conectando...</>
              ) : (
                <>
                  <img src="https://www.transbank.cl/public/img/Logo_Webpay3-01.svg" alt="Webpay" className="h-4" onError={(e) => { e.target.style.display = "none"; }} />
                  Pagar con Webpay
                </>
              )}
            </button>
          )}

          {/* Anular pago */}
          {puedeAnularPago && (
            <button
              onClick={handleAnularPago}
              disabled={anulando}
              className="w-full flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-70 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.97]"
            >
              {anulando ? <Loader2 size={13} className="animate-spin" /> : "↩"}
              {anulando ? "Anulando..." : "Anular Pago"}
            </button>
          )}

          <div className="flex gap-2">
            {/* Contrato */}
            <button
              onClick={handleGenerarContrato}
              disabled={generandoContrato}
              className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
            >
              {generandoContrato
                ? <><Loader2 size={13} className="animate-spin" /> Generando...</>
                : <><FileText size={13} /> Contrato</>
              }
            </button>

            {/* Editar */}
            {puedeEditar && (
              <button
                onClick={() => setEditando(true)}
                title="Editar reserva"
                className="px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 py-2.5 rounded-xl transition-all active:scale-[0.97]"
              >
                <Pencil size={14} />
              </button>
            )}

            {/* Cancelar */}
            <button
              onClick={() => onCancelar(reserva.id)}
              disabled={estadoReserva === "cancelada"}
              className="px-4 bg-white hover:bg-rose-50 text-slate-300 hover:text-rose-600 py-2.5 rounded-xl font-bold text-sm transition-all border border-slate-200 hover:border-rose-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              title="Cancelar reserva"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservaCard;