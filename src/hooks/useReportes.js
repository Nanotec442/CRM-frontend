import { useEffect, useState } from "react";
import { reportesService } from "../services/reportesService";

export const useReportes = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalReservas: 0,
    confirmadas: 0,
    pendientes: 0,
    canceladas: 0,
    porcentajeCancelacion: "0",
    activosOcupados: 0,
    ingresosEstimados: 0,
  });
  const [dataGraficoDias, setDataGraficoDias] = useState([]);
  const [dataGraficoEstados, setDataGraficoEstados] = useState([]);
  const [dataGraficoActivos, setDataGraficoActivos] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await reportesService.obtener();
        setKpis(data.kpis);
        setDataGraficoDias(data.dataGraficoDias);
        setDataGraficoEstados(data.dataGraficoEstados);
        setDataGraficoActivos(data.dataGraficoActivos);
      } catch (err) {
        console.error("Error cargando reportes:", err);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  return {
    kpis,
    dataGraficoDias,
    dataGraficoEstados,
    dataGraficoActivos,
    loading,
  };
};