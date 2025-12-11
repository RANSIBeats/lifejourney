import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session } from '@supabase/supabase-js';
import { authService } from '@services/authService';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  isOnboardingCompleted: boolean;

  // Auth actions
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  refreshSession: () => Promise<void>;

  // Onboarding actions
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;

  // Initialization
  initialize: () => Promise<void>;

  // Internal state management
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  isOnboardingCompleted: false,

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Get current session from Supabase
      const session = await authService.getSession();
      const user = session?.user || null;

      // Check onboarding status if user is logged in
      let isOnboardingCompleted = false;
      if (user) {
        const stored = await AsyncStorage.getItem(
          `${ONBOARDING_COMPLETED_KEY}_${user.id}`
        );
        isOnboardingCompleted = stored === 'true';
      }

      set({
        user,
        session,
        isOnboardingCompleted,
        isInitialized: true,
        isLoading: false,
      });

      // Set up auth state change listener
      authService.onAuthStateChange((session) => {
        set({ session, user: session?.user || null });
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isInitialized: true, isLoading: false });
    }
  },

  signUp: async (email: string, password: string, name?: string) => {
    try {
      set({ isLoading: true, error: null });

      const { user, session, error } = await authService.signUp({
        email,
        password,
        name,
      });

      if (error) {
        throw new Error(error.message);
      }

      set({ user, session, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign up failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const { user, session, error } = await authService.signInWithPassword(
        email,
        password
      );

      if (error) {
        throw new Error(error.message);
      }

      // Check onboarding status
      if (user) {
        const stored = await AsyncStorage.getItem(
          `${ONBOARDING_COMPLETED_KEY}_${user.id}`
        );
        const isOnboardingCompleted = stored === 'true';
        set({ user, session, isOnboardingCompleted, isLoading: false });
      } else {
        set({ user, session, isLoading: false });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign in failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await authService.signOut();

      if (error) {
        throw new Error(error.message);
      }

      set({
        user: null,
        session: null,
        isOnboardingCompleted: false,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign out failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await authService.resetPasswordForEmail(email);

      if (error) {
        throw new Error(error.message);
      }

      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Password reset failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const user = await authService.getCurrentUser();
      set({ user });
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  refreshSession: async () => {
    try {
      const { user, session, error } = await authService.refreshSession();

      if (error) {
        throw new Error(error.message);
      }

      set({ user, session });
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  },

  setOnboardingCompleted: async (completed: boolean) => {
    const { user } = get();
    if (user) {
      await AsyncStorage.setItem(
        `${ONBOARDING_COMPLETED_KEY}_${user.id}`,
        completed.toString()
      );
    }
    set({ isOnboardingCompleted: completed });
  },

  checkOnboardingStatus: async () => {
    const { user } = get();
    if (user) {
      const stored = await AsyncStorage.getItem(
        `${ONBOARDING_COMPLETED_KEY}_${user.id}`
      );
      set({ isOnboardingCompleted: stored === 'true' });
    }
  },

  setUser: (user: User | null) => set({ user }),
  setSession: (session: Session | null) => set({ session }),
  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

export type { User, Session };
