import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from '@navigation/RootNavigator';
import { useAuthStore } from '@store/authStore';
import { useAppStore } from '@store/appStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    },
  },
});

export default function App() {
  const initializeApp = async () => {
    try {
      // TODO: Load persisted auth state from storage
      // await loadAuthState();
      // await loadAppState();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      await SplashScreen.hideAsync();
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
