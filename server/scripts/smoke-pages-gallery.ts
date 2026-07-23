// Smoke: static pages + membership FAQ + home gallery — admin mutation phản
// ánh ra public. Cần ADMIN_EMAIL/ADMIN_PASSWORD của tài khoản có sẵn.
import { randomUUID } from 'node:crypto';

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

interface HttpResult<T> {
  status: number;
  body?: ApiResponse<T>;
}

interface StaticPage {
  key: string;
  title: string;
  content: string;
}

interface MembershipFaq {
  id: number;
  question: string;
  answer: string;
  isPublished: boolean;
}

interface GalleryItem {
  id: number;
  storageKey: string;
  isActive: boolean;
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
let faqId: number | undefined;
let galleryId: number | undefined;
let originalAbout: StaticPage | undefined;

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

async function check(name: string, run: () => Promise<void>): Promise<void> {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Đăng nhập admin lấy cookie.
const loginResponse = await fetch(baseUrl + '/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: adminEmail, password: adminPassword }),
});
assert(loginResponse.ok, `Login failed: ${loginResponse.status}`);
cookie = (loginResponse.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
assert(cookie, 'Expected auth cookie from login');

await check('GET /api/pages/about public', async () => {
  const data = expectSuccess(await get<StaticPage>('/api/pages/about'));
  assert(data.key === 'about' && JSON.parse(data.content).heading, 'Expected JSON content');
});

await check('PUT /admin/pages/about reflects on public', async () => {
  originalAbout = expectSuccess(await get<StaticPage>('/api/pages/about'));
  const content = JSON.parse(originalAbout.content);
  content.heading = marker;
  expectSuccess(await jsonRequest<StaticPage>('PUT', '/api/admin/pages/about', {
    title: originalAbout.title,
    content: JSON.stringify(content),
  }));
  const publicPage = expectSuccess(await get<StaticPage>('/api/pages/about'));
  assert(JSON.parse(publicPage.content).heading === marker, 'Public page must show updated heading');
});

await check('membership FAQ create → public → unpublish hides', async () => {
  const created = expectSuccess(await jsonRequest<MembershipFaq>('POST', '/api/admin/membership-faqs', {
    question: `${marker} question?`,
    answer: 'smoke answer',
    sortOrder: 999,
    isPublished: true,
  }), 201);
  faqId = created.id;

  let publicFaqs = expectSuccess(await get<MembershipFaq[]>('/api/membership-faqs'));
  assert(publicFaqs.some((faq) => faq.id === created.id), 'New FAQ must be public');

  expectSuccess(await jsonRequest<MembershipFaq>('PUT', `/api/admin/membership-faqs/${created.id}`, {
    question: `${marker} question?`,
    answer: 'smoke answer',
    sortOrder: 999,
    isPublished: false,
  }));
  publicFaqs = expectSuccess(await get<MembershipFaq[]>('/api/membership-faqs'));
  assert(!publicFaqs.some((faq) => faq.id === created.id), 'Unpublished FAQ must be hidden');
});

await check('gallery create → public → delete removes', async () => {
  const created = expectSuccess(await jsonRequest<GalleryItem>('POST', '/api/admin/gallery', {
    storageKey: `site/${marker}.jpg`,
    altText: 'smoke',
    sortOrder: 999,
    isActive: true,
  }), 201);
  galleryId = created.id;

  let publicItems = expectSuccess(await get<GalleryItem[]>('/api/home-gallery'));
  assert(publicItems.some((item) => item.id === created.id), 'New gallery item must be public');

  const deleteResult = await jsonRequest('DELETE', `/api/admin/gallery/${created.id}`);
  assert(deleteResult.status === 204, `Expected 204, received ${deleteResult.status}`);
  galleryId = undefined;

  publicItems = expectSuccess(await get<GalleryItem[]>('/api/home-gallery'));
  assert(!publicItems.some((item) => item.id === created.id), 'Deleted gallery item must disappear');
});

await check('GET /api/pages rejects unknown key', async () => {
  const result = await get('/api/pages/khong-ton-tai');
  assert(result.status === 400 || result.status === 404, `Expected 400/404, received ${result.status}`);
});

// Cleanup: khôi phục page about, xóa FAQ/gallery test còn sót.
if (originalAbout) {
  await jsonRequest('PUT', '/api/admin/pages/about', {
    title: originalAbout.title,
    content: originalAbout.content,
  });
}
if (faqId !== undefined) {
  await jsonRequest('DELETE', `/api/admin/membership-faqs/${faqId}`);
}
if (galleryId !== undefined) {
  await jsonRequest('DELETE', `/api/admin/gallery/${galleryId}`);
}

if (failures > 0) {
  console.error(`Smoke pages/gallery failed: ${failures} check(s).`);
  process.exit(1);
}
console.log(`Smoke pages/gallery passed: 5/5 checks at ${baseUrl}.`);
