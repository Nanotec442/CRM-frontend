import { useMemo, useRef } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const token = localStorage.getItem("token");
  const ahoraRef = useRef(Math.floor(Date.now() / 1000));

  const authResult = useMemo(() => {
    if (!token) return { valid: false, redirect: "/login" };
    try {
      const payload = jwtDecode(token);
      const ahora = ahoraRef.current;

      if (payload.exp && payload.exp < ahora) {
        localStorage.removeItem("token");
        localStorage.removeItem("tenant_id");
        return { valid: false, redirect: "/login" };
      }
      if (requireSuperAdmin && !payload.is_superadmin) {
        return { valid: false, redirect: "/panel" };
      }
      if (!requireSuperAdmin && payload.is_superadmin) {
        return { valid: false, redirect: "/superadmin" };
      }
      return { valid: true };
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("tenant_id");
      return { valid: false, redirect: "/login" };
    }
  }, [token, requireSuperAdmin]);

  if (!authResult.valid) {
    return <Navigate to={authResult.redirect} replace />;
  }

  return children;
}

export default ProtectedRoute;