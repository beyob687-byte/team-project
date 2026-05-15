// Adapter for events API
import api from "../services/api";

export const eventsApi = {
  getEvent: async (clubId, eventId) => {
    const response = await api.get(`/clubs/${clubId}/events/${eventId}`);
    return response.data.data;
  },

  rsvpEvent: async (clubId, eventId) => {
    const response = await api.post(`/clubs/${clubId}/events/${eventId}/rsvp`);
    return response.data.data;
  },

  getEvents: async (clubId, params = {}) => {
    const response = await api.get(`/clubs/${clubId}/events`, { params });
    return response.data.data;
  },
};
