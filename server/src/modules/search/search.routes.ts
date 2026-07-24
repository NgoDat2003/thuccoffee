import { Router } from 'express';

import { okPaginated } from '../../common/api-response.js';
import { validateQuery } from '../../common/validate.js';
import { searchQuerySchema, type SearchQuery } from './search.schemas.js';
import { search } from './search.service.js';

export const searchRoutes = Router();

searchRoutes.get('/', validateQuery(searchQuerySchema), async (_req, res) => {
  const query = res.locals.validatedQuery as SearchQuery;
  const result = await search(query);

  res.json(okPaginated(result, {
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
    totalPages: Math.ceil(result.total / query.pageSize),
  }));
});
