import { act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../authStore';
import * as authService from '../../services/authService';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../services/authService');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockAuthService = authService.authService as jest.Mocked<
  typeof authService.authService
>;

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2023-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: { name: 'Test User' },
};

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: mockUser,
};

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      isOnboardingCompleted: false,
    });

    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);

    mockAuthService.getSession.mockResolvedValue(null);
    mockAuthService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any);
  });

  describe('initialize', () => {
    it('should initialize with no session', async () => {
      mockAuthService.getSession.mockResolvedValue(null);

      await act(async () => {
        await useAuthStore.getState().initialize();
      });

      const state = useAuthStore.getState();
      expect(state.isInitialized).toBe(true);
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should initialize with existing session', async () => {
      mockAuthService.getSession.mockResolvedValue(mockSession);
      mockAsyncStorage.getItem.mockResolvedValue('true');

      await act(async () => {
        await useAuthStore.getState().initialize();
      });

      const state = useAuthStore.getState();
      expect(state.isInitialized).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.isOnboardingCompleted).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      mockAuthService.getSession.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        await useAuthStore.getState().initialize();
      });

      const state = useAuthStore.getState();
      expect(state.isInitialized).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      mockAuthService.signUp.mockResolvedValue({
        user: mockUser,
        session: mockSession,
        error: null,
      });

      await act(async () => {
        await useAuthStore.getState().signUp('test@example.com', 'password123', 'Test User');
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should handle sign up errors', async () => {
      const errorMessage = 'Email already exists';
      mockAuthService.signUp.mockResolvedValue({
        user: null,
        session: null,
        error: { message: errorMessage } as any,
      });

      await act(async () => {
        try {
          await useAuthStore.getState().signUp('test@example.com', 'password123');
        } catch (error) {
          // Expected error
        }
      });

      const state = useAuthStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      mockAuthService.signInWithPassword.mockResolvedValue({
        user: mockUser,
        session: mockSession,
        error: null,
      });
      mockAsyncStorage.getItem.mockResolvedValue('false');

      await act(async () => {
        await useAuthStore.getState().signIn('test@example.com', 'password123');
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should check onboarding status on sign in', async () => {
      mockAuthService.signInWithPassword.mockResolvedValue({
        user: mockUser,
        session: mockSession,
        error: null,
      });
      mockAsyncStorage.getItem.mockResolvedValue('true');

      await act(async () => {
        await useAuthStore.getState().signIn('test@example.com', 'password123');
      });

      const state = useAuthStore.getState();
      expect(state.isOnboardingCompleted).toBe(true);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        `onboarding_completed_${mockUser.id}`
      );
    });

    it('should handle sign in errors', async () => {
      const errorMessage = 'Invalid credentials';
      mockAuthService.signInWithPassword.mockResolvedValue({
        user: null,
        session: null,
        error: { message: errorMessage } as any,
      });

      await act(async () => {
        try {
          await useAuthStore.getState().signIn('test@example.com', 'wrongpassword');
        } catch (error) {
          // Expected error
        }
      });

      const state = useAuthStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      useAuthStore.setState({
        user: mockUser,
        session: mockSession,
        isOnboardingCompleted: true,
      });

      mockAuthService.signOut.mockResolvedValue({ error: null });

      await act(async () => {
        await useAuthStore.getState().signOut();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isOnboardingCompleted).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle sign out errors', async () => {
      const errorMessage = 'Sign out failed';
      mockAuthService.signOut.mockResolvedValue({
        error: { message: errorMessage } as any,
      });

      await act(async () => {
        try {
          await useAuthStore.getState().signOut();
        } catch (error) {
          // Expected error
        }
      });

      const state = useAuthStore.getState();
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      mockAuthService.resetPasswordForEmail.mockResolvedValue({ error: null });

      await act(async () => {
        await useAuthStore.getState().resetPassword('test@example.com');
      });

      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(mockAuthService.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle password reset errors', async () => {
      const errorMessage = 'Invalid email';
      mockAuthService.resetPasswordForEmail.mockResolvedValue({
        error: { message: errorMessage } as any,
      });

      await act(async () => {
        try {
          await useAuthStore.getState().resetPassword('invalid@example.com');
        } catch (error) {
          // Expected error
        }
      });

      const state = useAuthStore.getState();
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      await act(async () => {
        const user = await useAuthStore.getState().getCurrentUser();
        expect(user).toEqual(mockUser);
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });

    it('should handle get current user errors', async () => {
      mockAuthService.getCurrentUser.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        const user = await useAuthStore.getState().getCurrentUser();
        expect(user).toBeNull();
      });
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      mockAuthService.refreshSession.mockResolvedValue({
        user: mockUser,
        session: mockSession,
        error: null,
      });

      await act(async () => {
        await useAuthStore.getState().refreshSession();
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
    });

    it('should handle refresh session errors', async () => {
      mockAuthService.refreshSession.mockResolvedValue({
        user: null,
        session: null,
        error: { message: 'Token expired' } as any,
      });

      await act(async () => {
        await useAuthStore.getState().refreshSession();
      });

      // Should not throw, just log error
      expect(mockAuthService.refreshSession).toHaveBeenCalled();
    });
  });

  describe('setOnboardingCompleted', () => {
    it('should set onboarding completed', async () => {
      useAuthStore.setState({ user: mockUser });

      await act(async () => {
        await useAuthStore.getState().setOnboardingCompleted(true);
      });

      const state = useAuthStore.getState();
      expect(state.isOnboardingCompleted).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `onboarding_completed_${mockUser.id}`,
        'true'
      );
    });

    it('should not save to AsyncStorage if no user', async () => {
      await act(async () => {
        await useAuthStore.getState().setOnboardingCompleted(true);
      });

      const state = useAuthStore.getState();
      expect(state.isOnboardingCompleted).toBe(true);
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('checkOnboardingStatus', () => {
    it('should check onboarding status', async () => {
      useAuthStore.setState({ user: mockUser });
      mockAsyncStorage.getItem.mockResolvedValue('true');

      await act(async () => {
        await useAuthStore.getState().checkOnboardingStatus();
      });

      const state = useAuthStore.getState();
      expect(state.isOnboardingCompleted).toBe(true);
    });

    it('should handle no stored status', async () => {
      useAuthStore.setState({ user: mockUser });
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await act(async () => {
        await useAuthStore.getState().checkOnboardingStatus();
      });

      const state = useAuthStore.getState();
      expect(state.isOnboardingCompleted).toBe(false);
    });
  });
});
