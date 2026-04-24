import { useState } from "react";
import { useConfig } from "../../hooks/useConfig";

import ConfigSidebar from "../../components/configuracion/ConfigSidebar";
import PerfilConfig from "../../components/configuracion/PerfilConfig";
import EmpresaConfig from "../../components/configuracion/EmpresaConfig";
import PreferenciasConfig from "../../components/configuracion/PreferenciasConfig";
import SeguridadConfig from "../../components/configuracion/SeguridadConfig";
import DocumentosConfig from "../../components/configuracion/DocumentosConfig";

/**
 * Panel Central de Configuración.
 * Gestiona el perfil del usuario, datos de empresa y preferencias del tenant.
 */
const Configuracion = () => {
  const { config, guardar } = useConfig();
  const [form, setForm] = useState(config);
  const [active, setActive] = useState("perfil");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Maneja la carga de datos procesados por la IA desde documentos legales/empresariales.
   */
  const handleAIFill = (data) => {
    setIsProcessing(true);
    // Simulación de latencia de procesamiento de lenguaje natural
    setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        ...data 
      }));
      setIsProcessing(false);
      setActive("empresa"); 
    }, 2000);
  };

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
      case "seguridad":
        return <SeguridadConfig />;
      default:
        return <PerfilConfig form={form} handleChange={handleChange} />;
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header consistente con Dashboard */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Configuración del Sistema</h1>
        <p className="mt-2 text-slate-600">
          Gestiona la identidad de tu Tenant, preferencias de usuario y seguridad.
        </p>
      </section>

      {/* Layout de dos columnas: Sidebar + Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navegación Lateral */}
        <aside className="lg:col-span-3">
          <div className="">
            <ConfigSidebar active={active} setActive={setActive} />
          </div>
        </aside>

        {/* Contenido Dinámico */}
        <main className="lg:col-span-9 space-y-6">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 min-h-100">
            {renderContent()}
          </div>

          {/* Footer de acción permanente */}
          <div className="flex justify-end pt-2">
            <button 
              onClick={() => guardar(form)} 
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Guardar todos los cambios
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * Estado de carga con feedback visual para procesos de IA.
 */
const ProcessingLoader = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
    <div className="text-4xl animate-bounce mb-6">🤖</div>
    <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
        <h3 className="text-lg font-bold text-indigo-600">IA Analizando documento...</h3>
    </div>
    <p className="text-slate-500 text-sm">Extrayendo información relevante para tu CRM.</p>
  </div>
);

export default Configuracion;