import { useEffect, useState, useCallback } from "react";
import { reservasService } from "../services/reservasService";

export const useReservas = () => {
  const [reservas, setReservas] = useState([]);

  const cargarReservas = useCallback(async () => {
    try {
      const data = await reservasService.listar();
      setReservas(data);
    } catch (error) {
      console.error("Error cargando reservas", error);
    }
  }, []);

  const cancelarReserva = async (id) => {
    await reservasService.cancelar(id);
    cargarReservas();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarReservas();
  }, [cargarReservas]);

  return {
    reservas,
    cargarReservas,
    cancelarReserva,
  };
};