import { reservasService } from "./reservasService";
import { clientesService } from "./clientesService";
import activosService from "./activosService";

export const getReservas = async () => reservasService.listar();
export const createReserva = async (data) => reservasService.crear(data);

// El backend NO tiene DELETE en reservas — solo PATCH /{id}/cancelar
export const deleteReserva = async (id) => reservasService.cancelar(id);

export const getClientes = async () => clientesService.listar();
export const getActivos = async () => activosService.getActivos();