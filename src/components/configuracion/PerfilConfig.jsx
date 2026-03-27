const PerfilConfig = ({ form, handleChange }) => {
  return (
    <div style={card}>
      <h2>Perfil</h2>

      <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" style={input}/>
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" style={input}/>
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

export default PerfilConfig;