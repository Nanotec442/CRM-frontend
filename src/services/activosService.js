import api from "./api";

// ── Activos (/activos) ─────────────────────────────────────────────────────
const activosService = {
  async getActivos({ estado, resource_type_id, es_reservable, q, limit = 100, offset = 0 } = {}) {
    const params = { limit, offset };
    if (estado) params.estado = estado;
    if (resource_type_id) params.resource_type_id = resource_type_id;
    if (es_reservable !== undefined) params.es_reservable = es_reservable;
    if (q) params.q = q;
    const res = await api.get("/activos", { params });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getActivo(id) {
    const res = await api.get(`/activos/${id}`);
    return res.data;
  },

  async createActivo(data) {
    const res = await api.post("/activos", data);
    return res.data;
  },

  async updateActivo(id, data) {
    const res = await api.patch(`/activos/${id}`, data);
    return res.data;
  },

  async desactivarActivo(id) {
    const res = await api.delete(`/activos/${id}`);
    return res.data;
  },

  async consultarDisponibilidad(payload) {
    const res = await api.post("/activos/disponibilidad", payload);
    return res.data;
  },
};

// ── Resource Rules (/activos/{id}/reglas) ──────────────────────────────────
export const reglasService = {
  async listar(activoId) {
    const res = await api.get(`/activos/${activoId}/reglas`);
    return Array.isArray(res.data) ? res.data : [];
  },
  async crear(activoId, payload) {
    const res = await api.post(`/activos/${activoId}/reglas`, payload);
    return res.data;
  },
  async eliminar(activoId, reglaId) {
    const res = await api.delete(`/activos/${activoId}/reglas/${reglaId}`);
    return res.data;
  },
};

// ── Resource Availability (/activos/{id}/disponibilidad) ───────────────────
export const disponibilidadService = {
  async listar(activoId) {
    const res = await api.get(`/activos/${activoId}/disponibilidad`);
    return Array.isArray(res.data) ? res.data : [];
  },
  async crear(activoId, payload) {
    const res = await api.post(`/activos/${activoId}/disponibilidad`, payload);
    return res.data;
  },
  async eliminar(activoId, dispId) {
    const res = await api.delete(`/activos/${activoId}/disponibilidad/${dispId}`);
    return res.data;
  },
};

export default activosService;