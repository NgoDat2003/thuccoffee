// Smoke: product options + stickers — admin gắn option/sticker phản ánh ra
// public product detail. Cần ADMIN_EMAIL/ADMIN_PASSWORD.
import { randomUUID } from 'node:crypto';

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

interface HttpResult<T> {
  status: number;
  body?: ApiResponse<T>;
}

interface PublicProduct {
  slug: string;
  price: number;
  options: Array<{ name: string; price: number }>;
  stickers: Array<{ label: string; color: string }>;
}

interface AdminProduct {
  id: number;
  slug: string;
  optionLinks: Array<{ optionId: number; name: string; price: number }>;
  stickers: Array<{ id: number; label: string }>;
  // Các field còn lại giữ nguyên khi round-trip update.
  name: string;
  price: number | null;
  priceEstimated: boolean;
  thumb: string;
  image: string | null;
  description: string | null;
  sortOrder: number;
  isFeatured: boolean;
  showOnHome: boolean;
  homePriority: number;
  categories: Array<{ id: number }>;
}

interface AdminSticker {
  id: number;
  label: string;
}

const baseUrl = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8080').replace(/\/$/, '');
const adminEmail = process.env.ADMIN_EMAIL ?? '';
const adminPassword = process.env.ADMIN_PASSWORD ?? '';

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
}

let cookie = '';
let failures = 0;
const marker = `smoke-${randomUUID()}`;
let stickerId: number | undefined;
let targetProduct: AdminProduct | undefined;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<HttpResult<T>> {
  const response = await fetch(baseUrl + path, init);
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) as ApiResponse<T> : undefined };
}

function jsonRequest<T>(method: string, path: string, body?: unknown) {
  return request<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function get<T>(path: string, authenticated = false) {
  return request<T>(path, {
    headers: authenticated && cookie ? { Cookie: cookie } : undefined,
  });
}

function expectSuccess<T>(result: HttpResult<T>, status = 200): T {
  assert(result.status === status, `Expected ${status}, received ${result.status}`);
  assert(result.body?.success, 'Expected success:true');
  return result.body.data;
}

function toUpdatePayload(product: AdminProduct) {
  return {
    name: product.name,
    price: product.price ?? 0,
    priceEstimated: product.priceEstimated,
    thumb: product.thumb,
    image: product.image,
    description: product.description,
    sortOrder: product.sortOrder,
    isFeatured: product.isFeatured,
    showOnHome: product.showOnHome,
    homePriority: product.homePriority,
    categoryIds: product.categories.map((category) => category.id),
    optionLinks: product.optionLinks.map((link) => ({ optionId: link.optionId, price: link.price })),
    stickerIds: product.stickers.map((sticker) => sticker.id),
  };
}

async function check(name: string, run: () => Promise<void>): Promise<void> {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const loginResponse = await fetch(baseUrl + '/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: adminEmail, password: adminPassword }),
});
assert(loginResponse.ok, `Login failed: ${loginResponse.status}`);
cookie = (loginResponse.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
assert(cookie, 'Expected auth cookie from login');

await check('seeded Americano options are public', async () => {
  const data = expectSuccess(await get<PublicProduct>('/api/products/americano-s153t2'));
  const names = data.options.map((option) => option.name);
  assert(names.includes('Nóng'), 'Expected seeded Nóng option');
  assert(
    data.options.some((option) => option.name === 'Lạnh Size L' && option.price === 55000),
    'Expected Lạnh Size L = 55000 from seed evidence',
  );
});

await check('GET /admin/product-options master list', async () => {
  const data = expectSuccess(await get<Array<{ id: number; name: string }>>('/api/admin/product-options', true));
  assert(data.length >= 8, 'Expected at least 8 seeded options');
});

await check('sticker create → attach to product → public shows it', async () => {
  const sticker = expectSuccess(await jsonRequest<AdminSticker>('POST', '/api/admin/stickers', {
    label: marker,
    color: '#ff0000',
  }), 201);
  stickerId = sticker.id;

  const adminProducts = expectSuccess(await get<AdminProduct[]>('/api/admin/products', true));
  const americano = adminProducts.find((product) => product.slug === 'americano-s153t2');
  assert(americano, 'Expected Americano in admin list');
  targetProduct = americano;

  const payload = toUpdatePayload(americano);
  payload.stickerIds = [...payload.stickerIds, sticker.id];
  expectSuccess(await jsonRequest<AdminProduct>('PUT', `/api/admin/products/${americano.id}`, payload));

  const publicProduct = expectSuccess(await get<PublicProduct>('/api/products/americano-s153t2'));
  assert(
    publicProduct.stickers.some((item) => item.label === marker),
    'Public product must show attached sticker',
  );
});

await check('sticker delete cascades off product', async () => {
  assert(stickerId !== undefined && targetProduct, 'Depends on previous check');
  const deleteResult = await jsonRequest('DELETE', `/api/admin/stickers/${stickerId}`);
  assert(deleteResult.status === 204, `Expected 204, received ${deleteResult.status}`);
  stickerId = undefined;

  const publicProduct = expectSuccess(await get<PublicProduct>('/api/products/americano-s153t2'));
  assert(
    !publicProduct.stickers.some((item) => item.label === marker),
    'Deleted sticker must disappear from public product',
  );
});

await check('option link price round-trips through admin update', async () => {
  assert(targetProduct, 'Depends on admin product fetch');
  const payload = toUpdatePayload(targetProduct);
  expectSuccess(await jsonRequest<AdminProduct>('PUT', `/api/admin/products/${targetProduct.id}`, payload));
  const publicProduct = expectSuccess(await get<PublicProduct>('/api/products/americano-s153t2'));
  assert(publicProduct.options.length === targetProduct.optionLinks.length, 'Option links must round-trip');
});

// Cleanup phòng khi check giữa chừng fail.
if (stickerId !== undefined) {
  await jsonRequest('DELETE', `/api/admin/stickers/${stickerId}`);
}

if (failures > 0) {
  console.error(`Smoke options/stickers failed: ${failures} check(s).`);
  process.exit(1);
}
console.log(`Smoke options/stickers passed: 5/5 checks at ${baseUrl}.`);
