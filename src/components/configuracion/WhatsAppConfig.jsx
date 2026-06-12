import { useEffect, useState } from "react";
import { Loader2, Trash2, Star, Wifi, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import whatsappService from "../../services/whatsappService";

export default function WhatsAppConfig() {
  const [conexiones, setConexiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vinculando, setVinculando] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [cargandoQR, setCargandoQR] = useState(false);

  useEffect(() => {
    cargarConexiones();
  }, []);

  const cargarConexiones = async () => {
    setCargando(true);
    try {
      const data = await whatsappService.listarConexiones();
      setConexiones(data);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error("No se pudieron cargar las conexiones de WhatsApp.");
      }
      setConexiones([]);
    } finally {
      setCargando(false);
    }
  };

  // Paso 1: crear la instancia en Evolution y guardarlo en BD
  const vincularWhatsApp = async () => {
    setVinculando(true);
    setQrData(null);
    try {
      await whatsappService.vincular();
      toast.success("Instancia creada. Ahora genera el código QR para escanear.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Error al iniciar la vinculación.");
    } finally {
      setVinculando(false);
    }
  };

  // Paso 2: pedir el QR a Evolution (puede llamarse varias veces si expira)
  const generarQR = async () => {
    setCargandoQR(true);
    setQrData(null);
    try {
      const data = await whatsappService.obtenerQR();
      // Evolution devuelve el base64 con el prefijo "data:image/png;base64," incluido
      const src = data?.base64 ?? null;
      if (src) {
        setQrData(src);
      } else {
        toast.warning("Evolution no devolvió un QR. Intenta de nuevo en unos segundos.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Error al obtener el QR.");
    } finally {
      setCargandoQR(false);
    }
  };

  const marcarPrincipal = async (integrationId) => {
    try {
      await whatsappService.marcarPrincipal(integrationId);
      toast.success("Número marcado como principal.");
      await cargarConexiones();
    } catch {
      toast.error("No se pudo marcar como principal.");
    }
  };

  const desconectar = async (integrationId, numero) => {
    if (!window.confirm(`¿Desconectar el número ${numero}? Esta acción no se puede deshacer.`))
      return;
    try {
      await whatsappService.desconectar(integrationId);
      toast.success("Número desconectado.");
      setQrData(null);
      await cargarConexiones();
    } catch {
      toast.error("No se pudo desconectar el número.");
    }
  };

  const probarConexion = async (integrationId) => {
    try {
      const data = await whatsappService.probarConexion(integrationId);
      if (data?.is_valid) {
        toast.success("Conexión activa y válida ✓");
      } else {
        toast.warning("La conexión existe pero el token puede haber expirado.");
      }
    } catch {
      toast.error("Error al probar la conexión.");
    }
  };

  // Si ya existe al menos una cuenta activa, no mostrar el panel de vinculación
  const yaVinculado = conexiones.some((c) => c.estado === "ACTIVA");

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl">
          📱
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Conectar a WhatsApp</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Vincula tu número de WhatsApp Business para recibir y responder mensajes desde PIVOT.
          </p>
        </div>
      </div>

      {/* Panel de vinculación — solo si no hay cuenta activa */}
      {!yaVinculado && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 space-y-6">

          {/* Paso 1 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Paso 1</p>
              <h3 className="text-base font-bold text-green-900">Crear instancia</h3>
              <p className="text-sm text-green-700 mt-1">
                Registra tu empresa en el servidor de WhatsApp. Solo se necesita hacer una vez.
              </p>
            </div>
            <button
              onClick={vincularWhatsApp}
              disabled={vinculando}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-60 shrink-0"
            >
              {vinculando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear instancia"
              )}
            </button>
          </div>

          <hr className="border-green-200" />

          {/* Paso 2 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Paso 2</p>
              <h3 className="text-base font-bold text-green-900">Escanear código QR</h3>
              <p className="text-sm text-green-700 mt-1">
                Genera el QR y escanéalo desde WhatsApp → Dispositivos vinculados → Vincular dispositivo.
              </p>
            </div>
            <button
              onClick={generarQR}
              disabled={cargandoQR}
              className="inline-flex items-center gap-2 bg-white border border-green-400 text-green-800 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-100 transition-colors disabled:opacity-60 shrink-0"
            >
              {cargandoQR ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Generar QR
                </>
              )}
            </button>
          </div>

          {/* Imagen QR */}
          {qrData && (
            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="bg-white p-4 rounded-2xl border border-green-200 shadow-sm">
                <img
                  src={qrData}
                  alt="Código QR de WhatsApp"
                  className="w-52 h-52"
                />
              </div>
              <p className="text-xs text-green-700 font-medium text-center">
                El QR expira en ~60 segundos. Si vence, haz clic en "Generar QR" nuevamente.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Aviso si ya está vinculado */}
      {yaVinculado && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800">
          <p className="font-semibold">WhatsApp ya está vinculado.</p>
          <p className="mt-0.5 text-green-700">
            Para cambiar de número, desconecta el actual y vuelve a vincular.
          </p>
        </div>
      )}

      {/* Lista de conexiones */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
          Números conectados
        </h3>

        {cargando ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : conexiones.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-4xl mb-3">📵</p>
            <p className="text-sm font-semibold text-slate-600">No hay números conectados aún.</p>
            <p className="text-xs text-slate-400 mt-1">
              Sigue los pasos de arriba para vincular tu número.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conexiones.map((c) => (
              <div
                key={c.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                  c.es_principal
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                      c.es_principal
                        ? "bg-green-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    📱
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">
                        {c.display_phone_number || c.phone_number_id || c.external_account_id}
                      </p>
                      {c.es_principal && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full">
                          <Star size={10} /> Principal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.verified_name ?? c.provider ?? "Sin nombre verificado"} · {c.estado}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => probarConexion(c.id)}
                    title="Probar conexión"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Wifi size={16} />
                  </button>

                  {!c.es_principal && (
                    <button
                      onClick={() => marcarPrincipal(c.id)}
                      title="Marcar como principal"
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Star size={16} />
                    </button>
                  )}

                  <button
                    onClick={() =>
                      desconectar(
                        c.id,
                        c.display_phone_number || c.phone_number_id || c.external_account_id
                      )
                    }
                    title="Desconectar número"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 space-y-1">
        <p>
          <span className="font-semibold text-slate-700">¿Cómo funciona?</span>
          {" Primero crea la instancia (Paso 1), luego genera el QR (Paso 2) y escanéalo desde tu teléfono. Una vez conectado, el bot responderá mensajes entrantes automáticamente."}
        </p>
      </div>
    </div>
  );
}