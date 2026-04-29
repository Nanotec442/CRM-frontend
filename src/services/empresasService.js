import api from "./api";

export const empresasService = {
  async listarEmpresas() {
    const res = await api.get("/empresas/");
    return res.data;
  },

  async crearEmpresa(payload) {
    const res = await api.post("/empresas/crear", payload);
    return res.data;
  },

  async listarEmpresasActivas() {
    const res = await api.get("/empresas/listar");
    return res.data;
  },

  async obtenerEmpresa(tenantId) {
    const res = await api.get(`/empresas/${tenantId}`);
    return res.data;
  },

  async eliminarEmpresa(tenantId) {
    const res = await api.delete(`/empresas/${tenantId}`);
    return res.data;
  },

  async modificarEmpresa(tenantId, payload) {
    const res = await api.patch(`/empresas/${tenantId}`, payload);
    return res.data;
  },

  async verMiEmpresa(tenantId) {
    const res = await api.get(`/empresas/mi-empresa/${tenantId}`);
    return res.data;
  },

  async registroEmpresa(payload) {
    const res = await api.post("/empresas/registro-empresa", payload);
    return res.data;
  },

  async actualizarConfiguracionMiEmpresa(payload) {
    const res = await api.patch("/empresas/mi-empresa/configuracion", payload);
    return res.data;
  },

  async crearSubusuario(payload) {
    const res = await api.post("/empresas/", payload);
    return res.data;
  },

  async listarSubusuarios() {
    const res = await api.get("/empresas/");
    return res.data;
  },

  async modificarSubusuario(usuarioId, payload) {
    const res = await api.patch(`/empresas/${usuarioId}`, payload);
    return res.data;
  },

  async eliminarSubusuario(usuarioId) {
    const res = await api.delete(`/empresas/${usuarioId}`);
    return res.data;
  },
};

export default empresasService;
