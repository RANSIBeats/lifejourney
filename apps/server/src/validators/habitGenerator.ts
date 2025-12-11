import { z } from 'zod';

export const BarrierSchema = z.object({
  title: z.string().min(1, 'Barrier title is required'),
  description: z.string().optional(),
  type: z.string().optional(),
});

export const GenerateHabitsRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  goalTitle: z.string().min(1, 'Goal title is required'),
  goalDescription: z.string().optional(),
  goalCategory: z.string().optional(),
  barriers: z.array(BarrierSchema).min(1, 'At least one barrier is required'),
});

export const HabitResponseSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  category: z.enum(['foundational', 'goal-specific', 'barrier-targeting']),
  phase: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  frequency: z.string(),
  duration: z.number().optional(),
  priority: z.number().min(1).max(10),
});

export const OpenAIHabitGenerationSchema = z.object({
  habits: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
      phase: z.number().min(1).max(4),
      frequency: z.string(),
      duration: z.number().optional(),
      priority: z.number(),
    })
  ),
});

export type GenerateHabitsRequest = z.infer<typeof GenerateHabitsRequestSchema>;
export type Barrier = z.infer<typeof BarrierSchema>;
export type HabitResponse = z.infer<typeof HabitResponseSchema>;
export type OpenAIHabitGeneration = z.infer<typeof OpenAIHabitGenerationSchema>;
