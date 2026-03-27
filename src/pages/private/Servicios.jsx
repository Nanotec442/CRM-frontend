import { useServicios } from "../../hooks/useServicios";
import ServicioForm from "../../components/servicios/ServicioForm";

const Servicios = () => {
  const { servicios, crearServicio, eliminarServicio } = useServicios();

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>Servicios</h1>

      <ServicioForm onSubmit={crearServicio} />

      {servicios.length === 0 ? (
        <p>No hay servicios aún</p>
      ) : (
        <div style={grid}>
          {servicios.map((s) => (
            <div key={s.id} style={card}>
              <h3>{s.nombre}</h3>
              <p>{s.descripcion}</p>
              <p style={{ fontWeight: "bold" }}>${s.precio}</p>

              <button
                onClick={() => eliminarServicio(s.id)}
                style={deleteBtn}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
  gap: "15px",
};

const card = {
  background: "#fff",
  padding: "15px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

const deleteBtn = {
  marginTop: "10px",
  padding: "8px",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default Servicios;