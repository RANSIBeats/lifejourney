import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useOnboardingStore } from '../store/onboardingStore';
import { Button } from '../components/Button';
import { validateNorthStarGoal } from '../utils/validation';

export const Step1GoalScreen: React.FC = () => {
  const { northStarGoal, setNorthStarGoal, nextStep } = useOnboardingStore();
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    const validationError = validateNorthStarGoal(northStarGoal);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    nextStep();
  };

  const handleGoalChange = (text: string) => {
    setNorthStarGoal(text);
    if (error) setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>🎯</Text>
          <Text style={styles.title}>What's your North Star goal?</Text>
          <Text style={styles.subtitle}>
            This is your big-picture aspiration—what you're working toward. Don't worry, you
            can refine it anytime!
          </Text>

          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="e.g., Run a marathon, Launch my business, Learn Spanish..."
            placeholderTextColor="#999"
            value={northStarGoal}
            onChangeText={handleGoalChange}
            multiline
            numberOfLines={3}
            maxLength={200}
            autoFocus
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.characterCount}>
            {northStarGoal.length} / 200 characters
          </Text>
        </View>

        <View style={styles.footer}>
          <Button title="Next" onPress={handleNext} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 24,
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
    marginBottom: 32,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F9F9F9',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
  },
});
