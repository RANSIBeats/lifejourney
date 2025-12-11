import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  user: UserData | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: UserData) => void;
  setToken: (token: string) => void;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  token: null,

  login: async (email: string, password: string) => {
    // TODO: Implement actual login API call
    try {
      // Mock implementation
      const mockUser: UserData = {
        id: '1',
        email,
        name: email.split('@')[0],
      };
      set({
        isLoggedIn: true,
        user: mockUser,
        token: 'mock_token',
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: () => {
    set({
      isLoggedIn: false,
      user: null,
      token: null,
    });
  },

  setUser: (user: UserData) => {
    set({ user });
  },

  setToken: (token: string) => {
    set({ token });
  },
}));
