import { z } from 'zod';

// `website` là honeypot: field ẩn trên form, người thật để trống.
// Bot điền vào thì server giả vờ thành công nhưng không lưu.
export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(1).max(5000),
  website: z.string().max(200).optional(),
}).strict();

export const newsletterSubscriptionSchema = z.object({
  email: z.string().trim().email().max(320),
  website: z.string().max(200).optional(),
}).strict();

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
export type NewsletterSubscriptionInput = z.infer<typeof newsletterSubscriptionSchema>;
