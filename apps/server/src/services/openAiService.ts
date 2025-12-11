import OpenAI from '@openai/sdk';
import { logger } from '@utils/logger';
import { GenerateHabitsRequest, OpenAIHabitGeneration } from '@/validators/habitGenerator';

const isOpenAIEnabled = process.env.OPENAI_ENABLED !== 'false' && process.env.OPENAI_API_KEY;
const useMockAI = process.env.USE_MOCK_AI === 'true';

let client: OpenAI | null = null;

if (isOpenAIEnabled && !useMockAI) {
  try {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    logger.warn('Failed to initialize OpenAI client, falling back to mock');
  }
}

const MOCK_HABITS = {
  foundational: [
    {
      title: 'Morning Reflection',
      description: 'Spend 5 minutes reflecting on your goals and intentions for the day',
      frequency: 'daily',
      duration: 5,
      priority: 8,
    },
    {
      title: 'Evening Review',
      description: 'Review your day and track progress towards your goal',
      frequency: 'daily',
      duration: 5,
      priority: 7,
    },
    {
      title: 'Weekly Planning',
      description: 'Plan out the week ahead with specific actions',
      frequency: 'weekly',
      duration: 30,
      priority: 9,
    },
  ],
  goalSpecific: [
    {
      title: 'Goal-Aligned Action',
      description: 'Take one meaningful action directly aligned with your goal',
      frequency: 'daily',
      duration: 30,
      priority: 10,
    },
    {
      title: 'Learning Session',
      description: 'Learn something new that supports your goal',
      frequency: 'daily',
      duration: 20,
      priority: 8,
    },
  ],
  barrierTargeting: [
    {
      title: 'Obstacle Mitigation',
      description: 'Actively work on overcoming identified barriers',
      frequency: 'daily',
      duration: 15,
      priority: 9,
    },
  ],
};

export async function generateHabitsWithOpenAI(
  request: GenerateHabitsRequest
): Promise<OpenAIHabitGeneration> {
  if (useMockAI || !client) {
    logger.info('Using mock habit generation');
    return generateMockHabits(request);
  }

  try {
    const prompt = buildPrompt(request);

    const message = await client.messages.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.warn('Could not parse OpenAI response, using mock');
      return generateMockHabits(request);
    }

    const parsed: OpenAIHabitGeneration = JSON.parse(jsonMatch[0]);

    // Normalize and validate habits
    return normalizeHabits(parsed);
  } catch (error) {
    logger.error('OpenAI API error, falling back to mock', { error });
    return generateMockHabits(request);
  }
}

function buildPrompt(request: GenerateHabitsRequest): string {
  const barriersText = request.barriers
    .map((b) => `- ${b.title}: ${b.description || 'N/A'} (${b.type || 'general'})`)
    .join('\n');

  return `You are a habit formation expert. Create a comprehensive habit architecture plan for someone with the following goal.

Goal: ${request.goalTitle}
Description: ${request.goalDescription || 'Not provided'}
Category: ${request.goalCategory || 'general'}

Barriers to overcome:
${barriersText}

Please generate a structured habit plan in JSON format with the following structure:
{
  "habits": [
    {
      "title": "Habit name",
      "description": "What this habit involves and why it helps",
      "category": "foundational|goal-specific|barrier-targeting",
      "phase": 1-4,
      "frequency": "daily|weekly|specific pattern",
      "duration": number in minutes,
      "priority": 1-10
    }
  ]
}

Requirements:
- Generate 3-4 foundational habits (core daily practices)
- Generate 2-3 goal-specific habits (directly aligned with the goal)
- Generate 2-3 barrier-targeting habits (address identified obstacles)
- Distribute habits across 4 phases (introduction, building, reinforcement, mastery)
- Ensure phase 1 has simpler, shorter-duration habits
- Phase 4 should have more challenging habits
- All habits should be specific and actionable
- Return ONLY the JSON object, no additional text`;
}

function generateMockHabits(request: GenerateHabitsRequest): OpenAIHabitGeneration {
  const habits = [];

  // Add foundational habits to phases 1-2
  MOCK_HABITS.foundational.forEach((habit, index) => {
    habits.push({
      ...habit,
      category: 'foundational',
      phase: index < 2 ? 1 : 2,
    });
  });

  // Add goal-specific habits to phases 2-3
  MOCK_HABITS.goalSpecific.forEach((habit, index) => {
    habits.push({
      ...habit,
      category: 'goal-specific',
      phase: index < 1 ? 2 : 3,
    });
  });

  // Add barrier-targeting habits to phases 3-4
  MOCK_HABITS.barrierTargeting.forEach((habit, index) => {
    habits.push({
      ...habit,
      category: 'barrier-targeting',
      phase: index < 1 ? 3 : 4,
    });
  });

  return { habits };
}

function normalizeHabits(
  aiResponse: OpenAIHabitGeneration
): OpenAIHabitGeneration {
  // Validate and normalize each habit
  const normalizedHabits = aiResponse.habits.map((habit) => {
    const category = normalizeCategory(habit.category);
    const phase = Math.max(1, Math.min(4, Math.floor(habit.phase)));
    const priority = Math.max(1, Math.min(10, Math.floor(habit.priority)));

    return {
      title: (habit.title || 'Untitled Habit').substring(0, 255),
      description: (habit.description || '').substring(0, 1000),
      category,
      phase,
      frequency: normalizeFrequency(habit.frequency),
      duration: habit.duration ? Math.max(1, Math.floor(habit.duration)) : 15,
      priority,
    };
  });

  return {
    habits: normalizedHabits,
  };
}

function normalizeCategory(
  category: string
): 'foundational' | 'goal-specific' | 'barrier-targeting' {
  const lower = category.toLowerCase();
  if (lower.includes('foundational')) return 'foundational';
  if (lower.includes('goal') || lower.includes('specific')) return 'goal-specific';
  if (lower.includes('barrier') || lower.includes('targeting')) return 'barrier-targeting';
  return 'foundational';
}

function normalizeFrequency(frequency: string): string {
  const lower = frequency.toLowerCase();
  if (lower.includes('daily') || lower.includes('every day')) return 'daily';
  if (lower.includes('weekly') || lower.includes('once a week')) return 'weekly';
  if (lower.includes('weekend')) return 'weekends';
  if (lower.includes('weekday')) return 'weekdays';
  return frequency.substring(0, 100);
}
