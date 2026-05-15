// Adapter for posts API
import api from "../services/api";

export const postsApi = {
  createPost: async (clubId, data) => {
    const response = await api.post(`/clubs/${clubId}/posts`, data);
    return response.data.data;
  },

  getPosts: async (clubId, params) => {
    const response = await api.get(`/clubs/${clubId}/posts`, { params });
    return response.data.data;
  },

  getPost: async (clubId, postId) => {
    const response = await api.get(`/clubs/${clubId}/posts/${postId}`);
    return response.data.data;
  },

  updatePost: async (clubId, postId, data) => {
    const response = await api.patch(`/clubs/${clubId}/posts/${postId}`, data);
    return response.data.data;
  },

  deletePost: async (clubId, postId) => {
    const response = await api.delete(`/clubs/${clubId}/posts/${postId}`);
    return response.data;
  },
};

export const commentsApi = {
  createComment: async (postId, data) => {
    const response = await api.post(`/posts/${postId}/comments`, data);
    return response.data.data;
  },

  getComments: async (postId) => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data.data;
  },
};
