// Adapter for projects API
import api from "../services/api";

export const projectsApi = {
  createProject: async (data) => {
    const response = await api.post("/projects", data);
    return response.data.data;
  },

  getProjects: async (params) => {
    const response = await api.get("/projects", { params });
    return response.data.data;
  },

  getProject: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  updateProject: async (id, data) => {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};
