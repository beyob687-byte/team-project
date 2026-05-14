import client from '../pages/student/client';

export const commentsApi = {
  getComments: async (clubId: string, postId: string, params?: { page?: number; limit?: number }) => {
    const response = await client.get(`/clubs/${clubId}/posts/${postId}/comments`, { params });
    return response.data.data;
  },

  createComment: async (clubId: string, postId: string, content: string) => {
    const response = await client.post(`/clubs/${clubId}/posts/${postId}/comments`, { content });
    return response.data.data.comment;
  },

  deleteComment: async (clubId: string, postId: string, commentId: string) => {
    await client.delete(`/clubs/${clubId}/posts/${postId}/comments/${commentId}`);
  },
};