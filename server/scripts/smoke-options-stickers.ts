// Smoke: product options + stickers — admin gắn option/sticker phản ánh ra
// public product detail. Cần ADMIN_EMAIL/ADMIN_PASSWORD.

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
  options: Array<{ name: string; label: string; price: number }>;
  stickers: Array<{ label: string; color: string }>;
}

interface AdminProduct {
  id: number;
  slug: string;
  optionLinks: Array<{ optionId: number; name: string; label: string | null; price: number }>;
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

const baseUrl = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8080').replace(/\/$/, '');
const adminEmail = process.env.ADMIN_EMAIL ?? '';
const adminPassword = process.env.ADMIN_PASSWORD ?? '';

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
}

let cookie = '';
let failures = 0;
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
    optionLinks: product.optionLinks.map((link) => ({
      optionId: link.optionId,
      price: link.price,
      label: link.label,
    })),
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
  assert(names.includes('Lạnh'), 'Expected seeded Lạnh option name');
  assert(
    data.options.some((option) => option.label === 'Lạnh (Size L)' && option.price === 55000),
    'Expected Lạnh (Size L) = 55000 from seed evidence',
  );
});

await check('GET /admin/product-options master list', async () => {
  const data = expectSuccess(await get<Array<{ id: number; name: string }>>('/api/admin/product-options', true));
  assert(data.length === 4, 'Expected exactly 4 seeded options');
});

await check('category badge color shows up on public product', async () => {
  const publicProduct = expectSuccess(await get<PublicProduct>('/api/products/black-cold-brew-coffee-s1378t2'));
  assert(
    publicProduct.stickers.some((item) => item.label === 'Yêu thích nhất' && item.color === 'var(--color-primary)'),
    'Public product must show Yêu thích nhất badge with primary color',
  );
});

await check('option link price must be > 0 validation', async () => {
  const adminProducts = expectSuccess(await get<AdminProduct[]>('/api/admin/products', true));
  const americano = adminProducts.find((product) => product.slug === 'americano-s153t2');
  assert(americano, 'Expected Americano in admin list');
  targetProduct = americano;

  const payload = toUpdatePayload(americano);
  const invalidPayload = {
    ...payload,
    optionLinks: payload.optionLinks.map((link, i) => i === 0 ? { ...link, price: 0 } : link),
  };
  
  const res = await jsonRequest('PUT', `/api/admin/products/${americano.id}`, invalidPayload);
  assert(res.status === 400, `Expected 400 Bad Request for price 0, received ${res.status}`);
});

await check('option link price round-trips through admin update', async () => {
  assert(targetProduct, 'Depends on admin product fetch');
  const payload = toUpdatePayload(targetProduct);
  expectSuccess(await jsonRequest<AdminProduct>('PUT', `/api/admin/products/${targetProduct.id}`, payload));
  const publicProduct = expectSuccess(await get<PublicProduct>('/api/products/americano-s153t2'));
  assert(publicProduct.options.length === targetProduct.optionLinks.length, 'Option links must round-trip');
});

if (failures > 0) {
  console.error(`Smoke options/stickers failed: ${failures} check(s).`);
  process.exit(1);
}
console.log(`Smoke options/stickers passed: 5/5 checks at ${baseUrl}.`);
