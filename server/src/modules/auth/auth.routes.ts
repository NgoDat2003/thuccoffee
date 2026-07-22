import { Router, type CookieOptions } from 'express';

import { requireAuth } from '../../common/auth-middleware.js';
import { ok } from '../../common/api-response.js';
import { env } from '../../common/env.js';
import { loginSchema } from './auth.schemas.js';
import { AUTH_COOKIE_NAME, login } from './auth.service.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  maxAge: SEVEN_DAYS_MS,
  path: '/',
};

const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  path: '/',
};

export const authRoutes = Router();

authRoutes.post('/login', async (req, res) => {
  const credentials = loginSchema.parse(req.body);
  const result = await login(credentials);
  res.cookie(AUTH_COOKIE_NAME, result.token, cookieOptions);
  res.json(ok(result.user));
});

authRoutes.get('/me', requireAuth, (req, res) => {
  res.json(ok(req.user!));
});

authRoutes.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, clearCookieOptions);
  res.status(204).end();
});
