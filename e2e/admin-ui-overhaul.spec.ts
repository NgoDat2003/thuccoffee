import { expect, test } from '@playwright/test';

import {
  assertNoPageOverflow,
  cleanupCategories,
  e2ePrefix,
  login,
  openAdminPage,
  requireAdminCredentials,
  screenshot,
} from './admin-test-helpers';

test.describe.configure({ mode: 'serial' });

test.beforeAll(() => requireAdminCredentials());

test('login, logout, and protected-route guard', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('navigation', { name: 'Điều hướng quản trị' })).toBeVisible();
  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto('/admin/categories');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('table workspaces support filter, sort, selection, drawer, and category CRUD', async ({ page }) => {
  await login(page);
  await openAdminPage(page, '/admin/products', 'Sản phẩm');

  const productSort = page.getByRole('button', { name: /^Sản phẩm/ });
  await productSort.click();
  await expect(productSort.locator('xpath=ancestor::th')).toHaveAttribute('aria-sort', 'ascending');
  const firstProduct = page.locator('tbody input[type="checkbox"]').first();
  await firstProduct.check();
  await expect(page.getByText('Đã chọn 1 sản phẩm', { exact: true })).toBeVisible();
  const selectAll = page.getByRole('checkbox', { name: /Chọn tất cả sản phẩm/ });
  await expect(selectAll).toHaveJSProperty('indeterminate', true);
  await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
  await expect(page.getByRole('dialog', { name: 'Thêm sản phẩm' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();

  await openAdminPage(page, '/admin/categories', 'Danh mục');
  const contentWidth = await page.locator('main section').first().evaluate((node) => node.getBoundingClientRect().width);
  expect(contentWidth).toBeGreaterThan(900);
  for (const heading of ['Key (URL)', 'Sản phẩm', 'Thứ tự', 'Thao tác']) {
    await expect(page.getByRole('columnheader').filter({ hasText: heading })).toHaveCSS('text-align', 'center');
  }
  const firstCategoryRow = page.locator('tbody tr').first();
  for (const columnIndex of [1, 2, 3, 4]) {
    await expect(firstCategoryRow.locator('td').nth(columnIndex)).toHaveCSS('text-align', 'center');
  }
  await expect(firstCategoryRow.locator('td').nth(4).locator('div')).toHaveCSS('justify-content', 'center');
  const categoryName = `${e2ePrefix}-category`;
  await page.getByPlaceholder(/Tên danh mục mới/).fill(categoryName);
  await page.getByRole('button', { name: 'Thêm danh mục' }).click();
  await page.getByLabel('Tìm danh mục').fill(e2ePrefix);
  await expect(page.getByText(categoryName, { exact: true })).toBeVisible();
  const row = page.getByRole('row').filter({ hasText: categoryName });
  await row.getByRole('button', { name: 'Sửa' }).click();
  await row.getByRole('textbox', { name: /Tên danh mục/ }).fill(`${categoryName}-edited`);
  await row.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByText(`${categoryName}-edited`, { exact: true })).toBeVisible();
  await page.getByRole('row').filter({ hasText: `${categoryName}-edited` }).getByRole('button', { name: 'Xóa' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xóa danh mục' }).click();
  await expect(page.getByText(`${categoryName}-edited`, { exact: true })).toBeHidden();
});

test('blog supports server pagination, safe preview, upload UI, and dirty guard', async ({ page }) => {
  await login(page);
  await openAdminPage(page, '/admin/blog', 'Bài viết');
  await page.getByPlaceholder('Tìm tiêu đề hoặc slug').fill('Thức');
  await page.getByLabel('Lọc trạng thái bài viết').selectOption('published');
  await page.getByRole('button', { name: /^Bài viết/ }).click();
  await expect(page.getByRole('columnheader', { name: /Bài viết/ })).toHaveAttribute('aria-sort', 'ascending');
  await page.getByPlaceholder('Tìm tiêu đề hoặc slug').fill('');
  await page.getByLabel('Lọc trạng thái bài viết').selectOption('all');
  await page.getByRole('button', { name: 'Trang 2', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Trang 2', exact: true })).toHaveAttribute('aria-current', 'page');

  await page.getByRole('link', { name: 'Thêm bài viết' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm bài viết' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Trực quan' })).toBeEnabled();
  await page.route('**/api/admin/uploads', (route) => route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      data: { objectKey: 'blog/249fc9a9_post-17042023.png' },
    }),
  }));
  await page.locator('input[type="file"]').last().setInputFiles({
    name: 'e2e-cover.png',
    mimeType: 'image/png',
    buffer: Buffer.from('e2e'),
  });
  await expect(page.getByRole('button', { name: 'Chọn ảnh khác' })).toBeVisible();
  await page.unroute('**/api/admin/uploads');
  await page.getByLabel('Tiêu đề').fill(`${e2ePrefix}-dirty`);
  await page.getByLabel('Slug').fill(`${e2ePrefix}-dirty`);
  await page.getByLabel('Tóm tắt').fill('E2E preview summary');
  await page.getByLabel('Ngày đăng').fill('2026-07-23');
  await page.locator('.ProseMirror').fill('E2E preview content');
  await page.getByRole('button', { name: 'Preview an toàn' }).click();
  await expect(page.getByText('E2E preview content', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Quay lại soạn thảo' }).click();
  await page.getByRole('link', { name: 'Danh sách bài viết' }).click();
  await expect(page.getByRole('dialog', { name: 'Rời trang khi chưa lưu?' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Hủy' }).click();
});

test('store gallery, banner lifecycle, and settings public reflection remain usable', async ({ page }) => {
  await login(page);
  await openAdminPage(page, '/admin/stores', 'Cửa hàng');
  await page.getByLabel('Sắp xếp cửa hàng').selectOption('name');
  await page.getByRole('button', { name: 'Sửa' }).first().click();
  const storeDialog = page.getByRole('dialog', { name: 'Sửa cửa hàng' });
  await expect(storeDialog.getByText(/Thư viện/)).toBeVisible();
  const galleryKey = 'stores/18fd29ae_t8.jpg';
  await page.route('**/api/admin/uploads', (route) => route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: { objectKey: galleryKey } }),
  }));
  await storeDialog.locator('input[type="file"]').last().setInputFiles({
    name: 'e2e-gallery.png',
    mimeType: 'image/png',
    buffer: Buffer.from('e2e'),
  });
  await expect(storeDialog.getByText(galleryKey, { exact: true })).toBeVisible();
  await storeDialog.getByRole('button', { name: 'Lưu gallery' }).click();
  await expect(page.getByText('Đã lưu gallery.', { exact: true })).toBeVisible();
  const addedGalleryRow = storeDialog.getByRole('listitem').filter({ hasText: galleryKey });
  await addedGalleryRow.getByRole('button', { name: 'Xóa ảnh' }).click();
  await storeDialog.getByRole('button', { name: 'Lưu gallery' }).click();
  await page.unroute('**/api/admin/uploads');
  await page.keyboard.press('Escape');

  await openAdminPage(page, '/admin/banners', 'Banner');
  await page.getByRole('button', { name: /Slider trang chủ/ }).click();
  await expect(page.getByRole('button', { name: /Slider trang chủ/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Thêm banner' }).click();
  const bannerDialog = page.getByRole('dialog', { name: 'Thêm banner' });
  await expect(bannerDialog).toBeVisible();
  await expect(bannerDialog.getByText('Vị trí hiển thị')).toBeVisible();
  await page.keyboard.press('Escape');

  await openAdminPage(page, '/admin/settings', 'Cài đặt website');
  const tagline = page.locator('#setting-tagline');
  const originalTagline = await tagline.inputValue();
  const marker = `${originalTagline} ${e2ePrefix}`.trim();
  await tagline.fill(marker);
  await page.getByRole('button', { name: 'Lưu cài đặt' }).click();
  await expect(page.getByText('Đã lưu cài đặt website.', { exact: true })).toBeVisible();
  const publicSettings = await page.evaluate(async () => (await fetch('/api/site-settings')).text());
  expect(publicSettings).toContain(marker);
  await tagline.fill(originalTagline);
  await page.getByRole('button', { name: 'Lưu cài đặt' }).click();
  await expect(page.getByText('Đã lưu cài đặt website.', { exact: true })).toBeVisible();
});

test('all admin resources have five-width evidence and no page overflow', async ({ page }, testInfo) => {
  await login(page);
  const viewports = [375, 768, 1024, 1440, 1920];
  const resources = [
    ['/admin/products', 'Sản phẩm', 'products'],
    ['/admin/categories', 'Danh mục', 'categories'],
    ['/admin/blog', 'Bài viết', 'blog'],
    ['/admin/stores', 'Cửa hàng', 'stores'],
    ['/admin/banners', 'Banner', 'banners'],
    ['/admin/settings', 'Cài đặt website', 'settings'],
  ] as const;
  for (const width of viewports) {
    await page.setViewportSize({ width, height: 900 });
    for (const [path, heading, name] of resources) {
      await openAdminPage(page, path, heading);
      await assertNoPageOverflow(page);
      await screenshot(page, testInfo, `${name}-${width}`);
    }
  }
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.title.includes('category CRUD')) await cleanupCategories(page);
});
