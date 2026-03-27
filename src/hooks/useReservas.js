import { useEffect, useState } from "react";
import { reservasService } from "../services/reservasService";

export const useReservas = () => {
  const [reservas, setReservas] = useState([]);

  const cargarReservas = async () => {
    try {
      const data = await reservasService.listar();
      setReservas(data);
    } catch (error) {
      console.error("Error cargando reservas", error);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  return { reservas };
};