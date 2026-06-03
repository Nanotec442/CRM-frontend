import api from "./api";

export const documentosService = {
  async crear(payload) {
    const res = await api.post("/documentos/", payload);
    return res.data;
  },

  async obtener(documentoId) {
    const res = await api.get(`/documentos/${documentoId}`);
    return res.data;
  },

  async firmar(documentoId, payload) {
    const res = await api.post(`/documentos/${documentoId}/firmar`, payload);
    return res.data;
  },

  async generarContrato(reservaId, payload) {
    const res = await api.post(`/documentos/generar-contrato/${reservaId}`, payload);
    return res.data;
  },

  async descargar(documentoId) {
    const res = await api.get(`/documentos/descargar/${documentoId}`, {
      responseType: "blob",
    });
    return res.data;
  },

  async firmarAlternativo(documentoId, payload) {
    const res = await api.post(`/documentos/firmar/${documentoId}`, payload);
    return res.data;
  },

  async listarPorCliente(clienteId) {
    const res = await api.get(`/documentos/cliente/${clienteId}`);
    return res.data;
  },

  async obtenerCertificado(documentoId) {
    const res = await api.get(`/documentos/certificado/${documentoId}`);
    return res.data;
  },

  async anular(documentoId, motivo) {
    const res = await api.patch(`/documentos/${documentoId}/anular`, { motivo });
    return res.data;
  },

  async enviarParaFirma(documentoId) {
  const res = await api.post(`/documentos/${documentoId}/enviar-firma`);
  return res.data;
},

async obtenerDocumentoPublico(token) {
  const res = await api.get(`/documentos/firma-publica/${token}`, {
    responseType: "blob",
  });
  return res.data;
},

async firmarDocumentoPublico(token, payload) {
  const res = await api.post(`/documentos/firma-publica/${token}`, payload);
  return res.data;
  },
};



export default documentosService;