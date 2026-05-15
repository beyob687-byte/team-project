import api from "../services/api";

export const adminClubsApi = {
  getRegistrations: async (params = {}) => {
    const response = await api.get("/admin/clubs/registrations", { params });
    return response.data?.data?.items || [];
  },

  resolveRegistration: async (clubId, action, notes = null) => {
    const response = await api.patch(`/admin/clubs/${clubId}/registration`, {
      action,
      notes,
    });
    return response.data?.data || response.data;
  },
};

export default adminClubsApi;
