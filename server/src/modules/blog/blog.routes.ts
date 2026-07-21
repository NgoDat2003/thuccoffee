import { Router } from 'express';

import { ApiError } from '../../common/api-error.js';
import { ok, okPaginated } from '../../common/api-response.js';
import { validateParams, validateQuery } from '../../common/validate.js';
import {
  blogParamsSchema,
  listBlogQuerySchema,
  type BlogParams,
  type ListBlogQuery,
} from './blog.schemas.js';
import { getBlogBySlug, listBlog } from './blog.service.js';

const BLOG_PAGE_SIZE = 5;

export const blogRoutes = Router();

blogRoutes.get('/', validateQuery(listBlogQuerySchema), async (_req, res) => {
  const { page } = res.locals.validatedQuery as ListBlogQuery;
  const { items, total } = await listBlog(page, BLOG_PAGE_SIZE);

  res.json(okPaginated(items, {
    page,
    pageSize: BLOG_PAGE_SIZE,
    total,
    totalPages: Math.ceil(total / BLOG_PAGE_SIZE),
  }));
});

blogRoutes.get('/:slug', validateParams(blogParamsSchema), async (_req, res) => {
  const { slug } = res.locals.validatedParams as BlogParams;
  const post = await getBlogBySlug(slug);

  if (!post) {
    throw ApiError.notFound('Không tìm thấy bài viết.');
  }

  res.json(ok(post));
});
