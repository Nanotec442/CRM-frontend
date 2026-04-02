import { useEffect, useState } from "react";
import { reservasService } from "../../services/reservasService";
import { clientesService } from "../../services/clientesService";
import { activosService } from "../../services/activosService";

const ReservaForm = ({ onSuccess }) => {
  const [clientes, setClientes] = useState([]);
  const [activos, setActivos] = useState([]);
  const [loadingActivos, setLoadingActivos] = useState(false);

  const [form, setForm] = useState({
    cliente_id: "",
    activo_id: "",
    fecha: "",
  });

  useEffect(() => {
    cargarClientes();
    cargarActivos();
  }, []);

  const cargarClientes = async () => {
    try {
      const data = await clientesService.listar();
      setClientes(data);
    } catch (error) {
      console.error("Error cargando clientes", error);
    }
  };

  const cargarActivos = async () => {
    setLoadingActivos(true);
    try {
      const data = await activosService.listar();
      setActivos(data);
    } catch (error) {
      console.error("Error cargando activos", error);
    } finally {
      setLoadingActivos(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const sumarTiempo = (fecha, minutos = 60) => {
    const date = new Date(fecha);
    date.setMinutes(date.getMinutes() + minutos);
    return date.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!form.cliente_id) return alert("Selecciona un cliente");
      if (!form.activo_id) return alert("Selecciona un activo");
      if (!form.fecha) return alert("Selecciona fecha");

      const payload = {
        cliente_id: form.cliente_id,
        activo_id: form.activo_id,
        fecha_inicio: new Date(form.fecha).toISOString(),
        fecha_fin: sumarTiempo(form.fecha, 60),
      };

      await reservasService.crear(payload);

      alert("Reserva creada ");

      setForm({
        cliente_id: "",
        activo_id: "",
        fecha: "",
      });

      onSuccess();
    } catch (error) {
      console.error("Error backend:", error.response?.data);
      alert("Error creando reserva");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff",
        padding: "22px",
        borderRadius: "14px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        maxWidth: "420px",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ marginBottom: "15px", fontWeight: "600" }}>
         Nueva Reserva
      </h2>

      {/* CLIENTE */}
      <div style={{ marginBottom: "12px" }}>
        <label>Cliente</label>
        <select
          name="cliente_id"
          value={form.cliente_id}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">Seleccionar cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre_completo}
            </option>
          ))}
        </select>
      </div>

      {/* ACTIVO */}
      <div style={{ marginBottom: "12px" }}>
        <label>Activo</label>
        <select
          name="activo_id"
          value={form.activo_id}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">
            {loadingActivos ? "Cargando activos..." : "Seleccionar activo"}
          </option>
          {activos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* FECHA */}
      <div style={{ marginBottom: "12px" }}>
        <label>Fecha y hora</label>
        <input
          type="datetime-local"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </div>

      {/* BOTÓN */}
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
          fontWeight: "500",
        }}
      >
        Crear reserva
      </button>
    </form>
  );
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  marginTop: "4px",
};

export default ReservaForm;