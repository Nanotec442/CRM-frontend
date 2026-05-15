import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import authService from "../../services/authService";

export default function GoogleLogin({ onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  // Configuramos el hook de Google
  const loginConGoogle = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        // codeResponse.access_token es el token que nos da Google en el frontend
        // Se lo enviamos a nuestro backend de FastAPI
        const data = await authService.loginGoogle(codeResponse.access_token);
        
        // Guardamos el token de nuestro propio backend
        localStorage.setItem("token", data.access_token);
        
        toast.success("¡Inicio de sesión con Google exitoso!");
        
        // Ejecutamos la función que nos pasen por props (ej: redirigir al dashboard)
        if (onLoginSuccess) onLoginSuccess();
        
      } catch (error) {
        console.error("Error validando token con backend:", error);
        toast.error(error.response?.data?.detail || "Error al iniciar sesión con Google.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.log("Error desde Google UI:", error);
      toast.error("Se canceló o falló el inicio de sesión con Google.");
    },
  });

  return (
    <button
      type="button"
      onClick={() => loginConGoogle()}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
      ) : (
        <img 
          src="https://www.svgrepo.com/show/475656/google-color.svg" 
          alt="Google logo" 
          className="w-5 h-5" 
        />
      )}
      <span>Continuar con Google</span>
    </button>
  );
}