import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'editor']);

export const authUserSchema = z.object({
  email: z.string().email(),
  role: userRoleSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
