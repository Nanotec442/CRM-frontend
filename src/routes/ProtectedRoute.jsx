import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { authService } from "../services/authService"; 

function ProtectedRoute({ children }) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("token");

      // 1. Si no siquiera hay token físico, le negamos el acceso de inmediato
      if (!token) {
        setIsValid(false);
        setIsVerifying(false);
        return;
      }

      // 2. Si hay token, le preguntamos a FastAPI si es real y si no ha expirado
      try {
        const userData = await authService.getRutaSecreta();
        
        // Si responde bien, el token es válido. 
        setIsValid(true);
      } catch (error) {
        // 3. Si FastAPI responde con error (ej. token vencido), limpiamos la basura y lo echamos
        console.error("Sesión inválida o expirada");
        localStorage.removeItem("token");
        localStorage.removeItem("tenant_id"); // Limpiamos también el tenant por seguridad
        setIsValid(false);
      } finally {
        // Pase lo que pase, terminamos de verificar
        setIsVerifying(false);
      }
    };

    verifySession();
  }, []); 

  // Mientras esperamos la respuesta del backend, mostramos una pantalla de carga
  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <p className="text-indigo-600 font-semibold animate-pulse">Verificando sesión segura...</p>
      </div>
    );
  }

  // Si terminó de verificar y es falso, lo mandamos al Login
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  // Si todo es válido, ¡lo dejamos pasar a la vista solicitada!
  return children;
}

export default ProtectedRoute;