const STORAGE_KEY = "servicios";

const getServicios = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveServicios = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const serviciosService = {
  async listar() {
    return getServicios();
  },

  async crear(servicio) {
    const servicios = getServicios();

    const nuevo = {
      id: crypto.randomUUID(),
      ...servicio,
    };

    const updated = [...servicios, nuevo];
    saveServicios(updated);

    return nuevo;
  },

  async eliminar(id) {
    const servicios = getServicios();
    const updated = servicios.filter(s => s.id !== id);
    saveServicios(updated);
  },
};