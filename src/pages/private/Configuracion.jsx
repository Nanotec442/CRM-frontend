import { useState } from "react";
import { useConfig } from "../../hooks/useConfig";

import ConfigSidebar from "../../components/configuracion/ConfigSidebar";
import PerfilConfig from "../../components/configuracion/PerfilConfig";
import EmpresaConfig from "../../components/configuracion/EmpresaConfig";
import PreferenciasConfig from "../../components/configuracion/PreferenciasConfig";
import SeguridadConfig from "../../components/configuracion/SeguridadConfig";

const Configuracion = () => {
  const { config, guardar } = useConfig();
  const [form, setForm] = useState(config);
  const [active, setActive] = useState("perfil");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const renderContent = () => {
    switch (active) {
      case "perfil":
        return <PerfilConfig form={form} handleChange={handleChange} />;
      case "empresa":
        return <EmpresaConfig form={form} handleChange={handleChange} />;
      case "preferencias":
        return <PreferenciasConfig form={form} handleChange={handleChange} />;
      case "seguridad":
        return <SeguridadConfig />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Configuración</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <ConfigSidebar active={active} setActive={setActive} />

        <div style={{ flex: 1 }}>
          {renderContent()}

          <button
            onClick={() => guardar(form)}
            style={button}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

const card = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  marginBottom: "20px",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const button = {
  padding: "12px",
  background: "#1e293b",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default Configuracion;