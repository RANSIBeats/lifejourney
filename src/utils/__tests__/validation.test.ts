import { validateNorthStarGoal, validateBarriers } from '../validation';

describe('Validation', () => {
  describe('validateNorthStarGoal', () => {
    it('should return null for valid goal', () => {
      const result = validateNorthStarGoal('Run a marathon');
      expect(result).toBeNull();
    });

    it('should return error for empty goal', () => {
      const result = validateNorthStarGoal('');
      expect(result).toBe('Please share your goal with us');
    });

    it('should return error for whitespace-only goal', () => {
      const result = validateNorthStarGoal('   ');
      expect(result).toBe('Please share your goal with us');
    });

    it('should return error for goal less than 3 characters', () => {
      const result = validateNorthStarGoal('ab');
      expect(result).toBe('Your goal should be at least 3 characters');
    });

    it('should return error for goal over 200 characters', () => {
      const longGoal = 'a'.repeat(201);
      const result = validateNorthStarGoal(longGoal);
      expect(result).toBe('Your goal is too long. Please keep it under 200 characters');
    });

    it('should accept goal with exactly 200 characters', () => {
      const goal = 'a'.repeat(200);
      const result = validateNorthStarGoal(goal);
      expect(result).toBeNull();
    });

    it('should accept goal with exactly 3 characters', () => {
      const result = validateNorthStarGoal('abc');
      expect(result).toBeNull();
    });

    it('should trim goal before validation', () => {
      const result = validateNorthStarGoal('  Run a marathon  ');
      expect(result).toBeNull();
    });
  });

  describe('validateBarriers', () => {
    it('should return null for valid barriers selection', () => {
      const result = validateBarriers(['Sleep', 'Focus'], []);
      expect(result).toBeNull();
    });

    it('should return null for valid custom barriers', () => {
      const result = validateBarriers([], ['Procrastination']);
      expect(result).toBeNull();
    });

    it('should return null for combination of preset and custom barriers', () => {
      const result = validateBarriers(['Sleep'], ['Procrastination']);
      expect(result).toBeNull();
    });

    it('should return error for no barriers selected', () => {
      const result = validateBarriers([], []);
      expect(result).toBe('Please select at least one barrier');
    });

    it('should return error for more than 10 barriers', () => {
      const barriers = Array(8).fill('barrier');
      const customBarriers = Array(3).fill('custom');
      const result = validateBarriers(barriers, customBarriers);
      expect(result).toBe('Please select no more than 10 barriers');
    });

    it('should accept exactly 10 barriers', () => {
      const barriers = Array(6).fill('barrier');
      const customBarriers = Array(4).fill('custom');
      const result = validateBarriers(barriers, customBarriers);
      expect(result).toBeNull();
    });

    it('should accept exactly 1 barrier', () => {
      const result = validateBarriers(['Sleep'], []);
      expect(result).toBeNull();
    });
  });
});
