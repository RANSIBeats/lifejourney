import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { OnboardingContainer } from './src/screens/OnboardingContainer';
import { JourneyScreen } from './src/screens/JourneyScreen';
import { useOnboardingStore } from './src/store/onboardingStore';

export default function App() {
  const { isOnboardingComplete, loadFromStorage } = useOnboardingStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <>
      {isOnboardingComplete ? <JourneyScreen /> : <OnboardingContainer />}
      <StatusBar style="auto" />
    </>
  );
}
