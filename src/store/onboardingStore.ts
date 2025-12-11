import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingState, OnboardingPayload, HabitLayers, JourneyPlan, JourneyPhase, JOURNEY_PHASES, PhaseStatus } from '../types/onboarding';
import { generateHabits } from '../api/habits';

const STORAGE_KEY = '@onboarding_state';

// Helper function to distribute habits across phases
const getHabitsForPhase = (habits: HabitLayers, phaseIndex: number): Habit[] => {
  const allHabits = [
    ...habits.foundational,
    ...habits.goalSpecific,
    ...habits.barrierTargeting,
  ];

  switch (phaseIndex) {
    case 0: // Reset & Rebuild - focus on foundational habits
      return habits.foundational.slice(0, Math.ceil(habits.foundational.length * 0.6));
    case 1: // Build Momentum - foundational + some goal-specific
      return [
        ...habits.foundational.slice(Math.ceil(habits.foundational.length * 0.6)),
        ...habits.goalSpecific.slice(0, Math.ceil(habits.goalSpecific.length * 0.7)),
      ];
    case 2: // Polish & Prepare - goal-specific + barrier targeting
      return [
        ...habits.goalSpecific.slice(Math.ceil(habits.goalSpecific.length * 0.7)),
        ...habits.barrierTargeting.slice(0, Math.ceil(habits.barrierTargeting.length * 0.8)),
      ];
    case 3: // Ready Window - all remaining habits
      return [
        ...habits.barrierTargeting.slice(Math.ceil(habits.barrierTargeting.length * 0.8)),
      ];
    default:
      return [];
  }
};

interface OnboardingActions {
  setStep: (step: number) => void;
  setNorthStarGoal: (goal: string) => void;
  toggleBarrier: (barrier: string) => void;
  addCustomBarrier: (barrier: string) => void;
  removeCustomBarrier: (barrier: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitOnboarding: () => Promise<void>;
  createJourneyPlan: (habits: HabitLayers) => void;
  updatePhaseStatus: (phaseId: string, status: PhaseStatus) => void;
  completeOnboarding: () => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  resetOnboarding: () => void;
}

const initialState: OnboardingState = {
  step: 1,
  northStarGoal: '',
  barriers: [],
  customBarriers: [],
  isLoading: false,
  error: null,
  habits: null,
  journey: null,
  isOnboardingComplete: false,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>((set, get) => ({
  ...initialState,

  setStep: (step: number) => {
    set({ step });
    get().saveToStorage();
  },

  setNorthStarGoal: (goal: string) => {
    set({ northStarGoal: goal, error: null });
    get().saveToStorage();
  },

  toggleBarrier: (barrier: string) => {
    const { barriers } = get();
    const newBarriers = barriers.includes(barrier)
      ? barriers.filter((b) => b !== barrier)
      : [...barriers, barrier];
    set({ barriers: newBarriers });
    get().saveToStorage();
  },

  addCustomBarrier: (barrier: string) => {
    const { customBarriers } = get();
    if (!customBarriers.includes(barrier) && barrier.trim()) {
      set({ customBarriers: [...customBarriers, barrier.trim()] });
      get().saveToStorage();
    }
  },

  removeCustomBarrier: (barrier: string) => {
    const { customBarriers } = get();
    set({ customBarriers: customBarriers.filter((b) => b !== barrier) });
    get().saveToStorage();
  },

  nextStep: () => {
    const { step } = get();
    if (step < 3) {
      set({ step: step + 1 });
      get().saveToStorage();
    }
  },

  prevStep: () => {
    const { step } = get();
    if (step > 1) {
      set({ step: step - 1, error: null });
      get().saveToStorage();
    }
  },

  submitOnboarding: async () => {
    const { northStarGoal, barriers, customBarriers } = get();
    const allBarriers = [...barriers, ...customBarriers];

    set({ isLoading: true, error: null });

    try {
      const payload: OnboardingPayload = {
        goal: northStarGoal,
        barriers: allBarriers,
      };

      const habits = await generateHabits(payload);
      
      // Create journey plan from generated habits
      const { createJourneyPlan } = get();
      createJourneyPlan(habits);
      
      set({ habits, isLoading: false });
      get().saveToStorage();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to generate habits',
        isLoading: false,
      });
    }
  },

  createJourneyPlan: (habits: HabitLayers) => {
    const { northStarGoal } = get();
    const startDate = new Date().toISOString();
    
    // Distribute habits across phases
    const phases: JourneyPhase[] = JOURNEY_PHASES.map((phaseTemplate, index) => {
      const phaseHabits = getHabitsForPhase(habits, index);
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(startDateObj);
      endDateObj.setDate(endDateObj.getDate() + (index + 1) * 7); // 7 days per phase
      
      return {
        ...phaseTemplate,
        status: index === 0 ? 'current' : 'locked',
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        habitCount: phaseHabits.length,
        habits: phaseHabits,
      };
    });

    const journey: JourneyPlan = {
      id: `journey-${Date.now()}`,
      name: `${northStarGoal} Journey`,
      startDate,
      phases,
    };

    set({ journey });
  },

  updatePhaseStatus: (phaseId: string, status: PhaseStatus) => {
    const { journey } = get();
    if (!journey) return;

    const updatedPhases = journey.phases.map(phase => ({
      ...phase,
      status: phase.id === phaseId ? status : phase.status,
    }));

    set({
      journey: {
        ...journey,
        phases: updatedPhases,
      },
    });
  },

  completeOnboarding: () => {
    set({ isOnboardingComplete: true });
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        set(state);
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const { step, northStarGoal, barriers, customBarriers, habits, journey, isOnboardingComplete } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step, northStarGoal, barriers, customBarriers, habits, journey, isOnboardingComplete })
      );
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  },

  resetOnboarding: () => {
    set(initialState);
    AsyncStorage.removeItem(STORAGE_KEY);
  },
}));
