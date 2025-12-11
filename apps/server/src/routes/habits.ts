import express, { Request, Response } from 'express';
import { generateHabits } from '@services/habitGeneratorService';
import {
  GenerateHabitsRequestSchema,
} from '@/validators/habitGenerator';
import { asyncHandler, AppError } from '@middleware/errorHandler';
import { logger } from '@utils/logger';

const router = express.Router();

/**
 * POST /habits/generate
 * Generate habits for a user based on their goal and barriers
 * 
 * Request Body:
 * {
 *   "userId": "string (required)",
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
 *   "habits": [
 *     {
 *       "id": "string",
 *       "title": "string",
 *       "description": "string",
 *       "category": "foundational|goal-specific|barrier-targeting",
 *       "phase": 1-4,
 *       "frequency": "string",
 *       "duration": "number (optional)",
 *       "priority": 1-10
 *     }
 *   ],
 *   "summary": {
 *     "foundationalCount": "number",
 *     "goalSpecificCount": "number",
 *     "barrierTargetingCount": "number",
 *     "totalCount": "number"
 *   }
 * }
 */
router.post(
  '/generate',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedRequest = GenerateHabitsRequestSchema.parse(req.body);

    logger.info('Generating habits', {
      userId: validatedRequest.userId,
      goalTitle: validatedRequest.goalTitle,
      barrierCount: validatedRequest.barriers.length,
    });

    // Generate habits
    const result = await generateHabits(validatedRequest);

    res.status(201).json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /habits/plan/:planId
 * Retrieve a generated habit plan
 */
router.get(
  '/plan/:planId',
  asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;

    if (!planId) {
      throw new AppError(400, 'Plan ID is required');
    }

    // Note: This would require adding the PrismaClient here
    // For now, this is a placeholder that documents the endpoint

    res.status(200).json({
      message: 'Plan retrieval endpoint - to be implemented with Prisma query',
      planId,
    });
  })
);

export default router;
