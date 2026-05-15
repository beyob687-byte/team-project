import { create } from 'zustand';
import { authApi } from '../pages/student/auth'; // Corrected import path

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false, // Start as false
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  loginUser: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Invalid credentials';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  signupUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.signup(data);
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logoutUser: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
  
  hasRole: (roleName) => {
    const user = get().user;
    if (!user) return false;
    return user.roles?.includes(roleName) || user.role === roleName;
  },

  checkAuth: async () => {
    const { fetchUser } = get();
    if (fetchUser) {
      await fetchUser();
    }
  },
}));

export default useAuthStore;
