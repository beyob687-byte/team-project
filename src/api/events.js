// Adapter for events API
import api from "../services/api";

export const eventsApi = {
  getEvent: async (clubId, eventId) => {
    const response = await api.get(`/events/${eventId}`);
    return response.data.data;
  },

  rsvpEvent: async (eventId) => {
    const response = await api.post(`/events/${eventId}/rsvp`);
    return response.data.data;
  },

  getEvents: async (params) => {
    const response = await api.get("/events", { params });
    return response.data;
  },
};
