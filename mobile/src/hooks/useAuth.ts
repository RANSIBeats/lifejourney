import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../services/api';
import { authStorage } from '../storage/authStorage';
import { AuthResponse, LoginCredentials, RegisterData } from '../types';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const queryClient = useQueryClient();

  // Check for existing auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await authStorage.getToken();
      const storedUser = await authStorage.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
    onSuccess: async (response: AuthResponse) => {
      const { user: userData, token: authToken } = response;
      
      await authStorage.saveToken(authToken);
      await authStorage.saveUser(userData);
      
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData) => authAPI.register(userData),
    onSuccess: async (response: AuthResponse) => {
      const { user: newUser, token: authToken } = response;
      
      await authStorage.saveToken(authToken);
      await authStorage.saveUser(newUser);
      
      setToken(authToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Logout function
  const logout = async () => {
    try {
      await authStorage.removeToken();
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      queryClient.clear(); // Clear all cached data
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authAPI.forgotPassword(email),
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authAPI.resetPassword(token, newPassword),
  });

  return {
    // State
    isAuthenticated,
    user,
    token,
    
    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isSendingResetEmail: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    
    // Error states
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    forgotPasswordError: forgotPasswordMutation.error,
    resetPasswordError: resetPasswordMutation.error,
    
    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    sendResetEmail: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    
    // Success flags
    isLoginSuccess: loginMutation.isSuccess,
    isRegisterSuccess: registerMutation.isSuccess,
    isForgotPasswordSuccess: forgotPasswordMutation.isSuccess,
    isResetPasswordSuccess: resetPasswordMutation.isSuccess,
    
    // Reset functions
    resetLoginState: loginMutation.reset,
    resetRegisterState: registerMutation.reset,
    resetForgotPasswordState: forgotPasswordMutation.reset,
    resetResetPasswordState: resetPasswordMutation.reset,
  };
};