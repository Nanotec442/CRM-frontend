import { useEffect, useState } from "react";
import { reservasService } from "../../services/reservasService";
import { clientesService } from "../../services/clientesService";

const ReservaForm = ({ onSuccess }) => {
  const [clientes, setClientes] = useState([]);

  const [form, setForm] = useState({
    cliente_id: "",
    fecha: "",
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const data = await clientesService.listar();
      setClientes(data);
    } catch (error) {
      console.error("Error cargando clientes", error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 suma duración a la reserva (1 hora por defecto)
  const sumarTiempo = (fecha, minutos = 60) => {
    const date = new Date(fecha);
    date.setMinutes(date.getMinutes() + minutos);
    return date.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fechaInicio = new Date(form.fecha).toISOString();
      const fechaFin = sumarTiempo(form.fecha, 60);

      const payload = {
        cliente_id: form.cliente_id,
        activo_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // 🔥 temporal
        tarjeta_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // 🔥 temporal
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        tenant_id: localStorage.getItem("tenant_id"),
      };

      await reservasService.crear(payload);

      alert("Reserva creada 🔥");

      // limpiar form
      setForm({
        cliente_id: "",
        fecha: "",
      });

      onSuccess(); // recargar lista
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
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        maxWidth: "400px",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ marginBottom: "15px" }}>Nueva Reserva</h2>

      {/* CLIENTE */}
      <div style={{ marginBottom: "10px" }}>
        <label>Cliente</label>
        <select
          name="cliente_id"
          value={form.cliente_id}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Seleccionar cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre_completo}
            </option>
          ))}
        </select>
      </div>

      {/* FECHA */}
      <div style={{ marginBottom: "10px" }}>
        <label>Fecha y hora</label>
        <input
          type="datetime-local"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
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
        }}
      >
        Crear reserva
      </button>
    </form>
  );
}

export default ReservaForm;