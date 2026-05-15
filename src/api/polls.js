// Adapter for polls API
import api from '../services/api';

export const pollsApi = {
  createPoll: async (data) => {
    const response = await api.post('/polls', data);
    return response.data.data;
  },

  getPoll: async (id) => {
    const response = await api.get(`/polls/${id}`);
    return response.data.data;
  },

  getPollOptions: async (pollId) => {
    const response = await api.get(`/polls/${pollId}/options`);
    return response.data.data;
  },

  votePoll: async (pollId, optionId) => {
    const response = await api.post(`/polls/${pollId}/vote`, { option_id: optionId });
    return response.data.data;
  },
};
