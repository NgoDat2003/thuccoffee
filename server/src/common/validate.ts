import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

export const validateQuery = (schema: ZodTypeAny): RequestHandler =>
  (req, res, next) => {
    res.locals.validatedQuery = schema.parse(req.query);
    next();
  };

export const validateParams = (schema: ZodTypeAny): RequestHandler =>
  (req, res, next) => {
    res.locals.validatedParams = schema.parse(req.params);
    next();
  };
