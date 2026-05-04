import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle, ShieldAlert } from "lucide-react";
import { forgotPassword } from "../../services/authService"; // Ajusta la ruta si es necesario

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      // Llamamos al endpoint de tu backend a través del servicio
      await forgotPassword(email);
      
      setStatus("success");
      setMessage("Si el correo existe en nuestro sistema, te hemos enviado un enlace para restablecer tu contraseña.");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.detail || "Ocurrió un error al conectar con el servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Botón Volver */}
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8">
            <ArrowLeft size={16} />
            Volver al login
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recuperar acceso</h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Ingresa tu correo electrónico y te enviaremos las instrucciones para crear una nueva contraseña.
            </p>
          </div>

          {/* Pantalla de Éxito */}
          {status === "success" ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 text-center animate-in slide-in-from-bottom-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} />
              </div>
              <p className="text-sm font-medium text-emerald-800">{message}</p>
            </div>
          ) : (
            /* Formulario normal */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="admin@pivot-crm.com"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Alerta de Error */}
              {status === "error" && (
                <div className="flex items-start gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 font-medium border border-rose-100 animate-in slide-in-from-top-2">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                  <p>{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !email}
                className="w-full mt-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando enlace...
                  </>
                ) : (
                  "Enviar instrucciones"
                )}
              </button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;