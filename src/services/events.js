import api from './api';

export const eventService = {
  getAll: async (params) => {
    const response = await api.get('/events', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  
  create: async (clubId, eventData) => {
    const response = await api.post(`/clubs/${clubId}/events`, eventData);
    return response.data;
  },
  
  update: async (id, eventData) => {
    const response = await api.patch(`/events/${id}`, eventData);
    return response.data;
  },
  
  rsvp: async (id, rsvpData) => {
    const response = await api.post(`/events/${id}/rsvp`, rsvpData);
    return response.data;
  },
  
  checkIn: async (id, userId) => {
    const response = await api.post(`/events/${id}/check-in`, { userId });
    return response.data;
  }
};
