import axios from "axios";

const envBaseUrl = import.meta.env.VITE_API_URL;

// En producción VITE_API_URL es obligatoria — sin ella fallamos explícitamente
if (!envBaseUrl && import.meta.env.PROD) {
  throw new Error("❌ VITE_API_URL no está definida. Configura la variable de entorno en producción.");
}

const baseURL = envBaseUrl?.trim() || "http://127.0.0.1:8000";

if (import.meta.env.DEV) {
  console.log("🔗 Conectando al Backend en:", baseURL);
}

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta — manejo global de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("tenant_id");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;