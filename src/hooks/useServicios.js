import { useEffect, useState } from "react";
import { serviciosService } from "../services/serviciosService";

export const useServicios = () => {
  const [servicios, setServicios] = useState([]);

  const cargarServicios = async () => {
    const data = await serviciosService.listar();
    setServicios(data);
  };

  const crearServicio = async (payload) => {
    await serviciosService.crear(payload);
    cargarServicios();
  };

  const eliminarServicio = async (id) => {
    await serviciosService.eliminar(id);
    cargarServicios();
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  return {
    servicios,
    crearServicio,
    eliminarServicio,
  };
};