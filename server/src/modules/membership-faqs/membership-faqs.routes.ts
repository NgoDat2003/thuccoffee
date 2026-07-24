import { Router } from 'express';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { ApiError } from '../../common/api-error.js';
import { ok } from '../../common/api-response.js';
import { db } from '../../db/client.js';
import { membershipFaqs } from '../../db/schema.js';

export const membershipFaqSchema = z.object({
  id: z.number().int(),
  question: z.string(),
  answer: z.string(),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
});

export const upsertMembershipFaqSchema = z.object({
  question: z.string().trim().min(1).max(1000),
  answer: z.string().trim().min(1).max(10_000),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
}).strict();

const idParamsSchema = z.object({ id: z.coerce.number().int().positive() });

export type MembershipFaq = z.infer<typeof membershipFaqSchema>;
export type UpsertMembershipFaqInput = z.infer<typeof upsertMembershipFaqSchema>;

export const membershipFaqsRoutes = Router();

// Public: chỉ FAQ đã publish, theo sortOrder ổn định.
membershipFaqsRoutes.get('/', async (_req, res) => {
  const rows = await db
    .select({
      id: membershipFaqs.id,
      question: membershipFaqs.question,
      answer: membershipFaqs.answer,
      sortOrder: membershipFaqs.sortOrder,
      isPublished: membershipFaqs.isPublished,
    })
    .from(membershipFaqs)
    .where(eq(membershipFaqs.isPublished, true))
    .orderBy(asc(membershipFaqs.sortOrder), asc(membershipFaqs.id));
  res.json(ok(membershipFaqSchema.array().parse(rows)));
});

export const membershipFaqsAdminRoutes = Router();

membershipFaqsAdminRoutes.get('/', async (_req, res) => {
  const rows = await db
    .select({
      id: membershipFaqs.id,
      question: membershipFaqs.question,
      answer: membershipFaqs.answer,
      sortOrder: membershipFaqs.sortOrder,
      isPublished: membershipFaqs.isPublished,
    })
    .from(membershipFaqs)
    .orderBy(asc(membershipFaqs.sortOrder), asc(membershipFaqs.id));
  res.json(ok(membershipFaqSchema.array().parse(rows)));
});

membershipFaqsAdminRoutes.post('/', async (req, res) => {
  const input = upsertMembershipFaqSchema.parse(req.body);
  const [created] = await db.insert(membershipFaqs).values(input).returning();
  if (!created) throw new Error('Insert membership FAQ did not return a row.');
  res.status(201).json(ok(membershipFaqSchema.parse(created)));
});

membershipFaqsAdminRoutes.put('/:id', async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const input = upsertMembershipFaqSchema.parse(req.body);
  const [updated] = await db
    .update(membershipFaqs)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(membershipFaqs.id, id))
    .returning();
  if (!updated) throw ApiError.notFound('Không tìm thấy câu hỏi.');
  res.json(ok(membershipFaqSchema.parse(updated)));
});

membershipFaqsAdminRoutes.delete('/:id', async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const [deleted] = await db
    .delete(membershipFaqs)
    .where(eq(membershipFaqs.id, id))
    .returning({ id: membershipFaqs.id });
  if (!deleted) throw ApiError.notFound('Không tìm thấy câu hỏi.');
  res.status(204).end();
});
