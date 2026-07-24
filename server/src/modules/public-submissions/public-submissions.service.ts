import { db } from '../../db/client.js';
import { contactSubmissions, newsletterSubscriptions } from '../../db/schema.js';
import type {
  ContactSubmissionInput,
  NewsletterSubscriptionInput,
} from './public-submissions.schemas.js';

export async function createContactSubmission(
  input: ContactSubmissionInput,
): Promise<{ received: boolean }> {
  // Honeypot dính bot: trả về như thành công nhưng không lưu.
  if (input.website) {
    return { received: true };
  }

  await db.insert(contactSubmissions).values({
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    message: input.message,
  });

  return { received: true };
}

export async function subscribeNewsletter(
  input: NewsletterSubscriptionInput,
): Promise<{ subscribed: boolean }> {
  if (input.website) {
    return { subscribed: true };
  }

  // Idempotent: email đã có thì kích hoạt lại thay vì tạo bản ghi lặp.
  await db
    .insert(newsletterSubscriptions)
    .values({ email: input.email.toLowerCase() })
    .onConflictDoUpdate({
      target: newsletterSubscriptions.email,
      set: { isActive: true, updatedAt: new Date() },
    });

  return { subscribed: true };
}
