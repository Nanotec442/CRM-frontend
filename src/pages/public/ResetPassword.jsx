import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowRight, Loader2, CheckCircle, ShieldAlert } from "lucide-react";
import { resetPassword } from "../../services/authService"; // Ajusta la ruta

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extrae el ?token=... de la URL

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  // Si alguien entra a la página sin un token en la URL, le avisamos
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Enlace inválido o expirado. Falta el token de seguridad.");
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (status === "error" && token) setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación en el frontend antes de enviar
    if (formData.password !== formData.confirmPassword) {
      setStatus("error");
      setMessage("Las contraseñas no coinciden. Inténtalo de nuevo.");
      return;
    }

    if (formData.password.length < 8) {
      setStatus("error");
      setMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      // Enviamos el token y la nueva contraseña al backend
      await resetPassword({
        token: token,
        new_password: formData.password
      });
      
      setStatus("success");
      setMessage("¡Tu contraseña ha sido actualizada con éxito!");
      
      // Redirigimos al login después de 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.detail || "Ocurrió un error al actualizar la contraseña.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Crear nueva contraseña</h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Ingresa tu nueva contraseña a continuación. Asegúrate de que sea segura.
            </p>
          </div>

          {/* Pantalla de Éxito */}
          {status === "success" ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 text-center animate-in slide-in-from-bottom-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} />
              </div>
              <p className="text-sm font-medium text-emerald-800 mb-2">{message}</p>
              <p className="text-xs text-emerald-600">Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            /* Formulario normal */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Input: Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Nueva Contraseña
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    required
                    disabled={!token}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Input: Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Confirmar Contraseña
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repite la contraseña"
                    required
                    disabled={!token}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={status === "loading" || !token || !formData.password || !formData.confirmPassword}
                className="w-full mt-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    Guardar contraseña
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
          
          {/* Botón Volver al Login (siempre visible como plan de escape) */}
          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Volver al inicio de sesión
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}

export default ResetPassword;