// Adapter for club-scoped projects API
import api from "../services/api";

const sendProjectPayload = (clubId, method, path, data) => {
  const requestConfig = {};

  if (data instanceof FormData) {
    requestConfig.headers = { "Content-Type": "multipart/form-data" };
  }

  return api[method](`/clubs/${clubId}/projects${path}`, data, requestConfig);
};

export const projectsApi = {
  createProject: async (clubId, data) => {
    const response = await sendProjectPayload(clubId, "post", "", data);
    return response.data.data;
  },

  getProjects: async (clubId, params = {}) => {
    const response = await api.get(`/clubs/${clubId}/projects`, { params });
    return response.data.data;
  },

  getProject: async (clubId, projectId) => {
    const response = await api.get(`/clubs/${clubId}/projects/${projectId}`);
    return response.data.data;
  },

  updateProject: async (clubId, projectId, data) => {
    const response = await sendProjectPayload(
      clubId,
      "patch",
      `/${projectId}`,
      data,
    );
    return response.data.data;
  },

  deleteProject: async (clubId, projectId) => {
    const response = await api.delete(`/clubs/${clubId}/projects/${projectId}`);
    return response.data.data;
  },

  likeProject: async (clubId, projectId) => {
    const response = await api.post(
      `/clubs/${clubId}/projects/${projectId}/like`,
    );
    return response.data.data;
  },

  addProjectMedia: async (clubId, projectId, data) => {
    const requestConfig = {};
    if (data instanceof FormData) {
      requestConfig.headers = { "Content-Type": "multipart/form-data" };
    }

    const response = await api.post(
      `/clubs/${clubId}/projects/${projectId}/media`,
      data,
      requestConfig,
    );
    return response.data.data;
  },

  deleteProjectMedia: async (clubId, projectId, mediaId) => {
    const response = await api.delete(
      `/clubs/${clubId}/projects/${projectId}/media/${mediaId}`,
    );
    return response.data.data;
  },
};
