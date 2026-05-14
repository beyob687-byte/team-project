import { create } from 'zustand';

// Safely get theme from localStorage or fallback to system preference
const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    // Fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light'; // Light is now the absolute default if no system pref
  } catch (e) {
    return 'dark'; // Fallback for incognito/blocked localstorage
  }
};

const useUiStore = create((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  openSidebar: () => set({ sidebarOpen: true }),

  theme: getInitialTheme(),

  setTheme: (newTheme) => {
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.warn("Could not save theme to localStorage", e);
    }
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    set({ theme: newTheme });
  },

  toggleTheme: () => {
    const current = useUiStore.getState().theme;
    useUiStore.getState().setTheme(current === 'dark' ? 'light' : 'dark');
  }
}));

// Apply saved theme on first load (hydration safety, though index.html handles initial render)
if (getInitialTheme() === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export default useUiStore;

