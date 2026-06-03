import api from "./api";

const whatsappService = {
  async listarConexiones() {
    const res = await api.get("/crm/whatsapp/connections");
    return Array.isArray(res.data) ? res.data : [];
  },

  async obtenerConexion(integrationId) {
    const res = await api.get(`/crm/whatsapp/connections/${integrationId}`);
    return res.data;
  },

  async exchangeCode(code) {
    const res = await api.post("/crm/whatsapp/embedded-signup/exchange", { code });
    return res.data;
  },

  async marcarPrincipal(integrationId) {
    const res = await api.patch("/crm/whatsapp/connections/principal", {
      integration_id: integrationId,
    });
    return res.data;
  },

  async desconectar(integrationId) {
    const res = await api.delete(`/crm/whatsapp/connections/${integrationId}`);
    return res.data;
  },

  async probarConexion(integrationId) {
    const res = await api.get(`/crm/whatsapp/connections/${integrationId}/test`);
    return res.data;
  },
};

export default whatsappService;