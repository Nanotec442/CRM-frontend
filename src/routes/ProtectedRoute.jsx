import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

/**
 * Protege rutas privadas validando el JWT localmente.
 * requireSuperAdmin=true → solo permite superadmin
 * Sin prop → permite cualquier usuario autenticado
 */
function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = jwtDecode(token);
    const ahora = Math.floor(Date.now() / 1000);

    // Token expirado
    if (payload.exp && payload.exp < ahora) {
      localStorage.removeItem("token");
      localStorage.removeItem("tenant_id");
      return <Navigate to="/login" replace />;
    }

    // Ruta solo para superadmin
    if (requireSuperAdmin && !payload.is_superadmin) {
      return <Navigate to="/panel" replace />;
    }

    // Superadmin intentando entrar al panel CRM normal → redirigir a superadmin
    if (!requireSuperAdmin && payload.is_superadmin) {
      return <Navigate to="/superadmin" replace />;
    }

  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("tenant_id");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;