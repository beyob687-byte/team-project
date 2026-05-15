import api from "../services/api";

export const clubManagementApi = {
  getMembers: async (clubId, params = {}) => {
    const response = await api.get(`/clubs/${clubId}/members`, { params });
    return response.data?.data || response.data;
  },

  getRequests: async (clubId, params = {}) => {
    const response = await api.get(`/clubs/${clubId}/requests`, { params });
    return response.data?.data || response.data;
  },

  resolveRequest: async (clubId, requestId, action, denial_reason = null) => {
    const response = await api.patch(`/clubs/${clubId}/requests/${requestId}`, {
      action,
      denial_reason,
    });
    return response.data?.data || response.data;
  },

  getEvents: async (clubId, params = {}) => {
    const response = await api.get(`/clubs/${clubId}/events`, { params });
    return response.data?.data || response.data;
  },

  createEvent: async (clubId, payload) => {
    const response = await api.post(`/clubs/${clubId}/events`, payload);
    return response.data?.data || response.data;
  },

  getPosts: async (clubId, params = {}) => {
    const response = await api.get(`/clubs/${clubId}/posts`, { params });
    return response.data?.data || response.data;
  },

  createPost: async (clubId, payload) => {
    const response = await api.post(`/clubs/${clubId}/posts`, payload);
    return response.data?.data || response.data;
  },
};
