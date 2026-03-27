const KEY = "config";

export const configService = {
  get() {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : {
      nombre: "Administrador",
      email: "admin@crm.com",
      empresa: "Mi Empresa",
      tema: "claro",
    };
  },

  save(config) {
    localStorage.setItem(KEY, JSON.stringify(config));
  }
};