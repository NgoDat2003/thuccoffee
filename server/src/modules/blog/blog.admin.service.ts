import { and, asc, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';

import { ApiError } from '../../common/api-error.js';
import { isUniqueViolation } from '../../common/db-errors.js';
import { db } from '../../db/client.js';
import { blogPosts } from '../../db/schema.js';
import { sanitizeBlogContent } from './blog-content-sanitizer.js';
import type {
  AdminBlogListItem,
  AdminBlogPost,
  CreateAdminBlogInput,
  ListAdminBlogQuery,
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
  priority: blogPosts.priority,
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
  priority: number;
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

function adminBlogWhere(query: ListAdminBlogQuery): SQL | undefined {
  const conditions: SQL[] = [];
  if (query.q) {
    const search = or(
      ilike(blogPosts.title, '%' + query.q + '%'),
      ilike(blogPosts.slug, '%' + query.q + '%'),
    );
    if (search) conditions.push(search);
  }
  if (query.status !== 'all') {
    conditions.push(eq(blogPosts.isPublished, query.status === 'published'));
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function adminBlogOrder(query: ListAdminBlogQuery): [SQL, SQL] {
  const direction = query.sortDir === 'asc' ? asc : desc;
  const stableOrder = desc(blogPosts.id);

  switch (query.sortBy) {
    case 'title':
      return [direction(blogPosts.title), stableOrder];
    case 'updatedAt':
      return [direction(blogPosts.updatedAt), stableOrder];
    default:
      return [direction(blogPosts.publishedAt), stableOrder];
  }
}

export async function listAdminBlog(
  query: ListAdminBlogQuery,
): Promise<{ items: AdminBlogListItem[]; total: number }> {
  const whereClause = adminBlogWhere(query);
  const [primaryOrder, stableOrder] = adminBlogOrder(query);
  const [totals, rows] = await Promise.all([
    db.select({ total: count() }).from(blogPosts).where(whereClause),
    db
      .select(adminBlogListFields)
      .from(blogPosts)
      .where(whereClause)
      .orderBy(primaryOrder, stableOrder)
      .limit(query.limit)
      .offset((query.page - 1) * query.limit),
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
        ...(input.priority === undefined ? {} : { priority: input.priority }),
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
  options: { preserveContent?: boolean } = {},
): Promise<AdminBlogPost> {
  const contentUpdate: { content?: string } = {};
  if (!options.preserveContent) {
    const [current] = await db
      .select({ content: blogPosts.content })
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);
    if (!current) throw ApiError.notFound('Không tìm thấy bài viết.');
    contentUpdate.content = input.content === current.content
      ? current.content
      : sanitizeBlogContent(input.content);
  }

  const [updated] = await db
    .update(blogPosts)
    .set({
      title: input.title,
      cover: input.cover,
      summary: input.summary,
      ...contentUpdate,
      publishedAt: publishedAt(input.publishedAt),
      ...(input.priority === undefined ? {} : { priority: input.priority }),
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
