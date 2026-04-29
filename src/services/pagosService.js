import api from "./api";

export const pagosService = {
  async crear(payload) {
    const res = await api.post("/pagos/webpay/crear", payload);
    return res.data;
  },

  async redireccionar(payload) {
    const res = await api.post("/pagos/webpay/redireccionar", payload);
    return res.data;
  },

  async estado(token) {
    const res = await api.get(`/pagos/webpay/estado/${token}`);
    return res.data;
  },

  async refund(token, payload) {
    const res = await api.post(`/pagos/webpay/refund/${token}`, payload);
    return res.data;
  },

  async testForm() {
    const res = await api.get("/pagos/webpay/test-form");
    return res.data;
  },
};

export default pagosService;
