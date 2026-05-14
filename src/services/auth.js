import api from './api';

// Mock Auth Service for Frontend Development
export const authService = {
  login: async (credentials) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const email = credentials.email.toLowerCase();
    
    // Assign role based on email input
    let role = 'Student';
    let roles = ['Student'];
    
    if (email.includes('admin')) {
      role = 'University Admin';
      roles = ['University Admin', 'Student'];
    } else if (email.includes('officer')) {
      role = 'Officer';
      roles = ['Officer', 'Student'];
    }

    const user = {
      id: 'mock_user_1',
      name: email.split('@')[0],
      email: email,
      role: role,
      roles: roles,
      avatar: null,
      major: 'Computer Science',
      studentId: '10012345'
    };

    // Store in localStorage to persist across page reloads in mock environment
    localStorage.setItem('mock_user', JSON.stringify(user));

    return { user };
  },
  
  // Mock register function
  register: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const email = credentials.email.toLowerCase();
    
    let role = 'Student';
    let roles = ['Student'];
    if (email.includes('admin')) {
      role = 'University Admin';
      roles = ['University Admin', 'Student'];
    } else if (email.includes('officer')) {
      role = 'Officer';
      roles = ['Officer', 'Student'];
    }

    const user = {
      id: `mock_user_${Date.now()}`,
      name: credentials.name || email.split('@')[0],
      email: email,
      role: role,
      roles: roles,
      avatar: null,
      major: 'Undeclared',
      studentId: 'New Student'
    };

    localStorage.setItem('mock_user', JSON.stringify(user));
    return { user };
  },

  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    localStorage.removeItem('mock_user');
    return { success: true };
  },
  
  getCurrentUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const storedUser = localStorage.getItem('mock_user');
    
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    throw new Error('Not authenticated');
  }
};
