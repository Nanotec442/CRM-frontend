import api from "./api";

export const iaService = {
  async verificarWebhook(params) {
    const res = await api.get("/webhook/", { params });
    return res.data;
  },

  async recibirWebhook(payload) {
    const res = await api.post("/webhook/", payload);
    return res.data;
  },

  async entrenarPdf(formData) {
    const res = await api.post("/entrenar/pdf", formData);
    return res.data;
  },

  async chatAyuda(payload) {
    const res = await api.post("/chat/ayuda", payload);
    return res.data;
  },

  async cargaInteligenteClientes(payload) {
    const res = await api.post("/clientes/carga-inteligente", payload);
    return res.data;
  },

  async cargaInteligenteActivos(payload) {
    const res = await api.post("/activos/carga-inteligente", payload);
    return res.data;
  },

  async cargaMixtaDocumentos(formData) {
    const res = await api.post("/documentos/carga-mixta", formData);
    return res.data;
  },
};

export default iaService;
