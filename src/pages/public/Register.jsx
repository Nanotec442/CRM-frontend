import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Loader2, ArrowRight, Building2, MapPin, Briefcase, Globe, Fingerprint, Phone } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../../components/layout/Navbar";

// Usamos tu instancia centralizada de Axios
import api from "../../services/api";

/**
 * @component Register
 * @description Vista de registro público (Landing Page).
 * Crea el Tenant (Empresa) y el Usuario Administrador en un solo paso.
 */
function Register() {
  const navigate = useNavigate();

  // --- ESTADO COMPLETO ---
  // Reemplazamos "nombre" y "apellido" por "nombre_completo" para la UI
  const [formData, setFormData] = useState({
    nombre_empresa: "",
    rut_empresa: "",
    sub_dominio: "",
    direccion: "",
    tipo_empresa: "",
    nombre_completo: "", 
    email: "",
    password: "",
    telefono: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // --- MANEJADORES ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TRUCO: Dividimos el nombre completo para que el backend lo entienda
      const payload = { ...formData };
      const partesNombre = payload.nombre_completo.trim().split(" ");
      
      payload.nombre = partesNombre[0] || "";
      // Todo lo que siga del primer espacio será el apellido (por si tiene 2 nombres y 2 apellidos)
      payload.apellido = partesNombre.slice(1).join(" ") || " "; 
      
      // Borramos el campo "nombre_completo" porque el backend no lo reconoce
      delete payload.nombre_completo;

      // Petición POST al endpoint público definitivo
      await api.post("/empresas/registro-empresa", payload);

      toast.success("¡Empresa y cuenta creadas con éxito! Por favor, inicia sesión.");
      navigate("/login");

    } catch (err) {
      console.error("Error en registro:", err);
      
      if (err.response) {
        const errorMessage = err.response.data?.detail || "Error al crear la cuenta. Verifica los datos.";
        toast.error(typeof errorMessage === 'string' ? errorMessage : "Datos inválidos o duplicados.");
      } else {
        toast.error("Error de conexión. Revisa tu internet.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDERIZADO DE LA UI ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-3xl rounded-3xl bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Cabecera */}
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 shadow-inner">
              <Building2 size={28} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Crea tu espacio de trabajo</h1>
            <p className="mt-2 text-sm text-slate-500 font-medium max-w-md">
              Configura tu organización en PIVOT y obtén acceso total a las herramientas del CRM.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECCIÓN 1: DATOS DE LA EMPRESA */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Briefcase size={16} className="text-emerald-500" />
                1. Datos de la Empresa
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nombre Empresa */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nombre de la Empresa</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input type="text" name="nombre_empresa" value={formData.nombre_empresa} onChange={handleChange} placeholder="Ej. PIVOT Corp" required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium" />
                  </div>
                </div>

                {/* RUT Empresa */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">RUT Empresa</label>
                  <div className="relative group">
                    <Fingerprint className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input type="text" name="rut_empresa" value={formData.rut_empresa} onChange={handleChange} placeholder="76.123.456-7" required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium" />
                  </div>
                </div>

                {/* Tipo Empresa */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Rubro / Tipo</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input type="text" name="tipo_empresa" value={formData.tipo_empresa} onChange={handleChange} placeholder="Ej. Tecnología, Inmobiliaria..." required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium" />
                  </div>
                </div>

                {/* Sub Dominio */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Subdominio deseado</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input type="text" name="sub_dominio" value={formData.sub_dominio} onChange={handleChange} placeholder="miempresa (sin espacios)" required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium" />
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Dirección Comercial</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Av. Providencia 1234" required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: DATOS DEL ADMINISTRADOR */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2 uppercase tracking-widest mt-2">
                <User size={16} className="text-indigo-500" />
                2. Tu Perfil de Administrador
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Nombre Completo (Ocupa ambas columnas para mayor comodidad visual) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nombre Completo</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} placeholder="Ej. Juan Pérez" required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium" />
                  </div>
                </div>

                {/* Email y Teléfono */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Correo (Login)</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@empresa.com" required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Teléfono Móvil</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+56 9..." required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium" />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Contraseña Segura</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required minLength={6} className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium" />
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÓN Y FOOTER */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-slate-900 px-4 py-4 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Configurando espacio de trabajo...
                  </>
                ) : (
                  <>
                    Finalizar Registro
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600 font-medium">
                  ¿Ya tienes una cuenta registrada?{" "}
                  <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-colors">
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

export default Register;