export interface BarrierInput {
  title: string;
  description?: string;
  type?: string;
}

export interface GenerateHabitsRequest {
  goalTitle: string;
  goalDescription?: string;
  goalCategory?: string;
  barriers: BarrierInput[];
}

export type HabitCategory = 'foundational' | 'goal-specific' | 'barrier-targeting';
export type HabitPhase = 1 | 2 | 3 | 4;

export interface HabitResponse {
  id: string;
  title: string;
  description: string;
  category: HabitCategory;
  phase: HabitPhase;
  frequency: string;
  duration?: number;
  priority: number;
}

export interface HabitSummary {
  foundationalCount: number;
  goalSpecificCount: number;
  barrierTargetingCount: number;
  totalCount: number;
}

export interface GenerateHabitsResponse {
  planId: string;
  goalId: string;
  habits: HabitResponse[];
  summary: HabitSummary;
}

export type PlanPhaseStatus = 'pending' | 'active' | 'completed' | 'skipped';

export interface PlanPhaseDetail {
  id: string;
  phaseNumber: HabitPhase;
  startDate?: string | null;
  endDate?: string | null;
  status: PlanPhaseStatus;
}

export interface HabitPlanDetails {
  planId: string;
  goalId: string;
  title?: string | null;
  description?: string | null;
  phaseCounts: {
    phase1: number;
    phase2: number;
    phase3: number;
    phase4: number;
  };
  phases: PlanPhaseDetail[];
  habits: HabitResponse[];
}

export interface OpenAIHabitGeneration {
  habits: Array<{
    title: string;
    description: string;
    category: string;
    phase: number;
    frequency: string;
    duration?: number;
    priority: number;
  }>;
}
