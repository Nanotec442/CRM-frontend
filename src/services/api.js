import axios from "axios";

// 1. Lectura estricta y directa para Vite
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// 2. Nuestro chismoso para la consola (F12)
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