import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import theme from '@themes/index';
import { useAppStore } from '@store/appStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingStart'>;

const OnboardingScreen: React.FC<Props> = () => {
  const setOnboardingCompleted = useAppStore((state) => state.setOnboardingCompleted);

  const handleCompleteOnboarding = () => {
    setOnboardingCompleted(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Your Journey</Text>
          <Text style={styles.subtitle}>
            Discover amazing experiences and connect with people who share your passions
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <FeatureCard
            title="Explore"
            description="Find and discover new journeys tailored to your interests"
            icon="🗺️"
          />
          <FeatureCard
            title="Connect"
            description="Meet like-minded people and build meaningful relationships"
            icon="👥"
          />
          <FeatureCard
            title="Track Progress"
            description="Keep track of your achievements and growth along the way"
            icon="📊"
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleCompleteOnboarding}
          >
            <Text style={styles.startButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.body.lineHeight,
  },
  featuresContainer: {
    marginBottom: theme.spacing.xxl,
  },
  featureCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  featureDescription: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.bodySmall.lineHeight,
  },
  footer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  startButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
