import api from "./api";

export const clientesService = {
  async listar() {
    const res = await api.get("/crm/clientes");
    return Array.isArray(res.data) ? res.data : res.data.clientes ?? [];
  },

  async crear(formData) {
    const tenantId = localStorage.getItem("tenant_id");

    if (!tenantId) {
      throw new Error("No hay tenant_id en localStorage");
    }

    const payload = {
      nombre_completo: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      rut_documento: formData.rut || "",
      origen: "manual",
      datos_extraidos_ocr: {},
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
    if (formData.origen !== undefined) payload.origen = formData.origen;

    // NOTA: `estado` ya no se usa aquí para pipeline.
    // El pipeline se gestiona exclusivamente a través de tarjetasService.

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
  },
};