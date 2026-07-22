type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

interface HttpResult<T> {
  status: number;
  body?: ApiResponse<T>;
}

interface UploadResult {
  objectKey: string;
}

const apiBaseUrl = (
  process.argv[2]
  ?? process.env.API_BASE_URL
  ?? 'http://127.0.0.1:8080'
).replace(/\/$/, '');
const minioBaseUrl = (
  process.env.MINIO_BASE_URL
  ?? 'http://127.0.0.1:9000/thuccoffee'
).replace(/\/$/, '');
const adminEmail = process.env.ADMIN_EMAIL ?? '';
const adminPassword = process.env.ADMIN_PASSWORD ?? '';

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required for smoke:upload.');
}

const validPng = Uint8Array.from(Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4XcAAAAASUVORK5CYII=',
  'base64',
));
const oversizedPng = new Uint8Array(5 * 1024 * 1024 + 1);
oversizedPng.set(validPng);

let failures = 0;
let cookie = '';
let uploadedObjectKey = '';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<HttpResult<T>> {
  const response = await fetch(`${apiBaseUrl}${path}`, init);
  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) as ApiResponse<T> : undefined,
  };
}

async function login(): Promise<string> {
  const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  assert(response.status === 200, `Login failed with ${response.status}`);
  const header = response.headers.getSetCookie?.()[0]
    ?? response.headers.get('set-cookie');
  assert(header, 'Login did not return a cookie');
  return header.split(';', 1)[0] ?? '';
}

function uploadForm(
  bytes: Uint8Array | undefined,
  filename: string,
  mimeType: string,
  kind = 'products',
): FormData {
  const form = new FormData();
  form.set('kind', kind);
  if (bytes) {
    form.set('file', new Blob([bytes], { type: mimeType }), filename);
  }
  return form;
}

function upload<T>(form: FormData, authenticated = true) {
  return request<T>('/api/admin/uploads', {
    method: 'POST',
    headers: authenticated ? { Cookie: cookie } : undefined,
    body: form,
  });
}

function expectError<T>(result: HttpResult<T>, statuses: number[]): void {
  assert(statuses.includes(result.status), `Expected ${statuses.join('/')}, received ${result.status}`);
  assert(result.body && !result.body.success, 'Expected success:false error envelope');
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

cookie = await login();

await check('1. upload requires authentication', async () => {
  expectError(await upload<never>(uploadForm(validPng, 'guard.png', 'image/png'), false), [401]);
});

await check('2. valid PNG returns a server-generated object key', async () => {
  const result = await upload<UploadResult>(uploadForm(validPng, 'original-client-name.png', 'image/png'));
  assert(result.status === 201, `Expected 201, received ${result.status}`);
  assert(result.body?.success, 'Expected success:true');
  const key = result.body.data.objectKey;
  assert(/^products\/[0-9a-f-]{36}\.png$/.test(key), `Unexpected object key: ${key}`);
  assert(!key.includes('original-client-name'), 'Object key leaked the original filename');
  uploadedObjectKey = key;
});

await check('3. uploaded object exists on MinIO with matching bytes', async () => {
  assert(uploadedObjectKey, 'Happy path did not provide an object key');
  const response = await fetch(`${minioBaseUrl}/${uploadedObjectKey}`);
  assert(response.status === 200, `Expected MinIO 200, received ${response.status}`);
  const downloaded = new Uint8Array(await response.arrayBuffer());
  assert(Buffer.compare(Buffer.from(downloaded), Buffer.from(validPng)) === 0, 'Uploaded bytes differ');
});

await check('4. fake PNG bytes are rejected', async () => {
  expectError(await upload<never>(uploadForm(
    new TextEncoder().encode('not a png'),
    'fake.png',
    'image/png',
  )), [400, 422]);
});

await check('5. extension outside allow-list is rejected', async () => {
  expectError(await upload<never>(uploadForm(validPng, 'vector.svg', 'image/svg+xml')), [400, 422]);
});

await check('6. kind traversal is rejected', async () => {
  expectError(await upload<never>(uploadForm(validPng, 'safe.png', 'image/png', '../../etc')), [400, 422]);
});

await check('7. oversized file returns an API error envelope', async () => {
  expectError(await upload<never>(uploadForm(oversizedPng, 'large.png', 'image/png')), [400, 413]);
});

await check('8. missing file is rejected', async () => {
  expectError(await upload<never>(uploadForm(undefined, 'missing.png', 'image/png')), [400]);
});

if (failures > 0) {
  console.error(`Smoke upload failed: ${failures}/8 checks failed.`);
  process.exitCode = 1;
} else {
  console.log(`Smoke upload passed: 8/8 checks at ${apiBaseUrl}.`);
}
