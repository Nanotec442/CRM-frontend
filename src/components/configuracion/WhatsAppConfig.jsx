import { useEffect, useState } from "react";
import { Loader2, Trash2, Star, Wifi } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";

const META_APP_ID = import.meta.env.VITE_META_APP_ID;
const META_CONFIG_ID = import.meta.env.VITE_META_CONFIG_ID;

function cargarFacebookSDK(appId) {
  if (document.getElementById("facebook-jssdk")) return;

  window.fbAsyncInit = function () {
    window.FB.init({
      appId,
      cookie: true,
      xfbml: false,
      version: "v22.0",
    });
  };

  const js = document.createElement("script");
  js.id = "facebook-jssdk";
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  js.async = true;
  js.defer = true;
  document.body.appendChild(js);
}

export default function WhatsAppConfig() {
  const [conexiones, setConexiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [conectando, setConectando] = useState(false);
  const [sdkListo, setSdkListo] = useState(false);

  // Cargar SDK de Facebook al montar
  useEffect(() => {
    if (!META_APP_ID) return;

    cargarFacebookSDK(META_APP_ID);

    const intervalo = setInterval(() => {
      if (window.FB) {
        setSdkListo(true);
        clearInterval(intervalo);
      }
    }, 300);

    return () => clearInterval(intervalo);
  }, []);

  // Cargar conexiones existentes al montar
  useEffect(() => {
    cargarConexiones();
  }, []);

  const cargarConexiones = async () => {
    setCargando(true);
    try {
      const res = await api.get("/crm/whatsapp/connections");
      setConexiones(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error("No se pudieron cargar las conexiones de WhatsApp.");
      }
      setConexiones([]);
    } finally {
      setCargando(false);
    }
  };

  // Función async separada para intercambiar el code con el backend
  const intercambiarCodigo = async (code) => {
    try {
      const { data } = await api.post("/crm/whatsapp/embedded-signup/exchange", {
        code,
      });
      const numero =
        data?.integration?.display_phone_number ||
        data?.integration?.phone_number_id;
      toast.success(`¡WhatsApp conectado! Número: ${numero}`);
      await cargarConexiones();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || "Error al conectar WhatsApp."
      );
    } finally {
      setConectando(false);
    }
  };

  const conectarWhatsApp = () => {
    if (!window.FB) {
      toast.error("El SDK de Facebook aún no está listo. Espera un momento.");
      return;
    }

    if (!META_CONFIG_ID) {
      toast.error("Falta VITE_META_CONFIG_ID en las variables de entorno.");
      return;
    }

    setConectando(true);

    // IMPORTANTE: el callback de FB.login NO puede ser async
    // El código async va en una función separada (intercambiarCodigo)
    window.FB.login(
      (response) => {
        if (!response?.authResponse?.code) {
          toast.error("No se recibió código de autorización desde Meta.");
          setConectando(false);
          return;
        }

        intercambiarCodigo(response.authResponse.code);
      },
      {
        config_id: META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          feature: "whatsapp_embedded_signup",
          sessionInfoVersion: "3",
        },
      }
    );
  };

  const marcarPrincipal = async (integrationId) => {
    try {
      await api.patch("/crm/whatsapp/connections/principal", {
        integration_id: integrationId,
      });
      toast.success("Número marcado como principal.");
      await cargarConexiones();
    } catch {
      toast.error("No se pudo marcar como principal.");
    }
  };

  const desconectar = async (integrationId, numero) => {
    if (
      !window.confirm(
        `¿Desconectar el número ${numero}? Esta acción no se puede deshacer.`
      )
    )
      return;

    try {
      await api.delete(`/crm/whatsapp/connections/${integrationId}`);
      toast.success("Número desconectado.");
      await cargarConexiones();
    } catch {
      toast.error("No se pudo desconectar el número.");
    }
  };

  const probarConexion = async (integrationId) => {
    try {
      const res = await api.get(
        `/crm/whatsapp/connections/${integrationId}/test`
      );
      if (res.data?.is_valid) {
        toast.success("Conexión activa y válida ✓");
      } else {
        toast.warning("La conexión existe pero el token puede haber expirado.");
      }
    } catch {
      toast.error("Error al probar la conexión.");
    }
  };

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl">
          ✅
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Conectar a WhatsApp
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Vincula tu número de WhatsApp Business para recibir y responder
            mensajes desde PIVOT.
          </p>
        </div>
      </div>

      {/* Aviso HTTPS en desarrollo */}
      {window.location.protocol === "http:" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <p className="font-bold mb-1">⚠ Requiere HTTPS</p>
          <p>
            Meta bloquea el login desde páginas HTTP. Para probar en desarrollo
            usa{" "}
            <code className="bg-amber-100 px-1 rounded font-mono">
              ngrok http 5173
            </code>{" "}
            y abre la URL HTTPS que te genera.
          </p>
        </div>
      )}

      {/* Botón de conexión */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-green-900">
            Agregar número de WhatsApp
          </h3>
          <p className="text-sm text-green-700 mt-1">
            Usa tu cuenta de Meta Business para vincular un número de WhatsApp
            Business.
          </p>
        </div>
        <button
          onClick={conectarWhatsApp}
          disabled={!sdkListo || conectando}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-60 shrink-0"
        >
          {conectando ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <span>📱</span>
              Conectar WhatsApp
            </>
          )}
        </button>
      </div>

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
            <p className="text-sm font-semibold text-slate-600">
              No hay números conectados aún.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Haz clic en "Conectar WhatsApp" para vincular tu número.
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
                {/* Info del número */}
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
                        {c.display_phone_number || c.phone_number_id}
                      </p>
                      {c.es_principal && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full">
                          <Star size={10} /> Principal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.verified_name ?? "Sin nombre verificado"} · {c.estado}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
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
                        c.display_phone_number || c.phone_number_id
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

      {/* Info adicional */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 space-y-1">
        <p>
          <span className="font-semibold text-slate-700">¿Cómo funciona?</span>{" "}
          Al hacer clic en "Conectar WhatsApp" se abrirá una ventana de Meta
          para autorizar tu cuenta de WhatsApp Business.
        </p>
        <p>
          El número principal es el que el bot usará para responder mensajes
          entrantes automáticamente.
        </p>
      </div>
    </div>
  );
}