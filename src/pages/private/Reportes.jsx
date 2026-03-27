import { useReportes } from "../../hooks/useReportes";
import ReservasChart from "../../components/reportes/ReservasChart";

const Reportes = () => {
  const { totalReservas, dataGrafico } = useReportes();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Reportes</h1>

      <div style={kpiContainer}>
        <div style={kpiCard}>
          <h3>Total Reservas</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {totalReservas}
          </p>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>Reservas por día</h2>
        <ReservasChart data={dataGrafico} />
      </div>
    </div>
  );
};

const kpiContainer = {
  display: "flex",
  gap: "20px",
};

const kpiCard = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};


export default Reportes;