import { and, asc, count, desc, eq, like } from 'drizzle-orm';

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
      // Sort chính theo priority (nhỏ trước, khớp semantics nguồn);
      // tie-break bằng ngày mới nhất rồi id để pagination ổn định.
      .orderBy(asc(blogPosts.priority), desc(blogPosts.publishedAt), desc(blogPosts.id))
      .limit(perPage)
      .offset(offset),
  ]);

  return {
    items: rows.map(toBlogListItem),
    total: totalRows[0]?.total ?? 0,
  };
}

// Nguồn resolve bài theo ID suffix `-s{id}t{n}`; phần text chỉ là SEO slug và
// clone đã normalize (bỏ emoji/dấu tổ hợp). Deep link nguồn với text slug khác
// vẫn phải mở đúng bài → fallback match theo suffix (unique trong DB).
const slugIdSuffixPattern = /-s\d+t\d+$/;

export async function getBlogBySlug(
  slug: string,
): Promise<BlogDetail | undefined> {
  let [row] = await db
    .select({ ...publicBlogFields, content: blogPosts.content })
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)))
    .limit(1);

  if (!row) {
    const suffix = slug.match(slugIdSuffixPattern)?.[0];
    if (suffix) {
      [row] = await db
        .select({ ...publicBlogFields, content: blogPosts.content })
        .from(blogPosts)
        .where(and(like(blogPosts.slug, `%${suffix}`), eq(blogPosts.isPublished, true)))
        .limit(1);
    }
  }

  if (!row) {
    return undefined;
  }

  return blogDetailSchema.parse({
    ...toBlogListItem(row),
    content: row.content,
  });
}
