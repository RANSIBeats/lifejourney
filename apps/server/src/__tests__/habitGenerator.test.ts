import { z } from 'zod';
import { generateHabits } from '@services/habitGeneratorService';
import {
  GenerateHabitsRequestSchema,
  OpenAIHabitGenerationSchema,
} from '@/validators/habitGenerator';
import { AppError } from '@middleware/errorHandler';
import { getSupabaseAdminClient } from '@lib/supabaseClient';
import { generateHabitsWithOpenAI } from '@services/openAiService';

jest.mock('@lib/supabaseClient', () => ({
  getSupabaseAdminClient: jest.fn(),
}));

jest.mock('@services/openAiService', () => ({
  generateHabitsWithOpenAI: jest.fn(),
}));

const mockSupabase: { from: jest.Mock } = {
  from: jest.fn(),
};
const mockGetClient = getSupabaseAdminClient as jest.Mock;
const mockGenerateHabitsWithOpenAI = generateHabitsWithOpenAI as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockSupabase.from.mockReset();
  mockGetClient.mockReturnValue(mockSupabase);
});

describe('Habit Generator', () => {
  describe('Validation', () => {
    it('should validate a valid generate habits request', () => {
      const validRequest = {
        goalTitle: 'Get Fit',
        goalDescription: 'Lose weight and build muscle',
        goalCategory: 'health',
        barriers: [
          {
            title: 'Lack of time',
            description: 'Busy work schedule',
            type: 'time-based',
          },
        ],
      };

      expect(() => GenerateHabitsRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should reject request with missing goalTitle', () => {
      const invalidRequest = {
        goalDescription: 'Lose weight and build muscle',
        goalCategory: 'health',
        barriers: [{ title: 'Lack of time' }],
      };

      expect(() => GenerateHabitsRequestSchema.parse(invalidRequest)).toThrow(z.ZodError);
    });

    it('should reject request with no barriers', () => {
      const invalidRequest = {
        goalTitle: 'Get Fit',
        barriers: [],
      };

      expect(() => GenerateHabitsRequestSchema.parse(invalidRequest)).toThrow(z.ZodError);
    });

    it('should accept optional goal metadata', () => {
      const minimalRequest = {
        goalTitle: 'Get Fit',
        barriers: [{ title: 'Lack of time' }],
      };

      expect(() => GenerateHabitsRequestSchema.parse(minimalRequest)).not.toThrow();
    });
  });

  describe('AI Response Validation', () => {
    it('should validate valid OpenAI habit generation response', () => {
      const validResponse = {
        habits: [
          {
            title: 'Morning Run',
            description: 'Run for 30 minutes',
            category: 'foundational',
            phase: 1,
            frequency: 'daily',
            duration: 30,
            priority: 8,
          },
        ],
      };

      expect(() => OpenAIHabitGenerationSchema.parse(validResponse)).not.toThrow();
    });

    it('should reject missing required fields', () => {
      const invalidResponse = {
        habits: [
          {
            title: 'Morning Run',
          },
        ],
      };

      expect(() => OpenAIHabitGenerationSchema.parse(invalidResponse)).toThrow(z.ZodError);
    });
  });

  describe('Habit generation service', () => {
    const baseRequest = {
      goalTitle: 'Get Fit',
      goalDescription: 'Lose weight and build muscle',
      goalCategory: 'health',
      barriers: [
        {
          title: 'Lack of time',
          description: 'Busy work schedule',
          type: 'time-based',
        },
      ],
    };

    const goalRecord = {
      id: 'goal-123',
      user_id: 'user-123',
      title: 'Get Fit',
      description: 'Lose weight and build muscle',
      category: 'health',
    };

    const barrierRecords = [
      {
        id: 'barrier-123',
        title: 'Lack of time',
        description: 'Busy work schedule',
        type: 'time-based',
      },
    ];

    const planRecord = {
      id: 'plan-123',
      goal_id: goalRecord.id,
      title: 'Get Fit - Habit Plan',
      description: null,
      phase1_count: 1,
      phase2_count: 1,
      phase3_count: 0,
      phase4_count: 0,
    };

    const habitRecords = [
      {
        id: 'habit-1',
        plan_id: planRecord.id,
        title: 'Morning Movement',
        description: 'Stretch for 10 minutes',
        category: 'foundational' as const,
        phase: 1 as const,
        frequency: 'daily',
        duration: 10,
        priority: 8,
      },
      {
        id: 'habit-2',
        plan_id: planRecord.id,
        title: 'Strength Session',
        description: 'Bodyweight workout',
        category: 'goal-specific' as const,
        phase: 2 as const,
        frequency: 'daily',
        duration: 20,
        priority: 9,
      },
    ];

    function mockInsertSingle<T>(row: T) {
      const single = jest.fn().mockResolvedValue({ data: row, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      return { insert, select, single };
    }

    function mockInsertMulti<T>(rows: T[]) {
      const select = jest.fn().mockResolvedValue({ data: rows, error: null });
      const insert = jest.fn().mockReturnValue({ select });
      return { insert, select };
    }

    it('should persist AI generated habits via Supabase', async () => {
      const usersUpsert = jest.fn().mockResolvedValue({ error: null });
      const goalInsert = mockInsertSingle(goalRecord);
      const barrierInsert = mockInsertMulti(barrierRecords);
      const planInsert = mockInsertSingle(planRecord);
      const planPhasesInsert = jest.fn().mockResolvedValue({ error: null });
      const habitInsert = mockInsertMulti(habitRecords);

      mockSupabase.from.mockImplementation((table: string) => {
        switch (table) {
          case 'users':
            return { upsert: usersUpsert };
          case 'goals':
            return { insert: goalInsert.insert };
          case 'barriers':
            return { insert: barrierInsert.insert };
          case 'habit_plans':
            return { insert: planInsert.insert };
          case 'plan_phases':
            return { insert: planPhasesInsert };
          case 'habits':
            return { insert: habitInsert.insert };
          default:
            throw new Error(`Unexpected table requested: ${table}`);
        }
      });

      mockGenerateHabitsWithOpenAI.mockResolvedValue(
        OpenAIHabitGenerationSchema.parse({
          habits: [
            {
              title: 'Morning Movement',
              description: 'Stretch for 10 minutes',
              category: 'foundational',
              phase: 1,
              frequency: 'daily',
              duration: 10,
              priority: 8,
            },
            {
              title: 'Strength Session',
              description: 'Bodyweight workout',
              category: 'goal-specific',
              phase: 2,
              frequency: 'daily',
              duration: 20,
              priority: 9,
            },
          ],
        })
      );

      const result = await generateHabits(baseRequest, {
        userId: 'user-123',
        userEmail: 'user@example.com',
      });

      expect(result.planId).toBe(planRecord.id);
      expect(result.goalId).toBe(goalRecord.id);
      expect(result.habits).toHaveLength(habitRecords.length);
      expect(result.summary).toEqual({
        foundationalCount: 1,
        goalSpecificCount: 1,
        barrierTargetingCount: 0,
        totalCount: 2,
      });
      expect(usersUpsert).toHaveBeenCalled();
      expect(goalInsert.insert).toHaveBeenCalled();
      expect(barrierInsert.insert).toHaveBeenCalled();
      expect(planInsert.insert).toHaveBeenCalled();
      expect(planPhasesInsert).toHaveBeenCalled();
      expect(habitInsert.insert).toHaveBeenCalled();
    });

    it('should surface Supabase errors as AppError instances', async () => {
      const usersUpsert = jest.fn().mockResolvedValue({ error: null });
      const goalInsert = mockInsertSingle(goalRecord);
      goalInsert.single.mockResolvedValue({ data: null, error: { message: 'db error' } });

      mockSupabase.from.mockImplementation((table: string) => {
        switch (table) {
          case 'users':
            return { upsert: usersUpsert };
          case 'goals':
            return { insert: goalInsert.insert };
          default:
            throw new Error(`Unexpected table requested: ${table}`);
        }
      });

      mockGenerateHabitsWithOpenAI.mockResolvedValue(
        OpenAIHabitGenerationSchema.parse({
          habits: [
            {
              title: 'Morning Movement',
              description: 'Stretch for 10 minutes',
              category: 'foundational',
              phase: 1,
              frequency: 'daily',
              duration: 10,
              priority: 8,
            },
          ],
        })
      );

      await expect(
        generateHabits(baseRequest, {
          userId: 'user-123',
        })
      ).rejects.toThrow(AppError);
    });
  });
});
