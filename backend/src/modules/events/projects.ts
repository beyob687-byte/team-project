import client from '../pages/student/client';

export const projectsApi = {
  getProjects: async (clubId: string, params?: any) => {
    const response = await client.get(`/clubs/${clubId}/projects`, { params });
    return response.data.data;
  },

  getProject: async (clubId: string, projectId: string) => {
    const response = await client.get(`/clubs/${clubId}/projects/${projectId}`);
    return response.data.data;
  },

  createProject: async (clubId: string, formData: FormData) => {
    const response = await client.post(`/clubs/${clubId}/projects`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data.project;
  },

  updateProject: async (clubId: string, projectId: string, data: any) => {
    const response = await client.patch(`/clubs/${clubId}/projects/${projectId}`, data);
    return response.data.data.project;
  },

  deleteProject: async (clubId: string, projectId: string) => {
    await client.delete(`/clubs/${clubId}/projects/${projectId}`);
  },

  toggleLikeProject: async (clubId: string, projectId: string) => {
    const response = await client.post(`/clubs/${clubId}/projects/${projectId}/like`);
    return response.data.data;
  },

  uploadMedia: async (clubId: string, projectId: string, formData: FormData) => {
    const response = await client.post(`/clubs/${clubId}/projects/${projectId}/media`, formData);
    return response.data.data.media;
  }
};