import { generateHabits } from '../habits';
import { OnboardingPayload } from '../../types/onboarding';

describe('Habits API', () => {
  describe('generateHabits', () => {
    it('should generate habits with all three layers', async () => {
      const payload: OnboardingPayload = {
        goal: 'Run a marathon',
        barriers: ['Sleep', 'Focus'],
      };

      const result = await generateHabits(payload);

      expect(result).toHaveProperty('foundational');
      expect(result).toHaveProperty('goalSpecific');
      expect(result).toHaveProperty('barrierTargeting');
    });

    it('should include foundational habits', async () => {
      const payload: OnboardingPayload = {
        goal: 'Run a marathon',
        barriers: ['Sleep'],
      };

      const result = await generateHabits(payload);

      expect(result.foundational).toBeInstanceOf(Array);
      expect(result.foundational.length).toBeGreaterThan(0);
      result.foundational.forEach((habit) => {
        expect(habit).toHaveProperty('id');
        expect(habit).toHaveProperty('title');
        expect(habit).toHaveProperty('description');
      });
    });

    it('should include goal-specific habits based on user goal', async () => {
      const payload: OnboardingPayload = {
        goal: 'Launch my business',
        barriers: ['Focus'],
      };

      const result = await generateHabits(payload);

      expect(result.goalSpecific).toBeInstanceOf(Array);
      expect(result.goalSpecific.length).toBeGreaterThan(0);
      const hasGoalReference = result.goalSpecific.some(
        (habit) =>
          habit.title.includes(payload.goal) || habit.description.includes(payload.goal)
      );
      expect(hasGoalReference).toBe(true);
    });

    it('should create barrier-targeting habits for each barrier', async () => {
      const payload: OnboardingPayload = {
        goal: 'Run a marathon',
        barriers: ['Sleep', 'Focus', 'Stress'],
      };

      const result = await generateHabits(payload);

      expect(result.barrierTargeting).toHaveLength(payload.barriers.length);
      result.barrierTargeting.forEach((habit, index) => {
        expect(habit.title).toContain(payload.barriers[index]);
      });
    });

    it('should handle empty barriers array', async () => {
      const payload: OnboardingPayload = {
        goal: 'Run a marathon',
        barriers: [],
      };

      const result = await generateHabits(payload);

      expect(result.barrierTargeting).toHaveLength(0);
    });

    it('should handle custom barriers', async () => {
      const payload: OnboardingPayload = {
        goal: 'Learn Spanish',
        barriers: ['Procrastination', 'Lack of time'],
      };

      const result = await generateHabits(payload);

      expect(result.barrierTargeting).toHaveLength(2);
      expect(result.barrierTargeting[0].title).toContain('Procrastination');
      expect(result.barrierTargeting[1].title).toContain('Lack of time');
    });

    it('should simulate async behavior', async () => {
      const payload: OnboardingPayload = {
        goal: 'Run a marathon',
        barriers: ['Sleep'],
      };

      const startTime = Date.now();
      await generateHabits(payload);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(1500);
    });
  });
});
