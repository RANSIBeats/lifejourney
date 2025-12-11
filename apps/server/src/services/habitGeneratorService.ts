import { PostgrestError } from '@supabase/supabase-js';
import { GenerateHabitsRequest, OpenAIHabitGenerationSchema } from '@/validators/habitGenerator';
import { logger } from '@utils/logger';
import { generateHabitsWithOpenAI } from './openAiService';
import { getSupabaseAdminClient } from '@lib/supabaseClient';
import { AppError } from '@middleware/errorHandler';
import {
  HabitCategory,
  HabitPhase,
  HabitPlanDetails,
  HabitResponse,
  PlanPhaseDetail,
  PlanPhaseStatus,
} from '@types/index';

export interface GenerateHabitsResult {
  planId: string;
  goalId: string;
  habits: HabitResponse[];
  summary: {
    foundationalCount: number;
    goalSpecificCount: number;
    barrierTargetingCount: number;
    totalCount: number;
  };
}

interface HabitGenerationContext {
  userId: string;
  userEmail?: string;
}

interface GoalRecord {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
}

interface BarrierRecord {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
}

interface HabitPlanRecord {
  id: string;
  goal_id: string;
  title: string | null;
  description: string | null;
  phase1_count: number;
  phase2_count: number;
  phase3_count: number;
  phase4_count: number;
}

interface HabitRecord {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  category: HabitCategory;
  phase: HabitPhase;
  frequency: string | null;
  duration: number | null;
  priority: number | null;
}

interface PlanPhaseRecord {
  id: string;
  phase_number: HabitPhase;
  start_date: string | null;
  end_date: string | null;
  status: PlanPhaseStatus;
}

interface HabitPlanWithRelations extends HabitPlanRecord {
  plan_phases: PlanPhaseRecord[] | null;
  habits: HabitRecord[] | null;
}

interface NormalizedHabit {
  title: string;
  description: string;
  category: HabitCategory;
  phase: HabitPhase;
  frequency: string;
  duration?: number;
  priority: number;
}

export async function generateHabits(
  request: GenerateHabitsRequest,
  context: HabitGenerationContext
): Promise<GenerateHabitsResult> {
  if (!context.userId) {
    throw new AppError(401, 'Unauthorized');
  }

  try {
    await upsertUserRecord(context.userId, context.userEmail);

    const goal = await createGoal(context.userId, request);
    const barriers = await createBarriers(context.userId, goal.id, request);

    const aiResponse = await generateHabitsWithOpenAI(request);
    const validatedResponse = OpenAIHabitGenerationSchema.parse(aiResponse);
    const categorizedHabits = normalizeAndCategorizeHabits(validatedResponse.habits);

    const planCounts = calculatePlanCounts(categorizedHabits);
    const plan = await createHabitPlan(context.userId, goal.id, request.goalTitle, planCounts);
    await createPlanPhases(plan.id);

    const habitRecords = await createHabits(
      context.userId,
      goal.id,
      plan.id,
      categorizedHabits,
      barriers
    );

    const summary = buildHabitSummary(habitRecords);

    logger.info('Habits generated successfully', {
      planId: plan.id,
      goalId: goal.id,
      habitCount: habitRecords.length,
    });

    return {
      planId: plan.id,
      goalId: goal.id,
      habits: habitRecords.map(mapHabitRecordToResponse),
      summary,
    };
  } catch (error) {
    logger.error('Error generating habits', { error });
    throw error;
  }
}

export async function getHabitPlanById(
  planId: string,
  userId: string
): Promise<HabitPlanDetails> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from<HabitPlanWithRelations>('habit_plans')
    .select(
      `id, goal_id, title, description, phase1_count, phase2_count, phase3_count, phase4_count,
       plan_phases (id, phase_number, start_date, end_date, status),
       habits (id, title, description, category, phase, frequency, duration, priority)`
    )
    .eq('id', planId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    logger.error('Failed to load habit plan from Supabase', { error, planId, userId });
    throw new AppError(500, 'Failed to load habit plan');
  }

  if (!data) {
    throw new AppError(404, 'Habit plan not found');
  }

  return {
    planId: data.id,
    goalId: data.goal_id,
    title: data.title,
    description: data.description,
    phaseCounts: {
      phase1: data.phase1_count,
      phase2: data.phase2_count,
      phase3: data.phase3_count,
      phase4: data.phase4_count,
    },
    phases: (data.plan_phases ?? []).map(mapPlanPhaseRecord),
    habits: (data.habits ?? []).map(mapHabitRecordToResponse),
  };
}

async function upsertUserRecord(userId: string, email?: string): Promise<void> {
  const client = getSupabaseAdminClient();
  const placeholderEmail = email ?? `${userId}@habit-ai.local`;
  const { error } = await client
    .from('users')
    .upsert(
      {
        id: userId,
        email: placeholderEmail,
      },
      { onConflict: 'id' }
    );

  if (error) {
    logger.error('Failed to upsert user in Supabase', { error, userId });
    throw new AppError(500, 'Failed to upsert user');
  }
}

async function createGoal(
  userId: string,
  request: GenerateHabitsRequest
): Promise<GoalRecord> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from<GoalRecord>('goals')
    .insert({
      user_id: userId,
      title: request.goalTitle,
      description: request.goalDescription ?? null,
      category: request.goalCategory ?? null,
    })
    .select()
    .single();

  return ensureData(data, error, 'Failed to create goal');
}

