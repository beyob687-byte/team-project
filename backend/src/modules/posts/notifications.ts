import client from '../pages/student/client';

export const notificationsApi = {
  getNotifications: async (params?: { page?: number; limit?: number }) => {
    const response = await client.get('/notifications', { params });
    return response.data.data;
  },

  markAsRead: async (notificationId: number) => {
    const response = await client.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await client.patch('/notifications/read-all');
    return response.data;
  },
};