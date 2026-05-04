import axios from "axios";

// Lee la variable desde la nube (producción) o desde tu archivo .env local
const envBaseUrl = import.meta.env.VITE_API_URL;
const baseURL = envBaseUrl ? envBaseUrl.trim() : "http://127.0.0.1:8000";

console.log("🔗 Conectando al Backend en:", baseURL);

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token
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

export default api;