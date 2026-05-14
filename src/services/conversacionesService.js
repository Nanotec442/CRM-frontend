import api from "./api";

const conversacionesService = {

  // ── Listar conversaciones con filtros opcionales ──────────────────────────
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

  // ── Obtener detalle de una conversación ───────────────────────────────────
  async obtener(conversacionId) {
    const res = await api.get(`/crm/conversaciones/${conversacionId}`);
    return res.data;
  },

  // ── Listar mensajes de una conversación ───────────────────────────────────
  async listarMensajes(conversacionId) {
    const res = await api.get(`/crm/conversaciones/${conversacionId}/mensajes`);
    return res.data;
  },

  // ── Cambiar modo ia / humano ──────────────────────────────────────────────
  async cambiarModo(conversacionId, modo_atencion) {
    const res = await api.patch(`/crm/conversaciones/${conversacionId}/modo`, { modo_atencion });
    return res.data;
  },

  // ── Asignar agente ────────────────────────────────────────────────────────
  async asignar(conversacionId, asignado_usuario_id) {
    const res = await api.patch(`/crm/conversaciones/${conversacionId}/asignar`, { asignado_usuario_id });
    return res.data;
  },

  // ── Cerrar conversación ───────────────────────────────────────────────────
  async cerrar(conversacionId) {
    const res = await api.patch(`/crm/conversaciones/${conversacionId}/cerrar`, {});
    return res.data;
  },

  // ── Reabrir conversación ──────────────────────────────────────────────────
  async reabrir(conversacionId) {
    const res = await api.patch(`/crm/conversaciones/${conversacionId}/reabrir`);
    return res.data;
  },

  // ── Responder manualmente ─────────────────────────────────────────────────
  async responder(conversacionId, contenido) {
    const res = await api.post(`/crm/conversaciones/${conversacionId}/responder`, { contenido });
    return res.data;
  },

  // ── Crear conversación ────────────────────────────────────────────────────
  async crear(payload) {
    const res = await api.post("/crm/conversaciones", payload);
    return res.data;
  },

  // ── Listar historial de conversaciones de un cliente ──────────────────────
  async listarPorCliente(clienteId) {
    const res = await api.get(`/crm/clientes/${clienteId}/conversaciones`);
    return res.data;
  },

  // ── Enviar mensaje (endpoint básico) ─────────────────────────────────────
  async enviarMensaje(payload) {
    const res = await api.post("/crm/mensajes", payload);
    return res.data;
  },
};

export default conversacionesService;