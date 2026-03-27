import { useEffect, useState } from "react";
import {
  getReservas,
  createReserva,
  deleteReserva,
} from "../services/calendarioService";

export const useCalendario = () => {
  const [eventos, setEventos] = useState([]);

  const loadEventos = async () => {
    const data = await getReservas();

    const formateados = data.map((r) => ({
      id: r.id,
      title: `Reserva`,
      start: new Date(r.fecha_inicio),
      end: new Date(r.fecha_fin),
    }));

    setEventos(formateados);
  };

  useEffect(() => {
    loadEventos();
  }, []);

  const agregarEvento = async (evento) => {
    await createReserva(evento);
    loadEventos();
  };

  const eliminarEvento = async (id) => {
    await deleteReserva(id);
    loadEventos();
  };

  return {
    eventos,
    agregarEvento,
    eliminarEvento,
  };
};