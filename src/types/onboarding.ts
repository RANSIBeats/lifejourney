export interface OnboardingState {
  step: number;
  northStarGoal: string;
  barriers: string[];
  customBarriers: string[];
  isLoading: boolean;
  error: string | null;
  habits: HabitLayers | null;
}

export interface HabitLayers {
  foundational: Habit[];
  goalSpecific: Habit[];
  barrierTargeting: Habit[];
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  frequency?: string;
}

export interface OnboardingPayload {
  goal: string;
  barriers: string[];
}

export const PRESET_BARRIERS = [
  'Sleep',
  'Focus',
  'Stress',
  'Time Management',
  'Motivation',
  'Energy',
] as const;

export type PresetBarrier = typeof PRESET_BARRIERS[number];
