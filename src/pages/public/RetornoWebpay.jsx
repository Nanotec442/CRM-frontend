import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function RetornoWebpay() {
  const navigate = useNavigate();

const estado = useMemo(() => {
  const params = new URLSearchParams(window.location.search);
  const tbkToken = params.get("TBK_TOKEN");
  const tokenWs = params.get("token_ws");
  const status = params.get("status");
  const error = params.get("error");

  if (tbkToken && !tokenWs) return "abortado";
  if (error || status === "rechazado") return "rechazado";
  if (status === "aprobado" || tokenWs) return "aprobado";
  return "cargando";
}, [])

  useEffect(() => {
    if (estado === "cargando") {
      navigate("/panel/reservas");
    }
  }, [estado, navigate]);

  const handleVolver = () => navigate("/panel/reservas");

  if (estado === "cargando") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Procesando resultado del pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        {estado === "aprobado" ? (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">¡Pago exitoso!</h1>
            <p className="text-slate-500 text-sm mb-8">
              Tu pago fue procesado correctamente. La reserva ha sido confirmada.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} className="text-rose-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {estado === "abortado" ? "Pago cancelado" : "Pago rechazado"}
            </h1>
            <p className="text-slate-500 text-sm mb-8">
              {estado === "abortado"
                ? "Abandonaste el proceso de pago. Puedes intentarlo nuevamente desde tus reservas."
                : "El pago no pudo ser procesado. Verifica los datos de tu tarjeta e intenta nuevamente."}
            </p>
          </>
        )}
        <button
          onClick={handleVolver}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
        >
          Volver a Reservas
        </button>
      </div>
    </div>
  );
}

export default RetornoWebpay;