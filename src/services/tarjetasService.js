import api from "./api";

export const tarjetasService = {
  async getTablero() {
    const res = await api.get("/crm/tablero");
    return res.data;
  },

  async getColumnas() {
    // Esto ahora devuelve una lista de objetos [{id, nombre, ...}] 
    // en lugar de solo un array de strings.
    const res = await api.get("/crm/configuracion/tablero");
    return res.data;
  },

  async moverTarjeta(tarjetaId, stageId) {

    const res = await api.patch(`/crm/tarjetas/${tarjetaId}/mover`, {
      stage_id: stageId, 
    });
    return res.data;
  },
};