async function createBarriers(
  userId: string,
  goalId: string,
  request: GenerateHabitsRequest
): Promise<BarrierRecord[]> {
  const client = getSupabaseAdminClient();
  const barrierPayload = request.barriers.map((barrier) => ({
    user_id: userId,
    goal_id: goalId,
    title: barrier.title,
    description: barrier.description ?? null,
    type: barrier.type ?? null,
  }));

  const { data, error } = await client
    .from<BarrierRecord>('barriers')
    .insert(barrierPayload)
    .select();

  return ensureData(data, error, 'Failed to create barriers');
}

async function createHabitPlan(
  userId: string,
  goalId: string,
  goalTitle: string,
  planCounts: Record<string, number>
): Promise<HabitPlanRecord> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from<HabitPlanRecord>('habit_plans')
    .insert({
      user_id: userId,
      goal_id: goalId,
      title: `${goalTitle} - Habit Plan`,
      description: null,
      phase1_count: planCounts.phase1,
      phase2_count: planCounts.phase2,
      phase3_count: planCounts.phase3,
      phase4_count: planCounts.phase4,
    })
    .select()
    .single();

  return ensureData(data, error, 'Failed to create habit plan');
}

async function createPlanPhases(planId: string): Promise<void> {
  const client = getSupabaseAdminClient();
  const phasePayload = [1, 2, 3, 4].map((phaseNumber) => ({
    plan_id: planId,
    phase_number: phaseNumber as HabitPhase,
    status: phaseNumber === 1 ? 'active' : 'pending',
  }));

  const { error } = await client.from('plan_phases').insert(phasePayload);

  if (error) {
    logger.error('Failed to create plan phases', { error, planId });
    throw new AppError(500, 'Failed to create plan phases');
  }
}

async function createHabits(
  userId: string,
  goalId: string,
  planId: string,
  habits: NormalizedHabit[],
  barriers: BarrierRecord[]
): Promise<HabitRecord[]> {
  const client = getSupabaseAdminClient();

  const habitPayload = habits.map((habit, index) => ({
    user_id: userId,
    goal_id: goalId,
    plan_id: planId,
    barrier_id:
      habit.category === 'barrier-targeting' && barriers.length > 0
        ? barriers[index % barriers.length].id
        : null,
    title: habit.title,
    description: habit.description,
    category: habit.category,
    phase: habit.phase,
    frequency: habit.frequency,
    duration: habit.duration ?? null,
    priority: habit.priority,
  }));

  const { data, error } = await client
    .from<HabitRecord>('habits')
    .insert(habitPayload)
    .select();

  return ensureData(data, error, 'Failed to create habits');
}

function buildHabitSummary(habits: HabitRecord[]) {
  return {
    foundationalCount: habits.filter((habit) => habit.category === 'foundational').length,
    goalSpecificCount: habits.filter((habit) => habit.category === 'goal-specific').length,
    barrierTargetingCount: habits.filter((habit) => habit.category === 'barrier-targeting').length,
    totalCount: habits.length,
  };
}

function mapHabitRecordToResponse(habit: HabitRecord): HabitResponse {
  return {
    id: habit.id,
    title: habit.title,
    description: habit.description ?? '',
    category: habit.category,
    phase: habit.phase,
    frequency: habit.frequency ?? '',
    duration: habit.duration ?? undefined,
    priority: habit.priority ?? 0,
  };
}

function mapPlanPhaseRecord(phase: PlanPhaseRecord): PlanPhaseDetail {
  return {
    id: phase.id,
    phaseNumber: phase.phase_number,
    status: phase.status,
    startDate: phase.start_date,
    endDate: phase.end_date,
  };
}

function ensureData<T>(data: T | null, error: PostgrestError | null, message: string): T {
  if (error || data === null) {
    logger.error(message, { error });
    throw new AppError(500, message);
  }

  return data;
}

function calculatePlanCounts(habits: NormalizedHabit[]) {
  return {
    phase1: habits.filter((habit) => habit.phase === 1).length,
    phase2: habits.filter((habit) => habit.phase === 2).length,
    phase3: habits.filter((habit) => habit.phase === 3).length,
    phase4: habits.filter((habit) => habit.phase === 4).length,
  };
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
): NormalizedHabit[] {
  const normalized = habits.map((habit) => {
    const categoryLower = habit.category.toLowerCase();

    let category: HabitCategory = 'foundational';
    if (categoryLower.includes('goal') || categoryLower.includes('specific')) {
      category = 'goal-specific';
    } else if (categoryLower.includes('barrier') || categoryLower.includes('target')) {
      category = 'barrier-targeting';
    }

    const phase = Math.max(1, Math.min(4, Math.floor(habit.phase))) as HabitPhase;
    const priority = Math.max(1, Math.min(10, Math.floor(habit.priority)));

    return {
      title: habit.title.substring(0, 255),
      description: habit.description.substring(0, 1000),
      category,
      phase,
      frequency: habit.frequency.substring(0, 100),
      duration: habit.duration ? Math.max(1, Math.floor(habit.duration)) : undefined,
      priority,
    };
  });

  const foundational = normalized.filter((habit) => habit.category === 'foundational');
  const goalSpecific = normalized.filter((habit) => habit.category === 'goal-specific');
  const barrierTargeting = normalized.filter((habit) => habit.category === 'barrier-targeting');

  if (foundational.length === 0 || goalSpecific.length === 0 || barrierTargeting.length === 0) {
    logger.warn('Incomplete habit categorization from AI, using fallback distribution');
  }

  return normalized;
}
