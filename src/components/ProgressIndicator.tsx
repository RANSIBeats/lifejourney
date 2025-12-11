import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  totalSteps,
  currentStep,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index + 1 === currentStep && styles.activeDot,
            index + 1 < currentStep && styles.completedDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    backgroundColor: '#6B4EFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completedDot: {
    backgroundColor: '#9C87FF',
  },
});
