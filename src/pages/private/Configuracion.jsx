import { useState, useEffect } from "react";
import { useConfig } from "../../hooks/useConfig";
import { jwtDecode } from "jwt-decode";
import { Loader2, Sparkles, Save } from "lucide-react";

import ConfigSidebar from "../../components/configuracion/ConfigSidebar";
import PerfilConfig from "../../components/configuracion/PerfilConfig";
import EmpresaConfig from "../../components/configuracion/EmpresaConfig";
import PreferenciasConfig from "../../components/configuracion/PreferenciasConfig";
import EntrenarIA from "../../components/configuracion/EntrenarIA"; // Importación corregida
import DocumentosConfig from "../../components/configuracion/DocumentosConfig";

/**
 * Panel Central de Configuración.
 * Actúa como el orquestador principal (Smart Component) para las preferencias del usuario y el Tenant.
 */
const Configuracion = () => {
  const { config, guardar } = useConfig();

  // Estados principales
  const [form, setForm] = useState(config || {});
  const [active, setActive] = useState("perfil");
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. HIDRATACIÓN SEGURA DESDE JWT
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // jwtDecode extrae la info del usuario sin hacer peticiones extra
      const payload = jwtDecode(token);

      setForm((prev) => ({
        ...prev,
        // Unimos nombre y apellido para la UI
        nombre_completo: prev?.nombre_completo || `${payload.nombre || ''} ${payload.apellido || ''}`.trim() || payload.name || "",
        email: payload.email || payload.sub || prev?.email || "",
        is_superadmin: payload.is_superadmin || false,
        telefono: payload.telefono || prev?.telefono || "",
      }));
    } catch (error) {
      console.warn("No se pudo decodificar el token para la configuración:", error);
    }
  }, []);

  // 2. SINCRONIZACIÓN CON EL BACKEND (Vía Custom Hook)
  useEffect(() => {
    if (config) {
      setForm((prev) => ({ 
        ...prev, 
        ...config,
        // Si el backend trae nombre y apellido, los unificamos
        nombre_completo: config.nombre_completo || `${config.nombre || ''} ${config.apellido || ''}`.trim() || prev.nombre_completo
      }));
    }
  }, [config]);

  // 3. MANEJADOR UNIVERSAL DE INPUTS
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 4. PREPARACIÓN ANTES DE GUARDAR
  const handleGuardar = async () => {
    setIsProcessing(true);
    
    // Hacemos una copia profunda del formulario para no mutar el estado visual
    const payload = { ...form };

    // TRUCO: Dividimos el nombre_completo de vuelta a nombre y apellido para el backend
    if (payload.nombre_completo) {
      const partes = payload.nombre_completo.trim().split(" ");
      payload.nombre = partes[0] || "";
      payload.apellido = partes.slice(1).join(" ") || " ";
      delete payload.nombre_completo; // Eliminamos la variable temporal
    }

    try {
      await guardar(payload);
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. FLUJO DE INTELIGENCIA ARTIFICIAL (Carga de Documentos Mixta)
  const handleAIFill = (data) => {
    setIsProcessing(true);

    // Simulamos el tiempo de transición visual para que el usuario perciba que la IA hizo su trabajo
    setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        ...data,
      }));

      setIsProcessing(false);
      setActive("empresa"); // Redirige a la vista de empresa para que el usuario valide los datos extraídos
    }, 1500);
  };

  // 6. RENDERIZADO CONDICIONAL DE PESTAÑAS
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
      case "seguridad": // Asumiendo que "seguridad" es la tab para entrenar la IA en tu ConfigSidebar
        return <EntrenarIA />;
      default:
        return <PerfilConfig form={form} handleChange={handleChange} />;
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900">
          Configuración del Sistema
        </h1>
        <p className="mt-2 text-slate-600">
          Gestiona la identidad de tu organización, preferencias de usuario y la base de conocimiento IA.
        </p>
      </section>

      {/* --- LAYOUT PRINCIPAL (GRID) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQ: Navegación Lateral */}
        <aside className="lg:col-span-3">
          <ConfigSidebar active={active} setActive={setActive} />
        </aside>

        {/* COLUMNA DER: Contenido Activo */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Contenedor Blanco Principal */}
          <div className="rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-200 min-h-[450px] transition-all duration-300">
            {renderContent()}
          </div>

          {/* Botón de Guardar (Se oculta en vistas que no requieren guardado global) */}
          {active !== "documentos" && active !== "seguridad" && !isProcessing && (
            <div className="flex justify-end pt-2 animate-in fade-in duration-300">
              <button
                onClick={handleGuardar}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] group"
              >
                <Save size={18} className="group-hover:scale-110 transition-transform" />
                Guardar todos los cambios
              </button>
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
};

/**
 * Componente de Carga de IA 
 */
const ProcessingLoader = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-100 bg-indigo-50/50 rounded-2xl border border-dashed border-indigo-100 animate-in fade-in zoom-in-95 duration-500 m-4">
    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-5" strokeWidth={1.5} />
    
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