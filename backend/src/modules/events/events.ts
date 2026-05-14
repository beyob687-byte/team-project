import client from '../pages/student/client';

export const eventsApi = {
  getEvents: async (clubId: string, params?: any) => {
    const response = await client.get(`/clubs/${clubId}/events`, { params });
    return response.data.data;
  },

  getEvent: async (clubId: string, eventId: string) => {
    const response = await client.get(`/clubs/${clubId}/events/${eventId}`);
    return response.data.data;
  },

  createEvent: async (clubId: string, formData: FormData) => {
    const response = await client.post(`/clubs/${clubId}/events`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data.event;
  },

  updateEvent: async (clubId: string, eventId: string, data: any) => {
    const response = await client.patch(`/clubs/${clubId}/events/${eventId}`, data);
    return response.data.data.event;
  },

  deleteEvent: async (clubId: string, eventId: string) => {
    await client.delete(`/clubs/${clubId}/events/${eventId}`);
  },

  rsvpEvent: async (clubId: string, eventId: string, data?: any) => {
    const response = await client.post(`/clubs/${clubId}/events/${eventId}/rsvp`, data);
    return response.data.data;
  },

  cancelRsvp: async (clubId: string, eventId: string) => {
    await client.delete(`/clubs/${clubId}/events/${eventId}/rsvp`);
  },

  markAttendance: async (clubId: string, eventId: string, data: { user_id: string, method: string }) => {
    await client.post(`/clubs/${clubId}/events/${eventId}/attend`, data);
  },

  getAttendanceReport: async (clubId: string, eventId: string) => {
    const response = await client.get(`/clubs/${clubId}/events/${eventId}/attendance`);
    return response.data.data;
  },

  scanTicket: async (clubId: string, eventId: string, ticketCode: string) => {
    const response = await client.post(`/clubs/${clubId}/events/${eventId}/scan`, { ticket_code: ticketCode });
    return response.data.data;
  }
};