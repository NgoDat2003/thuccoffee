type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

interface AuthUser {
  email: string;
  role: 'admin' | 'editor';
}

interface HttpResult<T> {
  status: number;
  body?: ApiResponse<T>;
  setCookie: string[];
}

const baseUrl = (
  process.argv[2]
  ?? process.env.API_BASE_URL
  ?? 'http://127.0.0.1:8080'
).replace(/\/$/, '');

const adminEmail = process.env.ADMIN_EMAIL ?? '';
const adminPassword = process.env.ADMIN_PASSWORD ?? '';

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required for smoke:auth.');
}

let failures = 0;
let loginCookie = '';
let unknownEmailMessage = '';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<HttpResult<T>> {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  const getSetCookie = response.headers.getSetCookie?.bind(response.headers);
  const setCookie = getSetCookie
    ? getSetCookie()
    : response.headers.get('set-cookie')?.split(/,(?=[^;,]+=)/) ?? [];

  return {
    status: response.status,
    body: text ? JSON.parse(text) as ApiResponse<T> : undefined,
    setCookie,
  };
}

function postJson<T>(path: string, body: unknown, cookie?: string) {
  return request<T>(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

function get<T>(path: string, cookie?: string) {
  return request<T>(path, {
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

function expectUnauthorized<T>(result: HttpResult<T>): string {
  assert(result.status === 401, `Expected 401, received ${result.status}`);
  assert(result.body && !result.body.success, 'Expected success:false');
  assert(result.body.error.code === 'UNAUTHORIZED', 'Expected UNAUTHORIZED code');
  return result.body.error.message;
}

function expectUser(result: HttpResult<AuthUser>): AuthUser {
  assert(result.status === 200, `Expected 200, received ${result.status}`);
  assert(result.body?.success, 'Expected success:true');
  assert(result.body.data.email === adminEmail.toLowerCase(), 'Email mismatch');
  assert(result.body.data.role === 'admin', 'Expected admin role');
  return result.body.data;
}

async function check(name: string, run: () => Promise<void>): Promise<void> {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL ${name}: ${message}`);
  }
}

await check('1. unknown email returns generic 401', async () => {
  const result = await postJson<never>('/api/auth/login', {
    email: `missing-${Date.now()}@example.test`,
    password: adminPassword,
  });
  unknownEmailMessage = expectUnauthorized(result);
});

await check('2. wrong password returns the same generic 401', async () => {
  const result = await postJson<never>('/api/auth/login', {
    email: adminEmail,
    password: `${adminPassword}-wrong`,
  });
  assert(
    expectUnauthorized(result) === unknownEmailMessage,
    'Authentication errors must use the same message',
  );
});

await check('3. valid login returns user and httpOnly cookie', async () => {
  const result = await postJson<AuthUser>('/api/auth/login', {
    email: adminEmail,
    password: adminPassword,
  });
  expectUser(result);
  const header = result.setCookie.find((value) => value.startsWith('admin_token='));
  assert(header, 'Missing admin_token Set-Cookie header');
  assert(/;\s*HttpOnly/i.test(header), 'Cookie must be HttpOnly');
  assert(/;\s*SameSite=Lax/i.test(header), 'Cookie must use SameSite=Lax');
  loginCookie = header.split(';', 1)[0] ?? '';
  assert(loginCookie, 'Could not extract login cookie');
});

await check('4. /api/auth/me rejects missing cookie', async () => {
  expectUnauthorized(await get<never>('/api/auth/me'));
});

await check('5. /api/auth/me returns the authenticated user', async () => {
  assert(loginCookie, 'Valid login did not provide a cookie');
  expectUser(await get<AuthUser>('/api/auth/me', loginCookie));
});

await check('6. /api/admin/me rejects missing cookie', async () => {
  expectUnauthorized(await get<never>('/api/admin/me'));
});

await check('7. /api/admin/me accepts valid cookie', async () => {
  assert(loginCookie, 'Valid login did not provide a cookie');
  expectUser(await get<AuthUser>('/api/admin/me', loginCookie));
});

await check('8. logout clears browser cookie and next me is unauthorized', async () => {
  assert(loginCookie, 'Valid login did not provide a cookie');
  const logout = await request<never>('/api/auth/logout', {
    method: 'POST',
    headers: { Cookie: loginCookie },
  });
  assert(logout.status === 204, `Expected 204, received ${logout.status}`);
  assert(!logout.body, '204 response must not include a body');
  const cleared = logout.setCookie.find((value) => value.startsWith('admin_token='));
  assert(cleared && /Max-Age=0|Expires=Thu, 01 Jan 1970/i.test(cleared), 'Cookie was not cleared');
  expectUnauthorized(await get<never>('/api/auth/me'));
});

if (failures > 0) {
  console.error(`Smoke auth failed: ${failures}/8 checks failed.`);
  process.exitCode = 1;
} else {
  console.log(`Smoke auth passed: 8/8 checks at ${baseUrl}.`);
}
