import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Habit } from '../types/onboarding';

interface HabitCardProps {
  habit: Habit;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{habit.title}</Text>
      <Text style={styles.description}>{habit.description}</Text>
      {habit.frequency && <Text style={styles.frequency}>{habit.frequency}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  frequency: {
    fontSize: 12,
    color: '#6B4EFF',
    fontWeight: '500',
  },
});
