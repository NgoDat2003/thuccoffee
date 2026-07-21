import { and, count, desc, eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { blogPosts } from '../../db/schema.js';
import {
  blogDetailSchema,
  blogListItemSchema,
  type BlogDetail,
  type BlogListItem,
} from './blog.schemas.js';

const publicBlogFields = {
  title: blogPosts.title,
  slug: blogPosts.slug,
  cover: blogPosts.cover,
  publishedAt: blogPosts.publishedAt,
  summary: blogPosts.summary,
};

function toBlogListItem(row: {
  title: string;
  slug: string;
  cover: string;
  publishedAt: Date;
  summary: string;
}): BlogListItem {
  return blogListItemSchema.parse({
    title: row.title,
    slug: row.slug,
    cover: row.cover,
    date: row.publishedAt.toISOString(),
    summary: row.summary,
  });
}

export async function listBlog(
  page: number,
  perPage = 5,
): Promise<{ items: BlogListItem[]; total: number }> {
  const offset = (page - 1) * perPage;
  const publishedOnly = eq(blogPosts.isPublished, true);

  const [totalRows, rows] = await Promise.all([
    db
      .select({ total: count() })
      .from(blogPosts)
      .where(publishedOnly),
    db
      .select(publicBlogFields)
      .from(blogPosts)
      .where(publishedOnly)
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.id))
      .limit(perPage)
      .offset(offset),
  ]);

  return {
    items: rows.map(toBlogListItem),
    total: totalRows[0]?.total ?? 0,
  };
}

export async function getBlogBySlug(
  slug: string,
): Promise<BlogDetail | undefined> {
  const [row] = await db
    .select({ ...publicBlogFields, content: blogPosts.content })
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)))
    .limit(1);

  if (!row) {
    return undefined;
  }

  return blogDetailSchema.parse({
    ...toBlogListItem(row),
    content: row.content,
  });
}
