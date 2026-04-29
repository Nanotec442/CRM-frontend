import { reservasService } from "./reservasService";
import { clientesService } from "./clientesService";
import activosService from "./activosService";

export const getReservas = async () => reservasService.listar();
export const createReserva = async (data) => reservasService.crear(data);
export const deleteReserva = async (id) => reservasService.eliminar(id);
export const getClientes = async () => clientesService.listar();
export const getActivos = async () => {
  const res = await activosService.getActivos();
  return res.data;
};
