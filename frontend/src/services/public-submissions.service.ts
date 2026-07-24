import { useMutation } from '@tanstack/react-query';

import type {
  ContactSubmissionInput,
  NewsletterSubscriptionInput,
} from '@server/src/modules/public-submissions/public-submissions.schemas';
import { apiPost } from '../lib/api';

export function useSubmitContact() {
  return useMutation({
    mutationFn: (input: ContactSubmissionInput) =>
      apiPost<{ received: boolean }>('/submissions/contact', input),
  });
}

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: (input: NewsletterSubscriptionInput) =>
      apiPost<{ subscribed: boolean }>('/submissions/newsletter', input),
  });
}
