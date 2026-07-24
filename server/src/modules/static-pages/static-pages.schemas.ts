import { z } from 'zod';

// Key hợp lệ = các trang nội dung đơn đang public. Content là JSON theo shape
// từng trang (structured, giữ layout), do FE parse.
export const staticPageKeys = [
  'about',
  'membership',
  'careers',
  'delivery',
  'cookie-policy',
  'contact',
] as const;

export const staticPageParamsSchema = z.object({
  key: z.enum(staticPageKeys),
});

export const staticPageSchema = z.object({
  key: z.string(),
  title: z.string(),
  content: z.string(),
  updatedAt: z.string().datetime(),
});

// Shape content theo từng page — khớp type trong src/data/pages.ts. Validate
// server-side để admin lưu JSON sai cấu trúc không làm crash trang public.
const jobSchema = z.object({
  title: z.string(), shift: z.string(), district: z.string(), applyLink: z.string(),
});

const pageContentSchemas: Record<StaticPageKey, z.ZodTypeAny> = {
  about: z.object({ heading: z.string(), body: z.array(z.string()).min(1) }),
  membership: z.object({
    heading: z.string(),
    intro: z.string(),
    pointRule: z.string(),
    qrCaption: z.string(),
    tiers: z.array(z.object({
      spending: z.string(), name: z.string(), benefit: z.string(),
      maintenance: z.string().optional(),
    })).min(1),
    tierNotes: z.array(z.string()),
    support: z.string(),
  }),
  careers: z.object({
    heading: z.string(), intro: z.string(), notice: z.string(),
    applyText: z.string(), rolesHeading: z.string(), shiftsHeading: z.string(),
    area: z.string(), benefits: z.string(), responseTime: z.string(),
    support: z.string(), hashtags: z.string(),
    jobs: z.array(jobSchema).min(1),
  }),
  delivery: z.object({
    heading: z.string(), freeship: z.string(), intro: z.string(),
    channels: z.array(z.object({ label: z.string(), href: z.string() })).min(1),
    deliveryTime: z.string(),
    codes: z.array(z.object({ code: z.string(), description: z.string() })),
  }),
  'cookie-policy': z.object({
    heading: z.string(),
    sections: z.array(z.object({
      heading: z.string(), paragraphs: z.array(z.string()).min(1),
    })).min(1),
  }),
  contact: z.object({
    heading: z.string(), intro: z.string(), officeHeading: z.string(),
    hotline: z.string(), email: z.string(), location: z.string(),
  }),
};

export function validatePageContent(key: StaticPageKey, content: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Content phải là JSON hợp lệ.');
  }
  const result = pageContentSchemas[key].safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(
      `Content sai cấu trúc trang "${key}": ${issue?.path.join('.')} — ${issue?.message}`,
    );
  }
}

export const updateStaticPageSchema = z.object({
  title: z.string().trim().min(1).max(300),
  content: z.string().min(2).max(200_000),
}).strict();

export type StaticPageKey = (typeof staticPageKeys)[number];
export type StaticPage = z.infer<typeof staticPageSchema>;
export type UpdateStaticPageInput = z.infer<typeof updateStaticPageSchema>;
