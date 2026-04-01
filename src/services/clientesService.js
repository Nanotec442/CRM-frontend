import api from "./api";

const getTenantId = () =>
  localStorage.getItem("tenant_id") ||
  "014ff4c2-6f6d-42b4-82bc-7c04f07495b4";

export const clientesService = {
  async listar() {
    const res = await api.get("/crm/clientes");
    return Array.isArray(res.data) ? res.data : res.data.clientes ?? [];
  },

  async crear(formData) {
    const payload = {
      nombre_completo: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      empresa: formData.empresa,
      notas: formData.notas,
      tenant_id: getTenantId(),
    };

    const res = await api.post("/crm/clientes", payload);
    return res.data;
  },

  async modificar(clienteId, formData) {
    const payload = {
      nombre_completo: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      empresa: formData.empresa,
      notas: formData.notas,
      tenant_id: getTenantId(),
    };

    const res = await api.patch(`/crm/clientes/${clienteId}`, payload);
    return res.data;
  },

  async obtener(clienteId) {
    const res = await api.get(`/crm/clientes/${clienteId}`);
    return res.data;
  },

  async eliminar(clienteId) {
  const res = await api.delete(`/crm/clientes/${clienteId}`);
  return res.data;
}
};