import { create } from 'zustand';

interface AppState {
  isOnboardingCompleted: boolean;
  theme: 'dark' | 'light';
  setOnboardingCompleted: (completed: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnboardingCompleted: false,
  theme: 'dark',

  setOnboardingCompleted: (completed: boolean) => {
    set({ isOnboardingCompleted: completed });
  },

  setTheme: (theme: 'dark' | 'light') => {
    set({ theme });
  },
}));
