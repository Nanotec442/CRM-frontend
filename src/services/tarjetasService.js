import api from "./api";

const getTenantId = () => localStorage.getItem("tenant_id");
const normalizarEtapa = (etapa, index) => {
  if (!etapa) return null;
  if (typeof etapa === "string") {
    const nombre = etapa.trim();
    return nombre ? { nombre, orden: index } : null;
  }

  const nombre = String(etapa.nombre ?? etapa.titulo ?? "").trim();
  if (!nombre) return null;

  return {
    nombre,
    orden: Number.isFinite(etapa.orden) ? etapa.orden : index,
    color_hex: etapa.color_hex ?? null,
  };
};

export const tarjetasService = {
  async getTablero() {
    const res = await api.get("/crm/tablero");
    return res.data;
  },

  async getColumnas() {
    const res = await api.get("/crm/configuracion/tablero");
    return res.data;
  },

  async actualizarColumnas(columnas) {
    const etapas = Array.isArray(columnas)
      ? columnas.map((columna, index) => normalizarEtapa(columna, index)).filter(Boolean)
      : [];
    const res = await api.put("/crm/configuracion/tablero", { etapas });
    return res.data;
  },

  async crearColumna(payload) {
    const etapa = normalizarEtapa(payload, 0);
    const res = await api.post("/crm/configuracion/tablero/etapas", etapa);
    return res.data;
  },

  async editarColumna(stageId, payload) {
    const body = {};
    if (payload?.nombre != null) body.nombre = String(payload.nombre).trim();
    if (payload?.orden != null) body.orden = payload.orden;
    if (Object.prototype.hasOwnProperty.call(payload ?? {}, "color_hex")) {
      body.color_hex = payload.color_hex;
    }
    const res = await api.patch(`/crm/configuracion/tablero/etapas/${stageId}`, body);
    return res.data;
  },

  async eliminarColumna(stageId, destinoStageId) {
    const res = await api.delete(`/crm/configuracion/tablero/etapas/${stageId}`, {
      data: { destino_stage_id: destinoStageId },
    });
    return res.data;
  },

  async crearTarjeta(payload) {
    const res = await api.post("/crm/tarjetas", {
      tenant_id: payload.tenant_id ?? getTenantId(),
      ...payload,
    });
    return res.data;
  },

  async moverTarjeta(tarjetaId, stageId) {
    const res = await api.patch(`/crm/tarjetas/${tarjetaId}/mover`, {
      stage_id: stageId,
    });
    return res.data;
  },

  async actualizarTarjeta(tarjetaId, payload) {
    const res = await api.patch(`/crm/tarjetas/${tarjetaId}`, payload);
    return res.data;
  },
};
