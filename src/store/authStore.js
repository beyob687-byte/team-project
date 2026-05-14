import { create } from 'zustand';
import { USERS } from '../utils/mockData';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  checkAuth: () => {
    set({ isLoading: true, error: null });
    // Simulate local storage check
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      set({ user: JSON.parse(savedUser), isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate lag

    const mockUser = credentials.email === 'admin@aau.edu.et' ? USERS.admin : USERS.abebe;
    
    if (credentials.password) {
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      return true;
    }
    set({ error: 'Invalid credentials', isLoading: false });
    return false;
  },

  register: async (credentials) => {
    set({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = {
      ...USERS.abebe,
      email: credentials.email,
    };
    set({ user: newUser, isAuthenticated: true, isLoading: false });
    localStorage.setItem('mock_user', JSON.stringify(newUser));
    return true;
  },

  logout: () => {
    localStorage.removeItem('mock_user');
    set({ user: null, isAuthenticated: false });
  },
  
  hasRole: (roleName) => {
    const user = get().user;
    if (!user) return false;
    // Assuming user roles are stored in user.roles or similar array
    return user.roles?.includes(roleName) || user.role === roleName;
  }
}));

export default useAuthStore;
