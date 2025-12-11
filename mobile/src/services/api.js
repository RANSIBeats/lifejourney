import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove from storage and redirect to login
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const goalsAPI = {
  getGoals: () => api.get('/goals'),
  createGoal: (goalData) => api.post('/goals', goalData),
  updateGoal: (id, goalData) => api.put(`/goals/${id}`, goalData),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
  getGoal: (id) => api.get(`/goals/${id}`),
};

export const habitsAPI = {
  getHabits: () => api.get('/habits'),
  getActiveHabits: () => api.get('/habits/active'),
  createHabit: (habitData) => api.post('/habits', habitData),
  updateHabit: (id, habitData) => api.put(`/habits/${id}`, habitData),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
  toggleHabit: (id) => api.patch(`/habits/${id}/toggle`),
};

export const progressAPI = {
  getTodayProgress: () => api.get('/progress/today'),
  updateHabitProgress: (habitId, progressData) => api.patch(`/progress/habits/${habitId}`, progressData),
  getHabitHistory: (habitId, params) => api.get(`/progress/habits/${habitId}/history`, { params }),
  getProgressStats: (habitId, params) => api.get(`/progress/habits/${habitId}/stats`, { params }),
  bulkUpdate: (updates) => api.post('/progress/bulk', { updates }),
};