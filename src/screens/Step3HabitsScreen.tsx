import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useOnboardingStore } from '../store/onboardingStore';
import { Button } from '../components/Button';
import { HabitCard } from '../components/HabitCard';

export const Step3HabitsScreen: React.FC = () => {
  const { habits, isLoading, error, submitOnboarding, prevStep, completeOnboarding } =
    useOnboardingStore();

  useEffect(() => {
    if (!habits && !isLoading && !error) {
      submitOnboarding();
    }
  }, []);

  const handleComplete = () => {
    completeOnboarding();
  };

  const handleRetry = () => {
    submitOnboarding();
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6B4EFF" />
        <Text style={styles.loadingText}>Generating your personalized habits...</Text>
        <Text style={styles.loadingSubtext}>This may take a few moments</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <View style={styles.errorButtons}>
          <Button title="Go Back" onPress={prevStep} variant="secondary" />
          <View style={styles.spacing} />
          <Button title="Try Again" onPress={handleRetry} />
        </View>
      </View>
    );
  }

  if (!habits) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Your Personalized Habit Plan</Text>
        <Text style={styles.subtitle}>
          We've created a 3-layer habit system tailored just for you!
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🏗️</Text>
          <Text style={styles.sectionTitle}>Foundational Habits</Text>
        </View>
        <Text style={styles.sectionDescription}>
          These core habits will build your overall well-being
        </Text>
        {habits.foundational.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🎯</Text>
          <Text style={styles.sectionTitle}>Goal-Specific Habits</Text>
        </View>
        <Text style={styles.sectionDescription}>
          These habits directly support your North Star goal
        </Text>
        {habits.goalSpecific.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </View>

      {habits.barrierTargeting.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🚀</Text>
            <Text style={styles.sectionTitle}>Barrier-Targeting Habits</Text>
          </View>
          <Text style={styles.sectionDescription}>
            These habits help you overcome your specific challenges
          </Text>
          {habits.barrierTargeting.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Button title="Get Started!" onPress={handleComplete} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  errorButtons: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  footer: {
    marginTop: 16,
    marginBottom: 32,
  },
  spacing: {
    width: 16,
  },
});
