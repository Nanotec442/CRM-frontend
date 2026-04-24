import { useEffect, useState, useMemo } from "react";
import { reservasService } from "../services/reservasService";

export const useReportes = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reservasService.listar()
      .then((data) => {
        setReservas(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Error en reportes:", err))
      .finally(() => setLoading(false));
  }, []);

  // Usamos useMemo para que los cálculos no se repitan en cada render innecesariamente
  const reporteCalculado = useMemo(() => {
    if (reservas.length === 0) return { totalReservas: 0, dataGraficoDias: [], kpis: {} };

    // 1. Total Reservas
    const total = reservas.length;

    // 2. Reservas por día (Data para ReservasChart)
    const reservasPorDia = reservas.reduce((acc, r) => {
      // Validación: si no hay fecha, saltar
      if (!r.fecha_inicio) return acc;
      
      const fecha = r.fecha_inicio.split("T")[0];
      acc[fecha] = (acc[fecha] || 0) + 1;
      return acc;
    }, {});

    const dataGraficoDias = Object.keys(reservasPorDia)
      .sort() // Ordenar por fecha
      .map((fecha) => ({
        fecha: fecha.split("-").reverse().slice(0, 2).join("/"), // Formato DD/MM para el gráfico
        total: reservasPorDia[fecha],
      }));

    // 3. KPIs Adicionales (Ejemplo de ingresos)
    const ingresos = reservas.reduce((acc, r) => acc + (Number(r.monto_total) || 0), 0);

    return {
      totalReservas: total,
      dataGraficoDias,
      kpis: {
        ingresosEstimados: ingresos,
        activosOcupados: reservas.filter(r => r.estado === "Confirmada").length
      }
    };
  }, [reservas]);

  return {
    ...reporteCalculado,
    loading,
  };
};