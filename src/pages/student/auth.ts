import client from './client';

export const authApi = {
  signup: async (data: any) => {
    const response = await client.post('/auth/signup', data);
    return response.data.data.user;
  },
  
  login: async (credentials: any) => {
    const response = await client.post('/auth/login', credentials);
    return response.data.data.user;
  },
  
  logout: async () => {
    const response = await client.post('/auth/logout');
    return response.data;
  },
  
  refresh: async () => {
    const response = await client.post('/auth/refresh');
    return response.data;
  },
  
  getMe: async () => {
    const response = await client.get('/auth/me');
    return response.data.data.user;
  }
};