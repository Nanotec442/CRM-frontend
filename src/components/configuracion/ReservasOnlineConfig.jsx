import { useState, useEffect } from "react";
import { Link2, Copy, Check, QrCode, ExternalLink, Save, Loader2, Globe } from "lucide-react";
import { toast } from "react-toastify";
import empresasService from "../../services/empresasService";

// Generador simple de QR usando API pública (no requiere librería)
const QR_API = (url) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

export default function ReservasOnlineConfig() {
  const [slug, setSlug] = useState("");
  const [slugActual, setSlugActual] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [copiado, setCopiadoLink] = useState(false);
  const [copiadoQR, setCopiadoQR] = useState(false);
  const [loading, setLoading] = useState(true);

  const tenantId = localStorage.getItem("tenant_id");
  const baseUrl = window.location.origin;

  // URL con slug (si existe) o con UUID
  const urlConSlug = slugActual
    ? `${baseUrl}/reservar/${slugActual}`
    : `${baseUrl}/reservar/${tenantId}`;

  const urlConUUID = `${baseUrl}/reservar/${tenantId}`;

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await empresasService.verMiEmpresa(tenantId);
        if (data?.slug) {
          setSlug(data.slug);
          setSlugActual(data.slug);
        }
      } catch {
        // Si no tiene slug, lo dejamos vacío
      } finally {
        setLoading(false);
      }
    };
    if (tenantId) cargar();
  }, [tenantId]);

  const validarSlug = (value) => {
    // Solo letras minúsculas, números y guiones
    return /^[a-z0-9-]*$/.test(value);
  };

  const handleSlugChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/\s+/g, "-");
    if (validarSlug(value)) setSlug(value);
  };

  const handleGuardarSlug = async () => {
    if (!slug.trim()) {
      toast.error("El slug no puede estar vacío.");
      return;
    }
    if (slug.length < 3) {
      toast.error("El slug debe tener al menos 3 caracteres.");
      return;
    }
    setGuardando(true);
    try {
      await empresasService.actualizarConfiguracionMiEmpresa({ slug: slug.trim() });
      setSlugActual(slug.trim());
      toast.success("URL personalizada guardada correctamente.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo guardar el slug. Puede estar en uso.");
    } finally {
      setGuardando(false);
    }
  };

  const copiarLink = async (url) => {
    await navigator.clipboard.writeText(url);
    setCopiadoLink(true);
    toast.success("Link copiado al portapapeles.");
    setTimeout(() => setCopiadoLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">

      {/* Cabecera */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
        <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
          <Link2 size={22} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reservas Online</h2>
          <p className="text-sm text-slate-500 font-medium">
            Comparte tu calendario público para que tus clientes reserven sin necesidad de login.
          </p>
        </div>
      </div>

      {/* Configurar slug */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          URL Personalizada
        </label>
        <p className="text-sm text-slate-500">
          Elige un nombre corto para tu empresa que sea fácil de compartir y recordar.
        </p>
        <div className="flex gap-2">
          <div className="flex flex-1 rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <span className="inline-flex items-center px-4 bg-slate-50 text-slate-500 text-sm font-medium border-r border-slate-200 shrink-0">
              {baseUrl}/reservar/
            </span>
            <input
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="mi-empresa"
              className="flex-1 px-4 py-3 text-sm text-slate-700 font-medium outline-none bg-white"
            />
          </div>
          <button
            onClick={handleGuardarSlug}
            disabled={guardando || slug === slugActual}
            className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 shrink-0"
          >
            {guardando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Solo letras minúsculas, números y guiones. Ej: <span className="font-mono text-indigo-600">clinica-san-jose</span>
        </p>
      </div>

      {/* Links copiables */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          Tu Link de Reservas
        </label>

        {/* URL con slug */}
        {slugActual && (
          <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <Globe size={18} className="text-indigo-500 shrink-0" />
            <p className="text-sm font-semibold text-indigo-700 flex-1 truncate font-mono">
              {urlConSlug}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={urlConSlug}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
                title="Abrir en nueva pestaña"
              >
                <ExternalLink size={16} />
              </a>
              <button
                onClick={() => copiarLink(urlConSlug)}
                className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
                title="Copiar link"
              >
                {copiado ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* URL con UUID (siempre disponible) */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <Link2 size={18} className="text-slate-400 shrink-0" />
          <p className="text-xs text-slate-500 flex-1 truncate font-mono">
            {urlConUUID}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={urlConUUID}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              title="Abrir en nueva pestaña"
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={() => copiarLink(urlConUUID)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              title="Copiar link con UUID"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* QR */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <QrCode size={14} />
          Código QR
        </label>
        <p className="text-sm text-slate-500">
          Descarga el QR y compártelo en tus redes sociales, impresiones o local.
        </p>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <img
              src={QR_API(slugActual ? urlConSlug : urlConUUID)}
              alt="QR de reservas"
              className="w-48 h-48"
            />
          </div>
          <div className="space-y-3 flex flex-col justify-center">
            <p className="text-sm text-slate-600 font-medium">
              Este QR apunta a tu página de reservas. Cuando un cliente lo escanea, ve tu calendario y puede solicitar una reserva.
            </p>
            <a
              href={QR_API(slugActual ? urlConSlug : urlConUUID)}
              download="qr-reservas.png"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all w-fit"
            >
              <QrCode size={15} />
              Descargar QR
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}