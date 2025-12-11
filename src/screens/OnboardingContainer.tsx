import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useOnboardingStore } from '../store/onboardingStore';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { Step1GoalScreen } from './Step1GoalScreen';
import { Step2BarriersScreen } from './Step2BarriersScreen';
import { Step3HabitsScreen } from './Step3HabitsScreen';

export const OnboardingContainer: React.FC = () => {
  const { step, loadFromStorage } = useOnboardingStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1GoalScreen />;
      case 2:
        return <Step2BarriersScreen />;
      case 3:
        return <Step3HabitsScreen />;
      default:
        return <Step1GoalScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressIndicator totalSteps={3} currentStep={step} />
      <View style={styles.content}>{renderStep()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});
