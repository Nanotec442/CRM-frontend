import { useEffect, useState } from "react";
import { reservasService } from "../services/reservasService";

export const useReportes = () => {
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    reservasService.listar().then(setReservas);
  }, []);

  // 🔥 total reservas
  const totalReservas = reservas.length;

  // 🔥 reservas por día
  const reservasPorDia = reservas.reduce((acc, r) => {
    const fecha = r.fecha_inicio.split("T")[0];

    acc[fecha] = (acc[fecha] || 0) + 1;
    return acc;
  }, {});

  const dataGrafico = Object.keys(reservasPorDia).map((fecha) => ({
    fecha,
    total: reservasPorDia[fecha],
  }));

  return {
    totalReservas,
    dataGrafico,
  };
};