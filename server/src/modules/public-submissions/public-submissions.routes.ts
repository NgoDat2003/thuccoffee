import { Router } from 'express';

import { ok } from '../../common/api-response.js';
import {
  contactSubmissionSchema,
  newsletterSubscriptionSchema,
} from './public-submissions.schemas.js';
import {
  createContactSubmission,
  subscribeNewsletter,
} from './public-submissions.service.js';

export const publicSubmissionsRoutes = Router();

publicSubmissionsRoutes.post('/contact', async (req, res) => {
  const input = contactSubmissionSchema.parse(req.body);
  res.status(201).json(ok(await createContactSubmission(input)));
});

publicSubmissionsRoutes.post('/newsletter', async (req, res) => {
  const input = newsletterSubscriptionSchema.parse(req.body);
  res.status(201).json(ok(await subscribeNewsletter(input)));
});
