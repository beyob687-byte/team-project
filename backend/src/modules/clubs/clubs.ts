import client from '../pages/student/client';

export const clubsApi = {
  getClubs: async (params: { category?: string; search?: string; page?: number; limit?: number }) => {
    const response = await client.get('/clubs', { params });
    return response.data.data;
  },

  getClub: async (clubId: string) => {
    const response = await client.get(`/clubs/${clubId}`);
    return response.data.data.club;
  },

  getMyMembership: async (clubId: string) => {
    const response = await client.get(`/clubs/${clubId}/my-membership`);
    return response.data.data.membership;
  },

  joinClub: async (clubId: string) => {
    const response = await client.post(`/clubs/${clubId}/join`);
    return response.data.data;
  },

  registerClub: async (data: any) => {
    const response = await client.post('/clubs/register', data);
    return response.data.data;
  },

  // Officer Actions
  getClubManage: async (clubId: string) => {
    const response = await client.get(`/clubs/${clubId}/manage`);
    return response.data.data;
  },

  updateClubProfile: async (clubId: string, data: any) => {
    const response = await client.patch(`/clubs/${clubId}/profile`, data);
    return response.data.data.club;
  },

  getMembers: async (clubId: string, params: any) => {
    const response = await client.get(`/clubs/${clubId}/members`, { params });
    return response.data.data;
  },

  uploadMedia: async (clubId: string, formData: FormData) => {
    const response = await client.post(`/clubs/${clubId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data.media;
  }
};