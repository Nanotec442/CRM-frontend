import api from "./api";

const conversacionesService = {

  async listar({ canal, estado, modo_atencion, asignado_usuario_id, cliente_id, limit = 50, offset = 0 } = {}) {
    const params = { limit, offset };
    if (canal) params.canal = canal;
    if (estado) params.estado = estado;
    if (modo_atencion) params.modo_atencion = modo_atencion;
    if (asignado_usuario_id) params.asignado_usuario_id = asignado_usuario_id;
    if (cliente_id) params.cliente_id = cliente_id;
    const res = await api.get("/crm/conversaciones", { params });
    return res.data;
  },

  async obtener(conversacionId) {
    const res = await api.get(`/crm/conversaciones/${conversacionId}`);
    return res.data;
  },

  async listarMensajes(conversacionId) {
    const res = await api.get(`/crm/conversaciones/${conversacionId}/mensajes`);
    return res.data;
  },

  async cambiarModo(conversacionId, modo_atencion) {
    const res = await api.patch(`/crm/conversaciones/${conversacionId}/modo`, { modo_atencion });
    return res.data;
  },

  async asignar(conversacionId, asignado_usuario_id) {
    const res = await api.patch(`/crm/conversaciones/${conversacionId}/asignar`, { asignado_usuario_id });
    return res.data;
  },

  async cerrar(conversacionId) {
    const res = await api.patch(`/crm/conversaciones/${conversacionId}/cerrar`, {});
    return res.data;
  },

  async reabrir(conversacionId) {
    const res = await api.patch(`/crm/conversaciones/${conversacionId}/reabrir`);
    return res.data;
  },

  async responder(conversacionId, contenido) {
    const res = await api.post(`/crm/conversaciones/${conversacionId}/responder`, { contenido });
    return res.data;
  },

  async crear(payload) {
    const res = await api.post("/crm/conversaciones", payload);
    return res.data;
  },

  async listarPorCliente(clienteId) {
    const res = await api.get(`/crm/clientes/${clienteId}/conversaciones`);
    return res.data;
  },

  async enviarMensaje(payload) {
    const res = await api.post("/crm/mensajes", payload);
    return res.data;
  },

  // ── Métricas del inbox ────────────────────────────────────────────────────
  async obtenerMetricas() {
    const res = await api.get("/crm/metricas/inbox");
    return res.data;
  },

  async obtenerResumenOperativo() {
    const res = await api.get("/crm/metricas/inbox/resumen-operativo");
    return res.data;
  },

  async obtenerMetricasPorAgente() {
    const res = await api.get("/crm/metricas/inbox/por-agente");
    return res.data;
  },

  async obtenerConversacionesRecientes() {
    const res = await api.get("/crm/metricas/inbox/recientes");
    return res.data;
  },
};

export default conversacionesService;