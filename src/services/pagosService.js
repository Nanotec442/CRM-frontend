import api from "./api";

export const pagosService = {
  // Inicia una transacción Webpay para una reserva
  // Devuelve { url, token, buy_order, test_url }
  async crear(payload) {
    const res = await api.post("/pagos/webpay/crear", payload);
    return res.data;
  },

  // Obtiene el estado actual de una transacción por token
  async estado(token) {
    const res = await api.get(`/pagos/webpay/estado/${token}`);
    return res.data;
  },

  // Anula un pago aprobado
  async refund(token, amount) {
    const res = await api.post(`/pagos/webpay/refund/${token}`, { amount });
    return res.data;
  },
};

export default pagosService;