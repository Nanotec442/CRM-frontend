import api from "./api";

const getActivos = () => api.get("/reservas/activos");

const getActivo = (id) => api.get(`/reservas/activos/${id}`);

const createActivo = (data) => api.post("/reservas/activos", data);

const updateActivo = (id, data) => api.patch(`/reservas/activos/${id}`, data);

const desactivarActivo = (id) => api.patch(`/reservas/activos/${id}/desactivar`);

const activosService = {
  getActivos,
  getActivo,
  createActivo,
  updateActivo,
  desactivarActivo,
};

export default activosService;