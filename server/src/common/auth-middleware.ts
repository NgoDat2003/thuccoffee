import type { NextFunction, Request, Response } from 'express';

import { ApiError } from './api-error.js';
import type { AuthUser } from '../modules/auth/auth.schemas.js';
import { AUTH_COOKIE_NAME, verifyToken } from '../modules/auth/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME] as unknown;
  if (typeof token !== 'string' || token.length === 0) {
    next(ApiError.unauthorized('Bạn cần đăng nhập để tiếp tục.'));
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
