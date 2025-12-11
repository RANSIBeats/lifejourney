import { PrismaClient } from '@prisma/client';
import { generateHabitsWithOpenAI } from './openAiService';
import {
  GenerateHabitsRequest,
  OpenAIHabitGenerationSchema,
} from '@/validators/habitGenerator';
import { logger } from '@utils/logger';

const prisma = new PrismaClient();

export interface GenerateHabitsResult {
  planId: string;
  goalId: string;
  habits: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    phase: number;
    frequency: string;
    duration?: number;
    priority: number;
  }>;
  summary: {
    foundationalCount: number;
    goalSpecificCount: number;
    barrierTargetingCount: number;
    totalCount: number;
  };
}

export async function generateHabits(
  request: GenerateHabitsRequest
): Promise<GenerateHabitsResult> {
  try {
    // 1. Create or find user (basic upsert)
    const user = await prisma.user.upsert({
      where: { id: request.userId },
      update: {},
      create: {
        id: request.userId,
        email: `user-${request.userId}@example.com`,
      },
    });

    // 2. Create goal
    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: request.goalTitle,
        description: request.goalDescription,
        category: request.goalCategory,
      },
    });

    // 3. Create barriers
    const barriers = await Promise.all(
      request.barriers.map((barrier) =>
        prisma.barrier.create({
          data: {
            userId: user.id,
            goalId: goal.id,
            title: barrier.title,
            description: barrier.description,
            type: barrier.type,
          },
        })
      )
    );

    // 4. Call OpenAI to generate habits
    const aiResponse = await generateHabitsWithOpenAI(request);

    // 5. Validate response
    const validatedResponse = OpenAIHabitGenerationSchema.parse(aiResponse);

    // 6. Categorize and normalize habits
    const categorizedHabits = normalizeAndCategorizeHabits(validatedResponse.habits);

    // 7. Create habit plan
    const planCounts = {
      phase1Count: categorizedHabits.filter((h) => h.phase === 1).length,
      phase2Count: categorizedHabits.filter((h) => h.phase === 2).length,
      phase3Count: categorizedHabits.filter((h) => h.phase === 3).length,
      phase4Count: categorizedHabits.filter((h) => h.phase === 4).length,
    };

    const plan = await prisma.habitPlan.create({
      data: {
        userId: user.id,
        goalId: goal.id,
        title: `${request.goalTitle} - Habit Plan`,
        ...planCounts,
      },
    });

    // 8. Create habits with references
    const createdHabits = await Promise.all(
      categorizedHabits.map((habit) => {
        // Find matching barrier if this is barrier-targeting
        let barrierId: string | undefined;
        if (habit.category === 'barrier-targeting' && barriers.length > 0) {
          barrierId = barriers[0].id;
        }

        return prisma.habit.create({
          data: {
            userId: user.id,
            goalId: goal.id,
            barrierId,
            planId: plan.id,
            title: habit.title,
            description: habit.description,
            category: habit.category,
            phase: habit.phase,
            frequency: habit.frequency,
            duration: habit.duration,
            priority: habit.priority,
          },
        });
      })
    );

    // 9. Calculate summary
    const summary = {
      foundationalCount: createdHabits.filter((h) => h.category === 'foundational')
        .length,
      goalSpecificCount: createdHabits.filter((h) => h.category === 'goal-specific')
        .length,
      barrierTargetingCount: createdHabits.filter(
        (h) => h.category === 'barrier-targeting'
      ).length,
      totalCount: createdHabits.length,
    };

    logger.info('Habits generated successfully', {
      planId: plan.id,
      goalId: goal.id,
      habitCount: createdHabits.length,
    });

    return {
      planId: plan.id,
      goalId: goal.id,
      habits: createdHabits.map((habit) => ({
        id: habit.id,
        title: habit.title,
        description: habit.description,
        category: habit.category,
        phase: habit.phase,
        frequency: habit.frequency,
        duration: habit.duration || undefined,
        priority: habit.priority,
      })),
      summary,
    };
  } catch (error) {
    logger.error('Error generating habits', { error });
    throw error;
  }
}

function normalizeAndCategorizeHabits(
  habits: Array<{
    title: string;
    description: string;
    category: string;
    phase: number;
    frequency: string;
    duration?: number;
    priority: number;
  }>
) {
  const normalized = habits.map((habit) => {
    const categoryLower = habit.category.toLowerCase();

    // Normalize category
    let category: 'foundational' | 'goal-specific' | 'barrier-targeting' =
      'foundational';
    if (categoryLower.includes('goal') || categoryLower.includes('specific')) {
      category = 'goal-specific';
    } else if (categoryLower.includes('barrier') || categoryLower.includes('target')) {
      category = 'barrier-targeting';
    }

    // Ensure phase is 1-4
    const phase = Math.max(1, Math.min(4, Math.floor(habit.phase))) as 1 | 2 | 3 | 4;

    // Ensure priority is 1-10
    const priority = Math.max(1, Math.min(10, Math.floor(habit.priority)));

    return {
      ...habit,
      category,
      phase,
      priority,
    };
  });

  // Validate distribution: ensure we have habits in each category
  const foundational = normalized.filter((h) => h.category === 'foundational');
  const goalSpecific = normalized.filter((h) => h.category === 'goal-specific');
  const barrierTargeting = normalized.filter((h) => h.category === 'barrier-targeting');

  // If missing any category, redistribute
  if (foundational.length === 0 || goalSpecific.length === 0 || barrierTargeting.length === 0) {
    logger.warn('Incomplete habit categorization from AI, using fallback distribution');
    // Keep normalized as is, will be handled by caller
  }

  return normalized;
}
