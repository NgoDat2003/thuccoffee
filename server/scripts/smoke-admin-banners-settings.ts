type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };

interface Result<T> {
  status: number;
  body?: ApiResponse<T>;
}

interface AdminBanner {
  id: number;
  type: string;
  image: string;
  altText: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface AdminSiteSetting {
  key: string;
  value: string;
}

const baseUrl = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8080').replace(/\/$/, '');
const email = process.env.ADMIN_EMAIL ?? '';
const password = process.env.ADMIN_PASSWORD ?? '';

if (!email || !password) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
}

let cookie = '';
let bannerId: number | undefined;
let originalHotline: string | undefined;
let failures = 0;

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<Result<T>> {
  const response = await fetch(baseUrl + path, init);
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) as ApiResponse<T> : undefined };
}

function json<T>(method: string, path: string, body?: unknown, auth = true) {
  return request<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(auth && cookie ? { Cookie: cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function get<T>(path: string, auth = true) {
  return request<T>(path, { headers: auth && cookie ? { Cookie: cookie } : undefined });
}

function success<T>(result: Result<T>, status = 200): T {
  assert(result.status === status, 'Expected ' + status + ', received ' + result.status);
  assert(result.body?.success, 'Expected success:true');
  return result.body.data;
}

function failure<T>(result: Result<T>, status: number, code?: string) {
  assert(result.status === status, 'Expected ' + status + ', received ' + result.status);
  assert(result.body && !result.body.success, 'Expected success:false');
  if (code) assert(result.body.error.code === code, 'Expected ' + code);
  return result.body.error;
}

async function check(name: string, run: () => Promise<void>) {
  try {
    await run();
    console.log('PASS ' + name);
  } catch (error) {
    failures += 1;
    console.error('FAIL ' + name + ': ' + (error instanceof Error ? error.message : String(error)));
  }
}

const login = await fetch(baseUrl + '/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
assert(login.status === 200, 'Login failed with ' + login.status);
const setCookie = login.headers.getSetCookie?.()[0] ?? login.headers.get('set-cookie');
assert(setCookie, 'Login cookie missing');
cookie = setCookie.split(';', 1)[0] ?? '';

const bannerBody = {
  type: 'slider',
  image: 'banners/smoke-banner.png',
  altText: 'Smoke banner',
  linkUrl: null,
  sortOrder: 9999,
};

try {
  await check('1. every admin banner/settings endpoint requires auth', async () => {
    const endpoints: Array<[string, string]> = [
      ['GET', '/api/admin/banners'],
      ['POST', '/api/admin/banners'],
      ['PUT', '/api/admin/banners/1'],
      ['PATCH', '/api/admin/banners/1/activate'],
      ['DELETE', '/api/admin/banners/1'],
      ['GET', '/api/admin/site-settings'],
      ['PUT', '/api/admin/site-settings'],
    ];
    for (const [method, path] of endpoints) {
      const result = method === 'GET' ? await get(path, false) : await json(method, path, {}, false);
      failure(result, 401, 'UNAUTHORIZED');
    }
  });

  await check('2. banner create validates type against DB check values', async () => {
    failure(await json('POST', '/api/admin/banners', { ...bannerBody, type: 'hero' }), 400, 'BAD_REQUEST');
    const created = success(await json<AdminBanner>('POST', '/api/admin/banners', bannerBody), 201);
    bannerId = created.id;
    assert(created.type === 'slider' && created.isActive, 'Banner defaults mismatch');
  });

  await check('3. banner activate toggle reflects public list', async () => {
    assert(bannerId, 'Banner was not created');
    const visible = success(await get<AdminBanner[]>('/api/banners', false));
    assert(visible.some((item) => item.image === bannerBody.image), 'Active banner missing publicly');
    success(await json('PATCH', '/api/admin/banners/' + bannerId + '/activate', { isActive: false }));
    const hidden = success(await get<AdminBanner[]>('/api/banners', false));
    assert(!hidden.some((item) => item.image === bannerBody.image), 'Inactive banner still public');
  });

  await check('4. banner hard delete returns 204 and removes the record', async () => {
    assert(bannerId, 'Banner was not created');
    const removed = await request('/api/admin/banners/' + bannerId, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    });
    assert(removed.status === 204, 'Expected 204, received ' + removed.status);
    assert(!removed.body, '204 response must not include a body');
    const removedAgain = await request('/api/admin/banners/' + bannerId, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    });
    assert(removedAgain.status === 404, 'Second delete should 404, received ' + removedAgain.status);
    const listed = success(await get<AdminBanner[]>('/api/admin/banners'));
    assert(!listed.some((item) => item.id === bannerId), 'Deleted banner still listed');
    bannerId = undefined;
  });

  await check('5. settings reject unknown keys and update allowed keys', async () => {
    failure(await json('PUT', '/api/admin/site-settings', { evil_key: 'x' }), 400, 'BAD_REQUEST');

    const current = success(await get<AdminSiteSetting[]>('/api/admin/site-settings'));
    originalHotline = current.find((item) => item.key === 'hotline')?.value;
    assert(originalHotline !== undefined, 'hotline setting missing');

    const smokeValue = 'smoke-' + Date.now();
    success(await json('PUT', '/api/admin/site-settings', { hotline: smokeValue }));
    const publicSettings = success(await get<{ hotline: string }>('/api/site-settings', false));
    assert(publicSettings.hotline === smokeValue, 'Public settings did not reflect update');
  });
} finally {
  if (originalHotline !== undefined) {
    await json('PUT', '/api/admin/site-settings', { hotline: originalHotline });
  }
  if (bannerId) {
    await request('/api/admin/banners/' + bannerId, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    });
  }
}

if (failures > 0) {
  console.error('Smoke admin banners/settings failed: ' + failures + '/5 checks failed.');
  process.exitCode = 1;
} else {
  console.log('Smoke admin banners/settings passed: 5/5 checks at ' + baseUrl + '.');
}
