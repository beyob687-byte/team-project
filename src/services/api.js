import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle common errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can hook into your auth store here if needed to force a logout
    // or trigger a toast notification for 500 errors.
    if (error.response?.status === 401) {
      // e.g. useAuthStore.getState().logout()
    }
    return Promise.reject(error);
  }
);

export default api;
