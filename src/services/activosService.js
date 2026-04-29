import api from "./api";

export const activosService = {
  async getActivos() {
    return api.get("/reservas/activos");
  },

  async getActivo(id) {
    return api.get(`/reservas/activos/${id}`);
  },

  async createActivo(data) {
    return api.post("/reservas/activos", data);
  },

  async updateActivo(id, data) {
    return api.patch(`/reservas/activos/${id}`, data);
  },

  async desactivarActivo(id) {
    return api.patch(`/reservas/activos/${id}/desactivar`);
  },
};

export default activosService;
