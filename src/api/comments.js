// Adapter for post comments API
import api from "../services/api";

export const commentsApi = {
  getComments: async (clubId, postId, params = {}) => {
    const response = await api.get(
      `/clubs/${clubId}/posts/${postId}/comments`,
      { params },
    );
    return response.data.data;
  },

  createComment: async (clubId, postId, content) => {
    const response = await api.post(
      `/clubs/${clubId}/posts/${postId}/comments`,
      { content },
    );
    return response.data.data;
  },

  deleteComment: async (clubId, postId, commentId) => {
    const response = await api.delete(
      `/clubs/${clubId}/posts/${postId}/comments/${commentId}`,
    );
    return response.data.data;
  },
};
