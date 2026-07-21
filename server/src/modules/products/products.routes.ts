import { Router } from 'express';

import { ApiError } from '../../common/api-error.js';
import { ok } from '../../common/api-response.js';
import { validateParams, validateQuery } from '../../common/validate.js';
import {
  listProductsQuerySchema,
  productParamsSchema,
  type ListProductsQuery,
  type ProductParams,
} from './products.schemas.js';
import { getProductBySlug, listProducts } from './products.service.js';

export const productsRoutes = Router();

productsRoutes.get(
  '/',
  validateQuery(listProductsQuerySchema),
  async (_req, res) => {
    const { category } = res.locals.validatedQuery as ListProductsQuery;
    res.json(ok(await listProducts(category)));
  },
);

productsRoutes.get(
  '/:slug',
  validateParams(productParamsSchema),
  async (_req, res) => {
    const { slug } = res.locals.validatedParams as ProductParams;
    const product = await getProductBySlug(slug);

    if (!product) {
      throw ApiError.notFound('Không tìm thấy sản phẩm.');
    }

    res.json(ok(product));
  },
);
