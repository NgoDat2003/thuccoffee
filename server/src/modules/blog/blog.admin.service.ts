import { count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';

import { ApiError } from '../../common/api-error.js';
import { isUniqueViolation } from '../../common/db-errors.js';
import { db } from '../../db/client.js';
import { blogPosts } from '../../db/schema.js';
import { sanitizeBlogContent } from './blog-content-sanitizer.js';
import type {
  AdminBlogListItem,
  AdminBlogPost,
  CreateAdminBlogInput,
  PublishAdminBlogInput,
  UpdateAdminBlogInput,
} from './blog.admin.schemas.js';

const adminBlogListFields = {
  id: blogPosts.id,
  title: blogPosts.title,
  slug: blogPosts.slug,
  cover: blogPosts.cover,
  summary: blogPosts.summary,
  publishedAt: blogPosts.publishedAt,
  isPublished: blogPosts.isPublished,
  createdAt: blogPosts.createdAt,
  updatedAt: blogPosts.updatedAt,
};

type AdminBlogRow = {
  id: number;
  title: string;
  slug: string;
  cover: string;
  summary: string;
  publishedAt: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toAdminBlogListItem(row: AdminBlogRow): AdminBlogListItem {
  return {
    ...row,
    publishedAt: row.publishedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function publishedAt(value: string): Date {
  return new Date(value + 'T00:00:00.000Z');
}

export async function listAdminBlog(
  page: number,
  limit: number,
  q?: string,
): Promise<{ items: AdminBlogListItem[]; total: number }> {
  const whereClause: SQL | undefined = q
    ? or(
        ilike(blogPosts.title, '%' + q + '%'),
        ilike(blogPosts.slug, '%' + q + '%'),
      )
    : undefined;
  const [totals, rows] = await Promise.all([
    db.select({ total: count() }).from(blogPosts).where(whereClause),
    db
      .select(adminBlogListFields)
      .from(blogPosts)
      .where(whereClause)
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.id))
      .limit(limit)
      .offset((page - 1) * limit),
  ]);
  return {
    items: rows.map(toAdminBlogListItem),
    total: totals[0]?.total ?? 0,
  };
}

export async function getAdminBlog(id: number): Promise<AdminBlogPost> {
  const [row] = await db
    .select({ ...adminBlogListFields, content: blogPosts.content })
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  if (!row) throw ApiError.notFound('Không tìm thấy bài viết.');
  return { ...toAdminBlogListItem(row), content: row.content ?? '' };
}

export async function createAdminBlog(
  input: CreateAdminBlogInput,
): Promise<AdminBlogPost> {
  try {
    const [created] = await db
      .insert(blogPosts)
      .values({
        title: input.title,
        slug: input.slug,
        cover: input.cover,
        summary: input.summary,
        content: sanitizeBlogContent(input.content),
        publishedAt: publishedAt(input.publishedAt),
      })
      .returning({ id: blogPosts.id });
    if (!created) throw new Error('Insert blog post did not return an id.');
    return getAdminBlog(created.id);
  } catch (cause) {
    if (isUniqueViolation(cause)) {
      throw ApiError.conflict('Slug bài viết đã tồn tại.');
    }
    throw cause;
  }
}

export async function updateAdminBlog(
  id: number,
  input: UpdateAdminBlogInput,
): Promise<AdminBlogPost> {
  const [updated] = await db
    .update(blogPosts)
    .set({
      title: input.title,
      cover: input.cover,
      summary: input.summary,
      content: sanitizeBlogContent(input.content),
      publishedAt: publishedAt(input.publishedAt),
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id))
    .returning({ id: blogPosts.id });
  if (!updated) throw ApiError.notFound('Không tìm thấy bài viết.');
  return getAdminBlog(id);
}

export async function publishAdminBlog(
  id: number,
  input: PublishAdminBlogInput,
): Promise<AdminBlogPost> {
  const [updated] = await db
    .update(blogPosts)
    .set({ isPublished: input.isPublished, updatedAt: new Date() })
    .where(eq(blogPosts.id, id))
    .returning({ id: blogPosts.id });
  if (!updated) throw ApiError.notFound('Không tìm thấy bài viết.');
  return getAdminBlog(id);
}
export function previewAdminBlogContent(content: string): { html: string } {
  return { html: sanitizeBlogContent(content) };
}