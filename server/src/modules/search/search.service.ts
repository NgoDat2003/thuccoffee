import { and, count, desc, asc, eq, ilike, or, type SQL } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { blogPosts, products } from '../../db/schema.js';
import {
  blogSearchItemSchema,
  productSearchItemSchema,
  type SearchQuery,
  type SearchResult,
} from './search.schemas.js';

// Escape ký tự wildcard của LIKE để keyword người dùng match theo nghĩa đen.
function toLikePattern(keyword: string): string {
  return `%${keyword.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

async function searchProducts(
  keyword: string,
  page: number,
  pageSize: number,
): Promise<Extract<SearchResult, { type: 'product' }>> {
  const pattern = toLikePattern(keyword);
  const whereClause: SQL = and(
    eq(products.isPublished, true),
    or(
      ilike(products.name, pattern),
      ilike(products.description, pattern),
    ),
  )!;

  const [totalRows, rows] = await Promise.all([
    db.select({ total: count() }).from(products).where(whereClause),
    db
      .select({
        name: products.name,
        slug: products.slug,
        price: products.price,
        priceEstimated: products.priceEstimated,
        thumb: products.thumb,
      })
      .from(products)
      .where(whereClause)
      .orderBy(asc(products.sortOrder), asc(products.name))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
  ]);

  return {
    type: 'product',
    items: productSearchItemSchema.array().parse(rows),
    total: totalRows[0]?.total ?? 0,
  };
}

async function searchBlog(
  keyword: string,
  page: number,
  pageSize: number,
): Promise<Extract<SearchResult, { type: 'blog' }>> {
  const pattern = toLikePattern(keyword);
  const whereClause: SQL = and(
    eq(blogPosts.isPublished, true),
    or(
      ilike(blogPosts.title, pattern),
      ilike(blogPosts.summary, pattern),
      ilike(blogPosts.content, pattern),
    ),
  )!;

  const [totalRows, rows] = await Promise.all([
    db.select({ total: count() }).from(blogPosts).where(whereClause),
    db
      .select({
        title: blogPosts.title,
        slug: blogPosts.slug,
        cover: blogPosts.cover,
        publishedAt: blogPosts.publishedAt,
        summary: blogPosts.summary,
      })
      .from(blogPosts)
      .where(whereClause)
      .orderBy(
        asc(blogPosts.priority),
        desc(blogPosts.publishedAt),
        desc(blogPosts.id),
      )
      .limit(pageSize)
      .offset((page - 1) * pageSize),
  ]);

  return {
    type: 'blog',
    items: blogSearchItemSchema.array().parse(rows.map((row) => ({
      title: row.title,
      slug: row.slug,
      cover: row.cover,
      date: row.publishedAt.toISOString(),
      summary: row.summary,
    }))),
    total: totalRows[0]?.total ?? 0,
  };
}

export async function search(query: SearchQuery): Promise<SearchResult> {
  if (query.type === 'product') {
    return searchProducts(query.keyword, query.page, query.pageSize);
  }
  return searchBlog(query.keyword, query.page, query.pageSize);
}
