import { expect, type Page, type TestInfo } from '@playwright/test';

export const adminEmail = process.env.ADMIN_EMAIL ?? '';
export const adminPassword = process.env.ADMIN_PASSWORD ?? '';
export const e2ePrefix = `e2e-admin-ui-${Date.now()}`;

export function requireAdminCredentials() {
  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required for admin E2E tests.');
  }
}

export async function login(page: Page) {
  requireAdminCredentials();
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(adminEmail);
  await page.getByLabel('Mật khẩu').fill(adminPassword);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
}

export async function openAdminPage(page: Page, path: string, heading: string) {
  await page.goto(path);
  await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
}

export async function assertNoPageOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(sizes.document, `horizontal overflow: ${JSON.stringify(sizes)}`).toBeLessThanOrEqual(sizes.viewport + 1);
}

export async function screenshot(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({
    path: testInfo.outputPath(`${name}.png`),
    fullPage: true,
    animations: 'disabled',
  });
}

export async function cleanupCategories(page: Page) {
  await page.goto('/admin/categories');
  if (/\/admin\/login$/.test(page.url())) {
    await login(page);
    await page.goto('/admin/categories');
  }
  await expect(page.getByRole('heading', { name: 'Danh mục', level: 1 })).toBeVisible();
  await page.getByLabel('Tìm danh mục').fill('e2e-admin-ui-');

  for (let remaining = 20; remaining > 0; remaining -= 1) {
    const row = page.getByRole('row').filter({ hasText: 'e2e-admin-ui-' }).first();
    if (await row.count() === 0) return;
    await row.getByRole('button', { name: 'Xóa' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Xóa danh mục' }).click();
    await expect(row).toBeHidden();
  }
  throw new Error('Category cleanup exceeded 20 records.');
}
