import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { ApiError } from '../../common/api-error.js';
import { env } from '../../common/env.js';
import { db } from '../../db/client.js';
import { users } from '../../db/schema.js';
import {
  authUserSchema,
  type AuthUser,
  type LoginInput,
  userRoleSchema,
} from './auth.schemas.js';

const INVALID_CREDENTIALS_MESSAGE = 'Email hoặc mật khẩu không đúng.';
const TOKEN_INVALID_MESSAGE = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
export const AUTH_COOKIE_NAME = 'admin_token';

const dummyPasswordHashPromise = argon2.hash('dummy-auth-password-never-used', {
  type: argon2.argon2id,
});

const tokenPayloadSchema = z.object({
  email: z.string().email(),
  role: userRoleSchema,
});

export interface LoginResult {
  user: AuthUser;
  token: string;
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const normalizedEmail = input.email.toLowerCase();
  const [record] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  const hashToVerify = record?.passwordHash ?? await dummyPasswordHashPromise;
  const passwordMatches = await argon2.verify(hashToVerify, input.password);

  if (!record || !passwordMatches) {
    throw ApiError.unauthorized(INVALID_CREDENTIALS_MESSAGE);
  }

  const user = authUserSchema.parse({ email: record.email, role: record.role });
  const token = jwt.sign(
    { email: user.email, role: user.role },
    env.JWT_SECRET,
    { subject: String(record.id), expiresIn: '7d' },
  );

  return { user, token };
}

export function verifyToken(token: string): AuthUser {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return tokenPayloadSchema.parse(decoded);
  } catch {
    throw ApiError.unauthorized(TOKEN_INVALID_MESSAGE);
  }
}
