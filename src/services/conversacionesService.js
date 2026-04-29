import api from "./api";

export const conversacionesService = {
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
};

export default conversacionesService;
