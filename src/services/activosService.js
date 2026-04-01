import api from "./api";

export const activosService = {
  listar: async () => {
    const response = await api.get("/reservas/activos/");
    return response.data;
  },
};