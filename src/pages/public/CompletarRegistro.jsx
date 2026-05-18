import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Fingerprint, Globe, MapPin, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../../components/layout/Navbar";
import empresasService from "../../services/empresasService";

function CompletarRegistro() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_empresa: "",
    rut_empresa: "",
    sub_dominio: "",
    direccion: "",
    tipo_empresa: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await empresasService.completarRegistro(formData);
      // Reemplazar token por el nuevo que ya tiene tenant_id
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("tenant_id", data.tenant_id);
      toast.success("¡Empresa configurada! Bienvenido a PIVOT.");
      navigate("/panel");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al configurar la empresa.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-xl rounded-3xl bg-white p-8 sm:p-10 shadow-xl border border-slate-100">
          
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
              <Building2 size={28} strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Un último paso</h1>
            <p className="mt-2 text-sm text-slate-500">Configura tu empresa para acceder al panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nombre de la Empresa</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input type="text" name="nombre_empresa" value={formData.nombre_empresa} onChange={handleChange} placeholder="PIVOT Corp" required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">RUT Empresa</label>
              <div className="relative group">
                <Fingerprint className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input type="text" name="rut_empresa" value={formData.rut_empresa} onChange={handleChange} placeholder="76.123.456-7" required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Rubro / Tipo</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input type="text" name="tipo_empresa" value={formData.tipo_empresa} onChange={handleChange} placeholder="Tecnología, Inmobiliaria..." required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Subdominio</label>
              <div className="relative group">
                <Globe className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input type="text" name="sub_dominio" value={formData.sub_dominio} onChange={handleChange} placeholder="miempresa (sin espacios)" required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Dirección Comercial</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Av. Providencia 1234" required className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" />Configurando...</>
              ) : (
                <>Acceder al Panel <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CompletarRegistro;