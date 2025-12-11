import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Starting database seed...');

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-user-001',
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  console.log(`Created user: ${user.id}`);

  // Create sample goal
  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Build a Fitness Routine',
      description: 'Develop consistent exercise habits to improve health and fitness',
      category: 'health',
    },
  });

  console.log(`Created goal: ${goal.id}`);

  // Create sample barriers
  const barrier1 = await prisma.barrier.create({
    data: {
      userId: user.id,
      goalId: goal.id,
      title: 'Lack of time',
      description: 'Busy work schedule with long hours',
      type: 'time-based',
    },
  });

  const barrier2 = await prisma.barrier.create({
    data: {
      userId: user.id,
      goalId: goal.id,
      title: 'Lack of motivation',
      description: 'Hard to stay motivated without accountability',
      type: 'psychological',
    },
  });

  console.log(`Created barriers: ${barrier1.id}, ${barrier2.id}`);

  // Create sample habit plan
  const plan = await prisma.habitPlan.create({
    data: {
      userId: user.id,
      goalId: goal.id,
      title: 'Fitness Journey - 4 Phase Habit Plan',
      phase1Count: 2,
      phase2Count: 2,
      phase3Count: 2,
      phase4Count: 2,
    },
  });

  console.log(`Created habit plan: ${plan.id}`);

  // Create sample habits
  const habits = await Promise.all([
    // Phase 1 - Foundational
    prisma.habit.create({
      data: {
        userId: user.id,
        goalId: goal.id,
        planId: plan.id,
        title: 'Morning Movement',
        description: 'Start your day with 10 minutes of stretching or light movement',
        category: 'foundational',
        phase: 1,
        frequency: 'daily',
        duration: 10,
        priority: 8,
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        goalId: goal.id,
        planId: plan.id,
        title: 'Evening Reflection',
        description: 'Reflect on your fitness progress for 5 minutes',
        category: 'foundational',
        phase: 1,
        frequency: 'daily',
        duration: 5,
        priority: 7,
      },
    }),

    // Phase 2 - Goal-Specific
    prisma.habit.create({
      data: {
        userId: user.id,
        goalId: goal.id,
        planId: plan.id,
        title: '30-Minute Workout',
        description: 'Dedicated exercise session (running, gym, or home workout)',
        category: 'goal-specific',
        phase: 2,
        frequency: 'daily',
        duration: 30,
        priority: 10,
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        goalId: goal.id,
        planId: plan.id,
        title: 'Meal Planning',
        description: 'Plan healthy meals for the next day',
        category: 'goal-specific',
        phase: 2,
        frequency: 'daily',
        duration: 15,
        priority: 9,
      },
    }),

    // Phase 3 - Barrier-Targeting
    prisma.habit.create({
      data: {
        userId: user.id,
        goalId: goal.id,
        barrierId: barrier1.id,
        planId: plan.id,
        title: 'Time Management Blocks',
        description: 'Schedule specific times for workouts to overcome time barriers',
        category: 'barrier-targeting',
        phase: 3,
        frequency: 'daily',
        duration: 5,
        priority: 9,
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        goalId: goal.id,
        barrierId: barrier2.id,
        planId: plan.id,
        title: 'Accountability Partner Check-in',
        description: 'Daily message with fitness buddy for motivation',
        category: 'barrier-targeting',
        phase: 3,
        frequency: 'daily',
        duration: 5,
        priority: 8,
      },
    }),

    // Phase 4 - Advanced
    prisma.habit.create({
      data: {
        userId: user.id,
        goalId: goal.id,
        planId: plan.id,
        title: 'Progressive Training',
        description: 'Increase workout intensity or duration by 5-10%',
        category: 'goal-specific',
        phase: 4,
        frequency: 'weekly',
        duration: 60,
        priority: 10,
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        goalId: goal.id,
        planId: plan.id,
        title: 'Performance Tracking',
        description: 'Analyze weekly progress and adjust plan',
        category: 'foundational',
        phase: 4,
        frequency: 'weekly',
        duration: 30,
        priority: 9,
      },
    }),
  ]);

  console.log(`Created ${habits.length} habits`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
