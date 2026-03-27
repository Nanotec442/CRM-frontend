const ConfigSidebar = ({ active, setActive }) => {
  const items = [
    { key: "perfil", label: "Perfil" },
    { key: "empresa", label: "Empresa" },
    { key: "preferencias", label: "Preferencias" },
    { key: "seguridad", label: "Seguridad" },
  ];

  return (
    <div style={sidebar}>
      {items.map((item) => (
        <div
          key={item.key}
          onClick={() => setActive(item.key)}
          style={{
            ...itemStyle,
            background: active === item.key ? "#1e293b" : "transparent",
            color: active === item.key ? "#fff" : "#333",
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

const sidebar = {
  width: "220px",
  background: "#fff",
  borderRadius: "12px",
  padding: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

const itemStyle = {
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "5px",
};

export default ConfigSidebar;