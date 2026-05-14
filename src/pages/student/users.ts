import client from './client';

export const usersApi = {
  getProfile: async (userId: string) => {
    const response = await client.get(`/users/${userId}`);
    return response.data.data;
  },

  updateProfile: async (userId: string, data: any) => {
    const response = await client.patch(`/users/${userId}`, data);
    return response.data.data;
  },

  updatePreferences: async (userId: string, preferences: any) => {
    const response = await client.patch(`/users/${userId}/preferences`, { notification_preferences: preferences });
    return response.data.data;
  },

  deleteAccount: async (userId: string) => {
    await client.delete(`/users/${userId}`);
  }
};