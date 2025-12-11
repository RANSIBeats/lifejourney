export interface OnboardingState {
  step: number;
  northStarGoal: string;
  barriers: string[];
  customBarriers: string[];
  isLoading: boolean;
  error: string | null;
  habits: HabitLayers | null;
  journey: JourneyPlan | null;
  isOnboardingComplete: boolean;
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

export interface JourneyPlan {
  id: string;
  name: string;
  startDate: string;
  phases: JourneyPhase[];
}

export interface JourneyPhase {
  id: string;
  name: string;
  summary: string;
  status: PhaseStatus;
  startDate: string;
  endDate: string;
  habitCount: number;
  habits: Habit[];
}

export type PhaseStatus = 'locked' | 'current' | 'completed';

export const JOURNEY_PHASES: Omit<JourneyPhase, 'status' | 'startDate' | 'endDate' | 'habitCount' | 'habits'>[] = [
  {
    id: 'reset-rebuild',
    name: 'Reset & Rebuild',
    summary: 'Foundation building and habit establishment',
  },
  {
    id: 'build-momentum',
    name: 'Build Momentum',
    summary: 'Strengthening routines and overcoming obstacles',
  },
  {
    id: 'polish-prepare',
    name: 'Polish & Prepare',
    summary: 'Refining habits and preparing for next level',
  },
  {
    id: 'ready-window',
    name: 'Ready Window',
    summary: 'Peak performance and goal achievement',
  },
];

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
