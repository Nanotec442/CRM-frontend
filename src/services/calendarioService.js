import api from "./api";

export const getReservas = async () => {
  const res = await api.get("/reservas/");
  return res.data;
};

export const createReserva = async (data) => {
  const res = await api.post("/reservas/", data);
  return res.data;
};

export const deleteReserva = async (id) => {
  await api.delete(`/reservas/${id}`);
};

export const getClientes = async () => {
  const res = await api.get("/crm/clientes/");
  return res.data;
};

export const getActivos = async () => {
  const res = await api.get("/reservas/activos/");
  return res.data;
};