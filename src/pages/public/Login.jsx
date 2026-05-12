import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { login } from "../../services/authService";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await login(formData.email, formData.password);

      // Guardar token
      localStorage.setItem("token", data.access_token);

      // Decodificar JWT para obtener datos del usuario
      const payload = jwtDecode(data.access_token);

      // Guardar tenant_id si existe (no es obligatorio para superadmin)
      const tenantId = data.tenant_id ?? payload.tenant_id ?? null;
      if (tenantId) {
        localStorage.setItem("tenant_id", tenantId);
      } else {
        localStorage.removeItem("tenant_id");
      }

      localStorage.setItem("isAuth", "true");

      // Superadmin sin tenant → panel igualmente
      // Usuario normal sin tenant → error claro
      if (!tenantId && !payload.is_superadmin) {
        setError("Tu cuenta no tiene una organización asignada. Contacta al administrador.");
        localStorage.removeItem("token");
        localStorage.removeItem("isAuth");
        return;
      }

      // Superadmin → panel de administración global
      if (payload.is_superadmin) {
        navigate("/superadmin");
        return;
      }

      // Si había una reserva pendiente antes del login, redirigir a reservas
      const returnUrl = new URLSearchParams(window.location.search).get("returnUrl");
      navigate(returnUrl || "/panel");

    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Correo o contraseña incorrectos. Verifica tus datos.");
      } else {
        setError(err.message || "Ocurrió un error inesperado al conectar con el servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-105 rounded-3xl bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">

          <div className="mb-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 shadow-inner">
              <ShieldCheck size={28} strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido de vuelta</h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Ingresa tus credenciales para acceder a PIVOT
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@pivot-crm.com"
                  required
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-700 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Contraseña
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors pr-1"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm text-slate-700 font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 font-medium border border-rose-100 animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full mt-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Acceder al Panel
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}

export default Login;