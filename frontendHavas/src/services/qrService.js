import api from "./api";

export const qrService = {
  getAll: (params) => api.get("/qrcodes", { params }),
  getById: (id) => api.get(`/qrcodes/${id}`),
  create: (data) => api.post("/qrcodes", data),
  update: (id, data) => api.put(`/qrcodes/${id}`, data),
  delete: (id) => api.delete(`/qrcodes/${id}`),
  duplicate: (id) => api.post(`/qrcodes/${id}/duplicate`),
  getStats: () => api.get("/qrcodes/stats"),
};
