import api from "./api";

const empresasService = {

  // ── Superadmin only ─────────────────────────────────────────────────────
  // Estos métodos solo funcionan con token de superadmin del SaaS

  listarTodasEmpresas() {
    // GET /empresas/ → requiere requerir_superadmin
    return api.get("/empresas/").then((r) => r.data);
  },

  listarEmpresasActivas() {
    // GET /empresas/listar → requiere requerir_superadmin
    return api.get("/empresas/listar").then((r) => r.data);
  },

  crearEmpresa(payload) {
    // POST /empresas/crear → requiere requerir_superadmin
    return api.post("/empresas/crear", payload).then((r) => r.data);
  },

  obtenerEmpresa(tenantId) {
    // GET /empresas/{tenant_id} → requiere requerir_superadmin
    return api.get(`/empresas/${tenantId}`).then((r) => r.data);
  },

  eliminarEmpresa(tenantId) {
    // DELETE /empresas/{tenant_id} → requiere requerir_superadmin
    return api.delete(`/empresas/${tenantId}`).then((r) => r.data);
  },

  modificarEmpresa(tenantId, payload) {
    // PATCH /empresas/{tenant_id} → requiere requerir_superadmin
    return api.patch(`/empresas/${tenantId}`, payload).then((r) => r.data);
  },

  // ── Tenant admin ─────────────────────────────────────────────────────────

  verMiEmpresa(tenantId) {
    // GET /empresas/mi-empresa/{tenant_id} → requiere get_current_user
    return api.get(`/empresas/mi-empresa/${tenantId}`).then((r) => r.data);
  },

  actualizarConfiguracionMiEmpresa(payload) {
    // PATCH /empresas/mi-empresa/configuracion → requiere administrar_empresa
    return api.patch("/empresas/mi-empresa/configuracion", payload).then((r) => r.data);
  },

  registroEmpresa(payload) {
    // POST /empresas/registro-empresa → público (sin auth)
    return api.post("/empresas/registro-empresa", payload).then((r) => r.data);
  },

  // ── Subusuarios (equipo) ─────────────────────────────────────────────────
  // Requieren permiso: administrar_usuarios

  listarSubusuarios() {
    // GET /empresas/ → filtra automáticamente por tenant del token
    // OJO: mismo endpoint que listarTodasEmpresas pero el backend
    // distingue por el tipo de usuario en el token (superadmin vs tenant)
    return api.get("/empresas/").then((r) => r.data);
  },

  crearSubusuario(payload) {
    // POST /empresas/ → payload DEBE incluir role_id (obligatorio en el backend)
    // { nombre, apellido, email, telefono, password, role_id }
    return api.post("/empresas/", payload).then((r) => r.data);
  },

  modificarSubusuario(usuarioId, payload) {
    // PATCH /empresas/{usuario_id}
    return api.patch(`/empresas/${usuarioId}`, payload).then((r) => r.data);
  },

  eliminarSubusuario(usuarioId) {
    // DELETE /empresas/{usuario_id}
    return api.delete(`/empresas/${usuarioId}`).then((r) => r.data);
  },
};

export default empresasService;