import api from './api';

export const memberService = {
  getForClub: async (clubId, params) => {
    const response = await api.get(`/clubs/${clubId}/members`, { params });
    return response.data;
  },
  
  updateRole: async (clubId, memberId, newRole) => {
    const response = await api.patch(`/clubs/${clubId}/members/${memberId}/role`, { role: newRole });
    return response.data;
  },
  
  remove: async (clubId, memberId) => {
    const response = await api.delete(`/clubs/${clubId}/members/${memberId}`);
    return response.data;
  },
  
  getPendingRequests: async (clubId) => {
    const response = await api.get(`/clubs/${clubId}/join-requests`);
    return response.data;
  },
  
  handleRequest: async (clubId, requestId, status) => {
    // status: 'approved' | 'declined'
    const response = await api.post(`/clubs/${clubId}/join-requests/${requestId}`, { status });
    return response.data;
  }
};
