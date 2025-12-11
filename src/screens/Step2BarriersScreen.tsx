import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useOnboardingStore } from '../store/onboardingStore';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { PRESET_BARRIERS } from '../types/onboarding';
import { validateBarriers } from '../utils/validation';

export const Step2BarriersScreen: React.FC = () => {
  const {
    barriers,
    customBarriers,
    toggleBarrier,
    addCustomBarrier,
    removeCustomBarrier,
    nextStep,
    prevStep,
  } = useOnboardingStore();

  const [customInput, setCustomInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    const validationError = validateBarriers(barriers, customBarriers);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    nextStep();
  };

  const handleAddCustom = () => {
    if (customInput.trim()) {
      addCustomBarrier(customInput);
      setCustomInput('');
      if (error) setError(null);
    }
  };

  const handleToggleBarrier = (barrier: string) => {
    toggleBarrier(barrier);
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
          <Text style={styles.emoji}>🚧</Text>
          <Text style={styles.title}>What's getting in your way?</Text>
          <Text style={styles.subtitle}>
            Select any barriers or challenges you're facing. Choose from our list or add your
            own!
          </Text>

          <View style={styles.chipsContainer}>
            {PRESET_BARRIERS.map((barrier) => (
              <Chip
                key={barrier}
                label={barrier}
                selected={barriers.includes(barrier)}
                onPress={() => handleToggleBarrier(barrier)}
              />
            ))}
          </View>

          {customBarriers.length > 0 && (
            <View style={styles.customSection}>
              <Text style={styles.sectionTitle}>Your custom barriers:</Text>
              <View style={styles.chipsContainer}>
                {customBarriers.map((barrier, index) => (
                  <Chip
                    key={`custom-${index}`}
                    label={barrier}
                    selected={true}
                    onPress={() => {}}
                    onRemove={() => removeCustomBarrier(barrier)}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add your own barrier..."
              placeholderTextColor="#999"
              value={customInput}
              onChangeText={setCustomInput}
              onSubmitEditing={handleAddCustom}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddCustom}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.hint}>
            Selected: {barriers.length + customBarriers.length} barrier(s)
          </Text>
        </View>

        <View style={styles.footer}>
          <Button title="Back" onPress={prevStep} variant="secondary" />
          <View style={styles.spacing} />
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  customSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F9F9F9',
  },
  addButton: {
    marginLeft: 12,
    backgroundColor: '#6B4EFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    flexDirection: 'row',
  },
  spacing: {
    width: 16,
  },
});
