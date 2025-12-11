import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboardingStore } from '../onboardingStore';
import * as habitsApi from '../../api/habits';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../api/habits');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockGenerateHabits = habitsApi.generateHabits as jest.MockedFunction<
  typeof habitsApi.generateHabits
>;

describe('OnboardingStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useOnboardingStore.setState({
      step: 1,
      northStarGoal: '',
      barriers: [],
      customBarriers: [],
      isLoading: false,
      error: null,
      habits: null,
    });
    
    // Mock generateHabits to return test data
    mockGenerateHabits.mockResolvedValue({
      foundational: [
        {
          id: 'f1',
          title: 'Test Foundational Habit',
          description: 'Test description',
          frequency: 'Daily',
        },
      ],
      goalSpecific: [
        {
          id: 'g1',
          title: 'Test Goal Habit',
          description: 'Test description',
          frequency: 'Daily',
        },
      ],
      barrierTargeting: [
        {
          id: 'b1',
          title: 'Test Barrier Habit',
          description: 'Test description',
          frequency: 'Daily',
        },
      ],
    });
  });

  describe('setNorthStarGoal', () => {
    it('should update the north star goal', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.setNorthStarGoal('Run a marathon');
      });

      expect(result.current.northStarGoal).toBe('Run a marathon');
    });

    it('should clear error when setting goal', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.setNorthStarGoal('Run a marathon');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('toggleBarrier', () => {
    it('should add a barrier when not present', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.toggleBarrier('Sleep');
      });

      expect(result.current.barriers).toContain('Sleep');
    });

    it('should remove a barrier when already present', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.toggleBarrier('Sleep');
        result.current.toggleBarrier('Sleep');
      });

      expect(result.current.barriers).not.toContain('Sleep');
    });

    it('should handle multiple barriers', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.toggleBarrier('Sleep');
        result.current.toggleBarrier('Focus');
        result.current.toggleBarrier('Stress');
      });

      expect(result.current.barriers).toHaveLength(3);
      expect(result.current.barriers).toEqual(['Sleep', 'Focus', 'Stress']);
    });
  });

  describe('customBarriers', () => {
    it('should add a custom barrier', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.addCustomBarrier('Procrastination');
      });

      expect(result.current.customBarriers).toContain('Procrastination');
    });

    it('should not add empty custom barriers', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.addCustomBarrier('  ');
      });

      expect(result.current.customBarriers).toHaveLength(0);
    });

    it('should not add duplicate custom barriers', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.addCustomBarrier('Procrastination');
        result.current.addCustomBarrier('Procrastination');
      });

      expect(result.current.customBarriers).toHaveLength(1);
    });

    it('should trim custom barrier text', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.addCustomBarrier('  Procrastination  ');
      });

      expect(result.current.customBarriers[0]).toBe('Procrastination');
    });

    it('should remove a custom barrier', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.addCustomBarrier('Procrastination');
        result.current.removeCustomBarrier('Procrastination');
      });

      expect(result.current.customBarriers).toHaveLength(0);
    });
  });

  describe('step navigation', () => {
    it('should move to next step', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.step).toBe(2);
    });

    it('should move to previous step', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.setStep(2);
        result.current.prevStep();
      });

      expect(result.current.step).toBe(1);
    });

    it('should not go below step 1', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.step).toBe(1);
    });

    it('should not go above step 3', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.setStep(3);
        result.current.nextStep();
      });

      expect(result.current.step).toBe(3);
    });

    it('should clear error when going back', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.setStep(2);
        result.current.prevStep();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('submitOnboarding', () => {
    it('should set loading to false after completing', async () => {
      useOnboardingStore.setState({
        step: 1,
        northStarGoal: 'Run a marathon',
        barriers: ['Sleep'],
        customBarriers: [],
        isLoading: false,
        error: null,
        habits: null,
      });

      await act(async () => {
        await useOnboardingStore.getState().submitOnboarding();
      });

      await waitFor(() => {
        const state = useOnboardingStore.getState();
        expect(state.isLoading).toBe(false);
      });
    });

    it('should generate habits successfully', async () => {
      useOnboardingStore.setState({
        step: 1,
        northStarGoal: 'Run a marathon',
        barriers: ['Sleep'],
        customBarriers: [],
        isLoading: false,
        error: null,
        habits: null,
      });

      await act(async () => {
        await useOnboardingStore.getState().submitOnboarding();
        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const state = useOnboardingStore.getState();
      expect(state.habits).not.toBeNull();
      expect(state.habits?.foundational).toBeDefined();
      expect(state.habits?.goalSpecific).toBeDefined();
      expect(state.habits?.barrierTargeting).toBeDefined();
    });

    it('should include custom barriers in submission', async () => {
      // Mock with 2 barrier habits for this test
      mockGenerateHabits.mockResolvedValueOnce({
        foundational: [
          {
            id: 'f1',
            title: 'Test Foundational Habit',
            description: 'Test description',
            frequency: 'Daily',
          },
        ],
        goalSpecific: [
          {
            id: 'g1',
            title: 'Test Goal Habit',
            description: 'Test description',
            frequency: 'Daily',
          },
        ],
        barrierTargeting: [
          {
            id: 'b1',
            title: 'Test Barrier Habit 1',
            description: 'Test description',
            frequency: 'Daily',
          },
          {
            id: 'b2',
            title: 'Test Barrier Habit 2',
            description: 'Test description',
            frequency: 'Daily',
          },
        ],
      });
      
      useOnboardingStore.setState({
        step: 1,
        northStarGoal: 'Launch my business',
        barriers: ['Focus'],
        customBarriers: ['Procrastination'],
        isLoading: false,
        error: null,
        habits: null,
      });

      await act(async () => {
        await useOnboardingStore.getState().submitOnboarding();
        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const state = useOnboardingStore.getState();
      expect(state.habits?.barrierTargeting).toHaveLength(2);
    });
  });

  describe('persistence', () => {
    it('should save state to AsyncStorage', async () => {
      const store = useOnboardingStore.getState();
      
      await act(async () => {
        store.setNorthStarGoal('Run a marathon');
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      });
    });

    it('should load state from AsyncStorage', async () => {
      const mockState = {
        step: 2,
        northStarGoal: 'Run a marathon',
        barriers: ['Sleep', 'Focus'],
        customBarriers: ['Procrastination'],
        habits: null,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockState));

      const store = useOnboardingStore.getState();

      await act(async () => {
        await store.loadFromStorage();
      });

      await waitFor(() => {
        const state = useOnboardingStore.getState();
        expect(state.step).toBe(2);
        expect(state.northStarGoal).toBe('Run a marathon');
        expect(state.barriers).toEqual(['Sleep', 'Focus']);
        expect(state.customBarriers).toEqual(['Procrastination']);
      });
    });
  });

  describe('resetOnboarding', () => {
    it('should reset all state to initial values', () => {
      const store = useOnboardingStore.getState();

      act(() => {
        store.setNorthStarGoal('Run a marathon');
        store.toggleBarrier('Sleep');
        store.setStep(3);
        store.resetOnboarding();
      });

      const state = useOnboardingStore.getState();
      expect(state.step).toBe(1);
      expect(state.northStarGoal).toBe('');
      expect(state.barriers).toHaveLength(0);
      expect(state.customBarriers).toHaveLength(0);
      expect(state.habits).toBeNull();
    });

    it('should clear AsyncStorage', () => {
      const store = useOnboardingStore.getState();

      act(() => {
        store.resetOnboarding();
      });

      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
    });
  });
});
