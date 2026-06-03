import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import authService from "../../services/authService";

const META_APP_ID = import.meta.env.VITE_META_APP_ID;

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

export default function FacebookLogin({ onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [sdkListo, setSdkListo] = useState(false);

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

  const manejarRespuestaFB = async (response) => {
    if (!response?.authResponse?.accessToken) {
      toast.error("No se recibió token de autorización desde Facebook.");
      setIsLoading(false);
      return;
    }

    try {
      const data = await authService.loginFacebook(response.authResponse.accessToken);
      localStorage.setItem("token", data.access_token);
      toast.success("¡Inicio de sesión con Facebook exitoso!");
      if (onLoginSuccess) onLoginSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al iniciar sesión con Facebook.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginConFacebook = () => {
    if (!window.FB) {
      toast.error("El SDK de Facebook aún no está listo. Espera un momento.");
      return;
    }

    if (!META_APP_ID) {
      toast.error("Falta VITE_META_APP_ID en las variables de entorno.");
      return;
    }

    setIsLoading(true);
    // FB.login no puede ser async — el handler async va separado
    window.FB.login((response) => manejarRespuestaFB(response), {
      scope: "email,public_profile",
    });
  };

  return (
    <button
      type="button"
      onClick={loginConFacebook}
      disabled={isLoading || !sdkListo}
      className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-[#166fe5] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.254h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      )}
      <span>Continuar con Facebook</span>
    </button>
  );
}