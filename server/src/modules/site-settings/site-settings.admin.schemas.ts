import { z } from 'zod';

import { publicSettingKeys } from './site-settings.service.js';

// Body dạng { key: value } phẳng; strict + partial trên đúng allow-list public
// nên key lạ bị Zod 400 trước khi chạm DB.
export const updateAdminSiteSettingsSchema = z.object(
  Object.fromEntries(
    publicSettingKeys.map((key) => [key, z.string().trim()]),
  ) as Record<typeof publicSettingKeys[number], z.ZodString>,
).partial().strict().refine(
  (values) => Object.keys(values).length > 0,
  { message: 'Cần ít nhất một cài đặt để cập nhật.' },
);

export interface AdminSiteSetting {
  key: string;
  value: string;
  updatedAt: string;
}

export type UpdateAdminSiteSettingsInput = z.infer<typeof updateAdminSiteSettingsSchema>;
