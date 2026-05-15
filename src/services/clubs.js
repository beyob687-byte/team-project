import api from "./api";

export const clubService = {
  getAll: async (params) => {
    const response = await api.get("/clubs", { params });
    // API returns { success: true, data: { items: [...], pagination: {...} } }
    return (
      response.data?.data?.items || response.data?.data || response.data || []
    );
  },

  getById: async (id) => {
    const response = await api.get(`/clubs/${id}`);
    return response.data?.data?.club || response.data?.data || response.data;
  },

  getMyMembership: async (id) => {
    const response = await api.get(`/clubs/${id}/my-membership`);
    return (
      response.data?.data?.membership || response.data?.data || response.data
    );
  },

  create: async (clubData) => {
    // Backend expects club registrations at POST /clubs/register
    const response = await api.post("/clubs/register", clubData);
    return response.data?.data || response.data;
  },

  update: async (id, clubData) => {
    const response = await api.patch(`/clubs/${id}`, clubData);
    return response.data;
  },

  joinRequest: async (id) => {
    const response = await api.post(`/clubs/${id}/join`);
    return response.data;
  },
};
