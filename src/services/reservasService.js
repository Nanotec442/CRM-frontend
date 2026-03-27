import api from "./api";

const getTenantId = () =>
  localStorage.getItem("tenant_id") ||
  "014ff4c2-6f6d-42b4-82bc-7c04f07495b4";

export const reservasService = {
  async listar() {
    const res = await api.get("/reservas/");
    return Array.isArray(res.data) ? res.data : res.data.reservas ?? [];
  },

  async crear(data) {
    const payload = {
      ...data,
      tenant_id: localStorage.getItem("tenanr_id"),
    };

    const res = await api.post("/reservas/", payload);
    return res.data;
  },

  async cancelar(reservaId) {
    const res = await api.patch(`/reservas/${reservaId}/cancelar`);
    return res.data;
  },

  async obtener(reservaId) {
    const res = await api.get(`/reservas/${reservaId}`);
    return res.data;
  },
};