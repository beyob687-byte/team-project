import client from '../pages/student/client';

export const postsApi = {
  getPosts: async (clubId: string, params?: { page?: number; limit?: number; type?: string }) => {
    const response = await client.get(`/clubs/${clubId}/posts`, { params });
    return response.data.data;
  },

  getPost: async (clubId: string, postId: string) => {
    const response = await client.get(`/clubs/${clubId}/posts/${postId}`);
    return response.data.data.post;
  },

  createPost: async (clubId: string, formData: FormData) => {
    const response = await client.post(`/clubs/${clubId}/posts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.post;
  },

  updatePost: async (clubId: string, postId: string, data: any) => {
    const response = await client.patch(`/clubs/${clubId}/posts/${postId}`, data);
    return response.data.data.post;
  },

  deletePost: async (clubId: string, postId: string) => {
    await client.delete(`/clubs/${clubId}/posts/${postId}`);
  },
};