import api from './api';

export const clubService = {
  getAll: async (params) => {
    const response = await api.get('/clubs', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/clubs/${id}`);
    return response.data;
  },
  
  create: async (clubData) => {
    const response = await api.post('/clubs', clubData);
    return response.data;
  },
  
  update: async (id, clubData) => {
    const response = await api.patch(`/clubs/${id}`, clubData);
    return response.data;
  },
  
  joinRequest: async (id) => {
    const response = await api.post(`/clubs/${id}/join`);
    return response.data;
  }
};
