import { NextFunction, Request, Response } from 'express';
import { getSupabaseAdminClient } from '@lib/supabaseClient';
import { AppError } from '@middleware/errorHandler';
import { logger } from '@utils/logger';

export interface AuthenticatedRequest extends Request {
  userId: string;
  userEmail?: string;
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.headers.authorization || req.headers.Authorization;

  if (!authorization || typeof authorization !== 'string') {
    return next(new AppError(401, 'Authorization header is required'));
  }

  const token = authorization.startsWith('Bearer ')
    ? authorization.split('Bearer ')[1].trim()
    : '';

  if (!token) {
    return next(new AppError(401, 'Authorization token is missing'));
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      logger.warn('Invalid Supabase token provided', { error });
      return next(new AppError(401, 'Invalid or expired token'));
    }

    req.userId = data.user.id;
    req.userEmail = data.user.email ?? undefined;

    next();
  } catch (error) {
    logger.error('Failed to authenticate request', { error });
    next(new AppError(401, 'Unauthorized'));
  }
}
