import api from './api';

export const adminService = {
  getOverview: async () => {
    const response = await api.get('/admin/overview');
    return response.data;
  },
  
  getClubs: async (params) => {
    const response = await api.get('/admin/clubs', { params });
    return response.data;
  },
  
  getRegistrationRequests: async () => {
    const response = await api.get('/admin/clubs/requests');
    return response.data;
  },
  
  handleRegistration: async (requestId, status, reason = '') => {
    const response = await api.post(`/admin/clubs/requests/${requestId}`, { status, reason });
    return response.data;
  },
  
  getModerationQueue: async (params) => {
    const response = await api.get('/admin/moderation', { params });
    return response.data;
  },
  
  resolveModerationItem: async (itemId, action) => {
    const response = await api.post(`/admin/moderation/${itemId}/resolve`, { action });
    return response.data;
  },
  
  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  
  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  }
};
