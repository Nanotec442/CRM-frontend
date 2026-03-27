import { useState } from "react";

const ServicioForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

return (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onSubmit(form);
    }}
    style={{
      background: "#ffffff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      maxWidth: "400px",
      marginBottom: "20px",
    }}
  >
    <h2 style={{ marginBottom: "15px" }}>Nuevo Servicio</h2>

    <div style={{ marginBottom: "10px" }}>
      <input
        name="nombre"
        placeholder="Nombre del servicio"
        onChange={handleChange}
        required
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
    </div>

    <div style={{ marginBottom: "10px" }}>
      <input
        name="descripcion"
        placeholder="Descripción"
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
    </div>

    <div style={{ marginBottom: "10px" }}>
      <input
        name="precio"
        type="number"
        placeholder="Precio"
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
    </div>

    <button
      type="submit"
      style={{
        width: "100%",
        padding: "10px",
        background: "#1e293b",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      Crear servicio
    </button>
  </form>
)
};

export default ServicioForm;