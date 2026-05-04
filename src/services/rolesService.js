import api from "./api";

export const rolesService = {
  async listar() {
    const res = await api.get("/roles/");
    return res.data;
  },

  async crear(payload) {
    // ✅ Barra final agregada para evitar el redirect 307 de FastAPI
    const res = await api.post("/roles/", payload);
    return res.data;
  },

  async modificar(rolId, payload) {
    const res = await api.patch(`/roles/${rolId}`, payload);
    return res.data;
  },

  async eliminar(rolId) {
    const res = await api.delete(`/roles/${rolId}`);
    return res.data;
  },
};

export default rolesService;