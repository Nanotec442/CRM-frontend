import api from "./api";

const activosService = {
  async getActivos() {
    const res = await api.get("/reservas/activos");
    return res.data;
  },

  async getActivo(id) {
    const res = await api.get(`/reservas/activos/${id}`);
    return res.data;
  },

  async createActivo(data) {
    const res = await api.post("/reservas/activos", data);
    return res.data;
  },

  async updateActivo(id, data) {
    const res = await api.patch(`/reservas/activos/${id}`, data);
    return res.data;
  },

  async desactivarActivo(id) {
    const res = await api.patch(`/reservas/activos/${id}/desactivar`);
    return res.data;
  },
};

export default activosService;