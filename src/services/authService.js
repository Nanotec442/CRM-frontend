import api from "./api";

const buildLoginPayload = (email, password) => {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);
  return params;
};

export const authService = {
  async login(email, password) {
    const response = await api.post(
      "/auth/login",
      buildLoginPayload(email, password),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  },

  async register(payload) {
    const response = await api.post("/auth/register", payload);
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  async resetPassword(payload) {
    const response = await api.post("/auth/reset-password", payload);
    return response.data;
  },

  async getRutaSecreta() {
    const response = await api.get("/auth/ruta-secreta");
    return response.data;
  },
};

export const login = authService.login;
export const register = authService.register;
export const forgotPassword = authService.forgotPassword;
export const resetPassword = authService.resetPassword;

export default authService;