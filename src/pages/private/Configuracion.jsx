import { useState, useEffect } from "react";
import { useConfig } from "../../hooks/useConfig";
import { jwtDecode } from "jwt-decode";
import { Loader2, Sparkles, Save } from "lucide-react";
import { toast } from "react-toastify";

import ConfigSidebar from "../../components/configuracion/ConfigSidebar";
import PerfilConfig from "../../components/configuracion/PerfilConfig";
import EmpresaConfig from "../../components/configuracion/EmpresaConfig";
import PreferenciasConfig from "../../components/configuracion/PreferenciasConfig";
import EntrenarIA from "../../components/configuracion/EntrenarIA";
import DocumentosConfig from "../../components/configuracion/DocumentosConfig";
import RolesConfig from "../../components/configuracion/RolesConfig";
import ReservasOnlineConfig from "../../components/configuracion/ReservasOnlineConfig";
import WhatsAppConfig from "../../components/configuracion/WhatsAppConfig";
import authService from "../../services/authService";
import empresasService from "../../services/empresasService";

/**
 * Panel Central de Configuración.
 * Actúa como el orquestador principal (Smart Component) para las preferencias del usuario y el Tenant.
 */
const Configuracion = () => {
  const { config, guardar } = useConfig();

  const [form, setForm] = useState(config || {});
  const [active, setActive] = useState("perfil");
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. HIDRATACIÓN DUAL: JWT (Usuario) + API (Empresa)
  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = jwtDecode(token);
        const tenantId = payload.tenant_id || localStorage.getItem("tenant_id");

        // JWT siempre tiene prioridad — nombre viene del token
        setForm((prev) => ({
          ...prev,
          nombre_completo: payload.nombre
            ? `${payload.nombre} ${payload.apellido ?? ""}`.trim()
            : "",
          email: payload.sub ?? "",
          is_superadmin: payload.is_superadmin ?? false,
          telefono: prev?.telefono ?? "",
        }));

        if (tenantId) {
          const dataEmpresa = await empresasService.verMiEmpresa(tenantId);
          setForm((prev) => ({
            ...prev,
            nombre_empresa: dataEmpresa.nombre ?? "",
            rut_empresa: dataEmpresa.rut_empresa ?? "",
            tipo_empresa: dataEmpresa.tipo_empresa ?? "",
            direccion: dataEmpresa.direccion ?? "",
            sub_dominio: dataEmpresa.sub_dominio ?? "",
          }));
        }
      } catch (error) {
        console.warn("Error al inicializar la configuración:", error);
      }
    };

    inicializarDatos();
  }, []);

  // 2. MANEJADOR UNIVERSAL DE INPUTS
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. PREPARACIÓN Y RUTEO ANTES DE GUARDAR
  const handleGuardar = async () => {
    setIsProcessing(true);
    const payload = { ...form };

    try {
      if (active === "perfil") {
        const partes = (payload.nombre_completo ?? "").trim().split(" ");
        const nombre = partes[0] || "";
        const apellido = partes.slice(1).join(" ") || "";

        const respuesta = await authService.actualizarPerfil({
          nombre,
          apellido,
          telefono: payload.telefono || "",
        });

        if (respuesta.access_token) {
          localStorage.setItem("token", respuesta.access_token);
        }

        toast.success("Perfil actualizado correctamente.");
      } else if (active === "empresa") {
        const payloadEmpresa = {
          nombre_empresa: payload.nombre_empresa,
          rut_empresa: payload.rut_empresa,
          tipo_empresa: payload.tipo_empresa,
          direccion: payload.direccion,
        };
        await empresasService.actualizarConfiguracionMiEmpresa(payloadEmpresa);
        guardar(payload);
      } else {
        guardar(payload);
      }
    } catch (error) {
      toast.error("Error al guardar los cambios.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. FLUJO DE INTELIGENCIA ARTIFICIAL
  const handleAIFill = (data) => {
    setIsProcessing(true);
    setTimeout(() => {
      setForm((prev) => ({ ...prev, ...data }));
      setIsProcessing(false);
      setActive("empresa");
    }, 1500);
  };

  // 5. RENDERIZADO CONDICIONAL DE PESTAÑAS
  const renderContent = () => {
    if (isProcessing) return <ProcessingLoader />;

    switch (active) {
      case "perfil":
        return <PerfilConfig form={form} handleChange={handleChange} />;
      case "empresa":
        return <EmpresaConfig form={form} handleChange={handleChange} />;
      case "documentos":
        return <DocumentosConfig onAIComplete={handleAIFill} />;
      case "preferencias":
        return <PreferenciasConfig form={form} handleChange={handleChange} />;
      case "roles":
        return <RolesConfig />;
      case "reservas_online":
        return <ReservasOnlineConfig />;
      case "seguridad":
        return <EntrenarIA />;
      case "whatsapp":
        return <WhatsAppConfig />;
      default:
        return <PerfilConfig form={form} handleChange={handleChange} />;
    }
  };

  // Pestañas que manejan su propio guardado — ocultar el botón global
  const ocultarBotonGuardar = [
    "documentos",
    "seguridad",
    "roles",
    "reservas_online",
    "whatsapp",
  ].includes(active) || isProcessing;

  return (
    <div className="space-y-8 font-sans pb-10 animate-in fade-in duration-500">

      {/* HEADER */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900">
          Configuración del Sistema
        </h1>
        <p className="mt-2 text-slate-600">
          Gestiona la identidad de tu organización, preferencias de usuario y la
          base de conocimiento IA.
        </p>
      </section>

      {/* LAYOUT PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Navegación Lateral */}
        <aside className="lg:col-span-3">
          <ConfigSidebar active={active} setActive={setActive} />
        </aside>

        {/* Contenido Activo */}
        <main className="lg:col-span-9 space-y-6">

          <div className="rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-200 min-h-112.5 transition-all duration-300">
            {renderContent()}
          </div>

          {/* Botón de Guardar global */}
          {!ocultarBotonGuardar && (
            <div className="flex justify-end pt-2 animate-in fade-in duration-300">
              <button
                onClick={handleGuardar}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] group"
              >
                <Save
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                Guardar todos los cambios
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const ProcessingLoader = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-100 bg-indigo-50/50 rounded-2xl border border-dashed border-indigo-100 animate-in fade-in zoom-in-95 duration-500 m-4">
    <Loader2
      className="w-12 h-12 text-indigo-600 animate-spin mb-5"
      strokeWidth={1.5}
    />
    <div className="flex items-center gap-2 mb-3">
      <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
      <h3 className="text-xl font-bold text-indigo-900">
        PIVOT procesando datos...
      </h3>
    </div>
    <p className="text-indigo-700/70 text-sm font-medium text-center max-w-sm">
      Sincronizando información y configurando tu entorno automáticamente.
    </p>
  </div>
);

export default Configuracion;