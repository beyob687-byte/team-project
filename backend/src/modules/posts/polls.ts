import client from '../pages/student/client';

export const pollsApi = {
  votePoll: async (clubId: string, postId: string, optionId: string) => {
    const response = await client.post(`/clubs/${clubId}/posts/${postId}/vote`, { option_id: optionId });
    return response.data;
  },

  getPollResults: async (clubId: string, postId: string) => {
    // The backend returns poll data directly in the post object,
    // but the prompt specifies a separate endpoint for poll results.
    // Assuming this endpoint returns the poll object directly.
    const response = await client.get(`/clubs/${clubId}/posts/${postId}/poll`);
    return response.data.data;
  },
};