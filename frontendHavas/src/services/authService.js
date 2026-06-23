import api from "./api";

export const authService = {
  login: (email, password, role) =>
    api.post("/auth/login", { email, password, role }),

  register: (data) =>
    api.post("/auth/register", data),

  logout: () =>
    api.post("/auth/logout"),

  getProfile: () =>
    api.get("/auth/me"),

  refreshToken: (refreshToken) =>
    api.post("/auth/refresh", { refreshToken }),
};

export default api;
