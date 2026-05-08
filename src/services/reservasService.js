import api from "./api";

const getTenantId = () => localStorage.getItem("tenant_id");

export const reservasService = {
  async listar() {
    const res = await api.get("/reservas/");
    return Array.isArray(res.data) ? res.data : res.data.reservas ?? [];
  },

  async obtener(reservaId) {
    const res = await api.get(`/reservas/${reservaId}`);
    return res.data;
  },

  async crear(data) {
    const payload = {
      ...data,
      tenant_id: data.tenant_id ?? getTenantId(),
    };
    const res = await api.post("/reservas/", payload);
    return res.data;
  },

  // El backend usa PATCH /{id}/cancelar — no existe DELETE
  async cancelar(reservaId) {
    const res = await api.patch(`/reservas/${reservaId}/cancelar`);
    return res.data;
  },

  async actualizar(reservaId, data) {
    const res = await api.patch(`/reservas/${reservaId}`, data);
    return res.data;
  },

  async consultarDisponibilidad(payload) {
    const res = await api.post("/reservas/disponibilidad", payload);
    return res.data;
  },

  // ── Endpoints públicos (sin auth) ────────────────────────────────────────
  async resolverSlug(slug) {
    const res = await api.get(`/reservas/publica/resolver/${slug}`);
    return res.data;
  },

  async listarActivosPublicos(tenantId) {
    const res = await api.get(`/reservas/publica/activos/${tenantId}`);
    return res.data;
  },

  async crearPublica(data) {
    const res = await api.post("/reservas/publica", data);
    return res.data;
  },

  async obtenerPublica(reservaId) {
    const res = await api.get(`/reservas/publica/${reservaId}`);
    return res.data;
  },
};

export default reservasService;