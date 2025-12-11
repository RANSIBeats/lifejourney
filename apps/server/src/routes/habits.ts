import express, { Response } from 'express';
import { generateHabits, getHabitPlanById } from '@services/habitGeneratorService';
import { GenerateHabitsRequestSchema } from '@/validators/habitGenerator';
import { asyncHandler, AppError } from '@middleware/errorHandler';
import { logger } from '@utils/logger';
import { AuthenticatedRequest, authMiddleware } from '@middleware/auth';

const router = express.Router();

// Require authentication for all habit routes
router.use(authMiddleware);

/**
 * POST /habits/generate
 * Generate habits for a user based on their goal and barriers
 *
 * Headers:
 *   Authorization: Bearer <Supabase JWT>
 *
 * Request Body:
 * {
 *   "goalTitle": "string (required)",
 *   "goalDescription": "string (optional)",
 *   "goalCategory": "string (optional)",
 *   "barriers": [
 *     {
 *       "title": "string (required)",
 *       "description": "string (optional)",
 *       "type": "string (optional)"
 *     }
 *   ]
 * }
 *
 * Response:
 * {
 *   "planId": "string",
 *   "goalId": "string",
 *   "habits": [ ... ],
 *   "summary": { ... }
 * }
 */
router.post(
  '/generate',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedRequest = GenerateHabitsRequestSchema.parse(req.body);

    if (!req.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    logger.info('Generating habits', {
      userId: req.userId,
      goalTitle: validatedRequest.goalTitle,
      barrierCount: validatedRequest.barriers.length,
    });

    const result = await generateHabits(validatedRequest, {
      userId: req.userId,
      userEmail: req.userEmail,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /habits/plan/:planId
 * Retrieve a generated habit plan with phases and habits
 */
router.get(
  '/plan/:planId',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { planId } = req.params;

    if (!planId) {
      throw new AppError(400, 'Plan ID is required');
    }

    if (!req.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const plan = await getHabitPlanById(planId, req.userId);

    res.status(200).json({
      success: true,
      data: plan,
    });
  })
);

export default router;
