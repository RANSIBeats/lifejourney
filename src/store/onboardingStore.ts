import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingState, OnboardingPayload, HabitLayers } from '../types/onboarding';
import { generateHabits } from '../api/habits';

const STORAGE_KEY = '@onboarding_state';

interface OnboardingActions {
  setStep: (step: number) => void;
  setNorthStarGoal: (goal: string) => void;
  toggleBarrier: (barrier: string) => void;
  addCustomBarrier: (barrier: string) => void;
  removeCustomBarrier: (barrier: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitOnboarding: () => Promise<void>;
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
      set({ habits, isLoading: false });
      get().saveToStorage();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to generate habits',
        isLoading: false,
      });
    }
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
      const { step, northStarGoal, barriers, customBarriers, habits } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step, northStarGoal, barriers, customBarriers, habits })
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
