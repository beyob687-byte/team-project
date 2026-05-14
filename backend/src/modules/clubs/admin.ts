import client from '../pages/student/client';

export const adminApi = {
  getDashboard: async () => {
    const response = await client.get('/admin/dashboard');
    return response.data.data;
  },

  listClubs: async (params: any) => {
    const response = await client.get('/admin/clubs', { params });
    return response.data.data;
  },

  updateClubStatus: async (clubId: string, status: string) => {
    const response = await client.patch(`/admin/clubs/${clubId}/status`, { status });
    return response.data.data;
  },

  listRegistrations: async (params: any) => {
    const response = await client.get('/admin/clubs/registrations', { params });
    return response.data.data;
  },

  resolveRegistration: async (clubId: string, action: 'approve' | 'reject', notes?: string) => {
    const response = await client.patch(`/admin/clubs/${clubId}/registration`, { action, notes });
    return response.data.data;
  },

  listUsers: async (params: any) => {
    const response = await client.get('/admin/users', { params });
    return response.data.data;
  }
};