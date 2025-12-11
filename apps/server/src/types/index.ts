export interface GenerateHabitsRequest {
  userId: string;
  goalTitle: string;
  goalDescription?: string;
  goalCategory?: string;
  barriers: Array<{
    title: string;
    description?: string;
    type?: string;
  }>;
}

export interface HabitResponse {
  title: string;
  description: string;
  category: 'foundational' | 'goal-specific' | 'barrier-targeting';
  phase: 1 | 2 | 3 | 4;
  frequency: string;
  duration?: number;
  priority: number;
}

export interface GenerateHabitsResponse {
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
