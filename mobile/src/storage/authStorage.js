import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'user',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  APP_SETTINGS: 'appSettings',
};

// Auth storage functions
export const authStorage = {
  async saveToken(token: string) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
      throw error;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  async removeToken() {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
    } catch (error) {
      console.error('Error removing auth data:', error);
      throw error;
    }
  },

  async saveUser(userData: any) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  async getUser() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },
};

// App settings storage
export const settingsStorage = {
  async saveSettings(settings: any) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving app settings:', error);
      throw error;
    }
  },

  async getSettings() {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Error getting app settings:', error);
      return {};
    }
  },
};

// Onboarding storage
export const onboardingStorage = {
  async setCompleted(completed: boolean = true) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      throw error;
    }
  },

  async isCompleted() {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return completed ? JSON.parse(completed) : false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },
};

// Clear all app data
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      STORAGE_KEYS.APP_SETTINGS,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};