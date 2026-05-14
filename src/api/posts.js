// Adapter for posts API
import api from "../services/api";

export const postsApi = {
  createPost: async (data) => {
    const response = await api.post("/posts", data);
    return response.data.data;
  },

  getPosts: async (params) => {
    const response = await api.get("/posts", { params });
    return response.data.data;
  },

  getPost: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data.data;
  },

  updatePost: async (id, data) => {
    const response = await api.patch(`/posts/${id}`, data);
    return response.data.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
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
