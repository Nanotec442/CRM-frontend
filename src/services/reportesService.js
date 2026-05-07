import api from "./api";

export const reportesService = {
  async obtener() {
    const res = await api.get("/reportes/");
    return res.data;
  },
};

export default reportesService;