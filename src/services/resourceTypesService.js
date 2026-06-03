import api from "./api";

// ── Resource Types (/resource-types) ──────────────────────────────────────
const resourceTypesService = {
  async listar() {
    const res = await api.get("/resource-types");
    return Array.isArray(res.data) ? res.data : [];
  },

  async obtener(id) {
    const res = await api.get(`/resource-types/${id}`);
    return res.data;
  },

  async crear(payload) {
    const res = await api.post("/resource-types", payload);
    return res.data;
  },

  async actualizar(id, payload) {
    const res = await api.patch(`/resource-types/${id}`, payload);
    return res.data;
  },

  async desactivar(id) {
    const res = await api.delete(`/resource-types/${id}`);
    return res.data;
  },
};

export default resourceTypesService;