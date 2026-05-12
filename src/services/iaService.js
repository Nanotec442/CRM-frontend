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
    // FormData requiere que Axios maneje el Content-Type automáticamente
    const res = await api.post("/entrenar/pdf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async chatAyuda(payload) {
    const res = await api.post("/chat/ayuda", payload);
    return res.data;
  },

  async cargaInteligenteClientes(formData) {

    const res = await api.post("/clientes/carga-inteligente", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async cargaInteligenteActivos(formData) {
    const res = await api.post("/activos/carga-inteligente", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async cargaMixtaDocumentos(formData) {
    const res = await api.post("/documentos/carga-mixta", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async entrenarUrl(payload) {
  const res = await api.post("/entrenar/url", payload);
  return res.data;
},

};

export default iaService;