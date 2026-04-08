import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { login } from "../../services/authService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Intentando login...");

      const data = await login(formData.email, formData.password);

      console.log("RESPUESTA LOGIN:", data);

      localStorage.setItem("token", data.access_token);

      if (data.tenant_id) {
        localStorage.setItem("tenant_id", data.tenant_id);
      } else {
        console.warn("tenant_id no vino en response, intentando desde token...");

        const payload = JSON.parse(atob(data.access_token.split(".")[1]));
        console.log("🔍 PAYLOAD TOKEN:", payload);

        if (payload.tenant_id) {
          localStorage.setItem("tenant_id", payload.tenant_id);
        } else {
          throw new Error("No se pudo obtener tenant_id");
        }
      }

      localStorage.setItem("isAuth", "true");

      navigate("/panel");

    } catch (err) {
      console.error(" ERROR LOGIN:", err);

      if (err.response?.status === 401) {
        setError("Credenciales incorrectas");
      } else {
        setError("Error del servidor o configuración");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-slate-600">
              Accede al panel de gestión del CRM
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@crm.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-800">Credenciales de prueba</p>
            <p className="mt-1">Correo: admin@crm.com</p>
            <p>Contraseña: 123456</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;