import api from './api';

export const postService = {
  getForClub: async (clubId, params) => {
    const response = await api.get(`/clubs/${clubId}/posts`, { params });
    return response.data;
  },
  
  create: async (clubId, postData) => {
    const response = await api.post(`/clubs/${clubId}/posts`, postData);
    return response.data;
  },
  
  update: async (id, postData) => {
    const response = await api.patch(`/posts/${id}`, postData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  
  interact: async (id, interactionType) => {
    // type: 'like', 'comment', etc.
    const response = await api.post(`/posts/${id}/interact`, { type: interactionType });
    return response.data;
  }
};
