import { Router } from 'express';

import { ok, okPaginated } from '../../common/api-response.js';
import {
  adminBlogIdParamsSchema,
  createAdminBlogSchema,
  listAdminBlogQuerySchema,
  publishAdminBlogSchema,
  previewAdminBlogSchema,
  updateAdminBlogSchema,
} from './blog.admin.schemas.js';
import {
  createAdminBlog,
  getAdminBlog,
  listAdminBlog,
  publishAdminBlog,
  previewAdminBlogContent,
  updateAdminBlog,
} from './blog.admin.service.js';

export const blogAdminRoutes = Router();

blogAdminRoutes.get('/', async (req, res) => {
  const query = listAdminBlogQuerySchema.parse(req.query);
  const { items, total } = await listAdminBlog(query);
  res.json(okPaginated(items, {
    page: query.page,
    pageSize: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  }));
});

blogAdminRoutes.get('/:id', async (req, res) => {
  const { id } = adminBlogIdParamsSchema.parse(req.params);
  res.json(ok(await getAdminBlog(id)));
});

blogAdminRoutes.post('/preview', (req, res) => {
  const { content } = previewAdminBlogSchema.parse(req.body);
  res.json(ok(previewAdminBlogContent(content)));
});

blogAdminRoutes.post('/', async (req, res) => {
  const input = createAdminBlogSchema.parse(req.body);
  res.status(201).json(ok(await createAdminBlog(input)));
});

blogAdminRoutes.put('/:id', async (req, res) => {
  const { id } = adminBlogIdParamsSchema.parse(req.params);
  const input = updateAdminBlogSchema.parse(req.body);
  const preserveContent = req.get('X-Thuc-Preserve-Blog-Content') === 'true';
  res.json(ok(await updateAdminBlog(id, input, { preserveContent })));
});

blogAdminRoutes.patch('/:id/publish', async (req, res) => {
  const { id } = adminBlogIdParamsSchema.parse(req.params);
  const input = publishAdminBlogSchema.parse(req.body);
  res.json(ok(await publishAdminBlog(id, input)));
});
