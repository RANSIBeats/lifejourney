import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useOnboardingStore } from '../store/onboardingStore';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { Button } from '../components/Button';

export const JourneyScreen: React.FC = () => {
  const { journey, isOnboardingComplete, resetOnboarding } = useOnboardingStore();

  if (!isOnboardingComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Complete Onboarding First</Text>
          <Text style={styles.subtitle}>
            You need to complete the onboarding process to view your journey.
          </Text>
          <Button
            title="Restart Onboarding"
            onPress={resetOnboarding}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!journey) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>No Journey Found</Text>
          <Text style={styles.subtitle}>
            There was an issue loading your journey plan.
          </Text>
          <Button
            title="Restart Onboarding"
            onPress={resetOnboarding}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{journey.name}</Text>
          <Text style={styles.subtitle}>
            Started {new Date(journey.startDate).toLocaleDateString()}
          </Text>
        </View>
        
        <JourneyTimeline phases={journey.phases} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E20',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A1A1A8',
  },
});