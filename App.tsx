import { StatusBar } from 'expo-status-bar';
import { OnboardingContainer } from './src/screens/OnboardingContainer';

export default function App() {
  return (
    <>
      <OnboardingContainer />
      <StatusBar style="auto" />
    </>
  );
}
