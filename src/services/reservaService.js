import API from "./api";

export const getReservas = () => API.get("/reservas/");
export const crearReserva = (data) => API.post("/reservas/", data);