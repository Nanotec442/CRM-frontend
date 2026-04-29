import api from "./api";

const getTenantId = () => localStorage.getItem("tenant_id");

export const clientesService = {
  async listar() {
    const res = await api.get("/crm/clientes");
    return Array.isArray(res.data) ? res.data : res.data.clientes ?? [];
  },

  async obtener(clienteId) {
    const res = await api.get(`/crm/clientes/${clienteId}`);
    return res.data;
  },

  async crear(formData) {
    const tenantId = getTenantId();
    if (!tenantId) throw new Error("No hay tenant_id en localStorage");

    const payload = {
      nombre_completo: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      empresa: formData.empresa,
      rut_documento: formData.rut || "",
      origen: formData.origen ?? "manual",
      datos_extraidos_ocr: formData.datos_extraidos_ocr ?? {},
      tenant_id: tenantId,
    };

    const res = await api.post("/crm/clientes", payload);
    return res.data;
  },

  async modificar(clienteId, formData) {
    const payload = {};
    if (formData.nombre !== undefined) payload.nombre_completo = formData.nombre;
    if (formData.email !== undefined) payload.email = formData.email;
    if (formData.telefono !== undefined) payload.telefono = formData.telefono;
    if (formData.empresa !== undefined) payload.empresa = formData.empresa;
    if (formData.origen !== undefined) payload.origen = formData.origen;
    if (formData.estado !== undefined) payload.estado = formData.estado;
    if (formData.datos_extraidos_ocr !== undefined) {
      payload.datos_extraidos_ocr = formData.datos_extraidos_ocr;
    }

    const res = await api.patch(`/crm/clientes/${clienteId}`, payload);
    return res.data;
  },

  async eliminar(clienteId) {
    const res = await api.delete(`/crm/clientes/${clienteId}`);
    return res.data;
  },
};
