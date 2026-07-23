# Deployment

## Target Platform: Dokploy Self-Hosted

The repository now has two application images plus Postgres and MinIO. The
React/Vite frontend is served by Nginx; the Express backend has its own Node 22
image. Local Compose is the verified integration environment. Dokploy remains
the production target, but production service wiring and domains are not yet
deployed.

Production URL: `TBD`

## Local Compose Runtime

| Service | Host port | Container role | Persistence |
|---|---:|---|---|
| `frontend` | `3000` | Nginx SPA | None |
| `backend` | `8080` | Express; `GET /api/health` | None |
| `postgres` | `5432` | Postgres 16 | `postgres-data` |
| `minio` API | `9000` | S3-compatible object API | `minio-data` |
| `minio` console | `9001` | Local administration | Same `minio-data` |
| `minio-init` | None | Creates `thuccoffee`, enables anonymous download, exits | None |

The backend waits for healthy Postgres and MinIO. `minio-init` waits for MinIO,
then exits successfully; it is not a long-running service. The bucket is
public-read for image downloads, while write operations still require MinIO
credentials.

The frontend reads content images from MinIO using full object keys. In local
development `VITE_MINIO_BASE_URL` can target `http://localhost:9000/thuccoffee`;
the production Docker build uses same-origin `/media`, proxied by Nginx to the
private MinIO service.

## Frontend Runtime Contract

| Setting | Value |
|---|---|
| Build source | Repository `Dockerfile` |
| Docker context | `.` |
| Dockerfile path | `Dockerfile` |
| Docker target stage | `runtime` |
| Container port | `80` |
| Health endpoint | `/healthz` |
| Persistent volume | None |
| Build argument | `VITE_MINIO_BASE_URL=/media` |
| Runtime environment variables | None |

Nginx proxies `/media/<object-key>` to MinIO, before static-file matching and
the SPA fallback. Hashed Vite assets keep immutable caching, `index.html` is not
cached, deep links fall back to `index.html`, and missing static files return `404`.

## Local Verification

```bash
cp .env.example .env # first run; replace JWT_SECRET
docker compose config --quiet
docker compose up -d --build
docker compose ps -a
```

Verify the services and bucket policy:

```bash
curl -fsS http://127.0.0.1:3000/healthz
curl -fsS http://127.0.0.1:8080/api/health
curl -fsS http://127.0.0.1:9000/minio/health/ready
docker compose logs minio-init
docker compose exec minio sh -c \
  'mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null && mc anonymous get local/thuccoffee'
```

Seed images from the host-side backend workspace:

```bash
cd server
cp .env.example .env # first run only; never commit the real file
npm ci
npm run db:seed-images
cd ..

# Compare dynamically; do not encode this count into scripts.
find src/assets/images -type f | wc -l
docker compose exec minio mc find local/thuccoffee --type f | wc -l
```

Current snapshot: 498 valid source files/target objects. The previous 103 emoji
PNG files were converted to Unicode text in blog content and removed. Treat 498
as an observed snapshot; the two commands above are the durable verification.

Verified on 2026-07-21: the corrected seed completed twice with `498 uploaded`
and `0 skipped`; the bucket contained 498 objects and no emoji keys. JPEG/PNG
content types were correct and a representative public object returned HTTP
`200`. On 2026-07-22 the image-key migration and Docker runtime were verified:
all 561 DB/UI references resolved to the 498 bucket objects with zero missing keys.

Expected architecture and checks:

- `/healthz` returns `200`, body `ok`, and `Cache-Control: no-store`.
- `/api/health` and MinIO readiness return `200`.
- `minio-init` exits `0`; policy output is `download`.
- A seed run uploads paths relative to `src/assets/images/`; rerunning is the
  idempotence check because the same object keys are overwritten.
- Source and object counts match after a successful seed.
- Application and deep routes return `200` and GET assertions find the SPA root.
- Missing `/assets/...` and root static-looking files return `404`, not `index.html`.
- A real hashed `/assets/...` file returns immutable one-year caching.
- Browser content-image requests use same-origin `/media/...`; MinIO port `9000`
  is not exposed to production browsers.

## Dokploy Setup

### 1. Project Structure

```text
Project: thuccoffee
Environment: production
Applications: frontend, backend
Private services: postgres, minio
One-shot setup: minio-init or an equivalent deployment job
```

Keep frontend and backend as separate Applications. PostgreSQL and MinIO must
share a private network with the backend. Do not publish the database or MinIO
console directly.

### 2. Git Source

1. Commit and push `Dockerfile`, `.dockerignore`, `deploy/nginx.conf`, and the application source before deploying.
2. Connect the Git provider in Dokploy and grant access only to the required repository.
3. Select the production branch, normally `main`.
4. Set build path to `/`.

### 3. Build Settings

Frontend:

```text
Build type: Dockerfile
Dockerfile path: Dockerfile
Docker context path: .
Docker build stage: runtime
```

Backend:

```text
Build type: Dockerfile
Dockerfile path: server/Dockerfile
Docker context path: server
Docker build stage: runtime
Container port: 8080
Health endpoint: /api/health
```

No environment variables are required for the frontend. Never place a secret
in a Vite `VITE_*` variable because it is compiled into the browser bundle.

Backend/seed environment contract:

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | Postgres connection string; use the private service hostname |
| `PORT` | Backend listen port, normally `8080` |
| `NODE_ENV` | `development`, `test`, or `production` |
| `JWT_SECRET` | At least 32 random characters; signs the 7-day admin JWT |
| `MINIO_ENDPOINT` | MinIO hostname without protocol |
| `MINIO_PORT` | MinIO API port |
| `MINIO_ACCESS_KEY` | Write-capable access key |
| `MINIO_SECRET_KEY` | Matching secret key |
| `MINIO_BUCKET` | `thuccoffee` by default |
| `MINIO_USE_SSL` | `true` when the configured endpoint uses TLS |

MinIO itself receives `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`. Store all
production credentials in Dokploy secrets/environment configuration, not Git.

### 4. Domain and TLS

Create an `A` record for the frontend hostname pointing to the Dokploy server. In the Application `Domains` tab use:

```text
Host: your-frontend-domain.example.com
Path: /
Container port: 80
HTTPS: enabled
Certificate: Let's Encrypt
Strip path: disabled
Internal path: /
```

Field labels can vary slightly by Dokploy version. Keep the semantic values above. Wait for DNS to resolve before requesting the certificate, then verify HTTP-to-HTTPS redirection.

Do not publish a frontend host port. Traefik should be the only public HTTP entry point.

### 5. Storage and Network Security

- Replace all local default Postgres and MinIO credentials before deployment.
- Never expose MinIO console port `9001` to the public internet. Reach it only
  through a private network, VPN, or temporary authenticated tunnel.
- Keep Postgres private. Keep MinIO API private while only the backend/seed uses
  it. If browsers later download public bucket objects directly, publish a
  dedicated TLS hostname through Traefik; do not expose a raw host port.
- Set `MINIO_USE_SSL=true` for a TLS MinIO endpoint. Use trusted certificates;
  do not disable certificate verification in application code.
- Public-read applies only to object downloads. Root/write credentials remain
  secrets and must never reach the frontend.
- Back up both `postgres-data` and `minio-data`. An application rollback does
  not restore database rows or object data.

### 6. Deploy and Auto-Deploy

1. Save the Application and run the first deployment manually.
2. Check build logs, deployment logs, `/healthz`, and representative deep routes.
3. Enable auto-deploy only for the intended production branch.

## Release Verification

After every production deployment:

1. Confirm Dokploy reports the service healthy.
2. Confirm frontend `/healthz` and backend `/api/health` through their intended routes.
3. Confirm MinIO is healthy, the bucket exists, and its anonymous policy is download-only.
4. Open the homepage through HTTPS.
5. Hard-refresh `/menu`, one product route, one blog route, and one store route.
6. Confirm missing static files return `404`.
7. Confirm content images load from same-origin `/media/` with no image `404`.
8. Confirm `/admin/login` rejects invalid credentials and login/logout work.
9. Confirm the deployed commit matches the intended release.

**Pre-exposure requirement — rate limiting.** `POST /api/submissions/contact`
and `POST /api/submissions/newsletter` are unauthenticated write endpoints with
only a honeypot guard. Before opening any environment to the public internet,
add a rate limiter (e.g. `express-rate-limit`) on `/api/submissions` and
consider one on `/api/search`. This is intentionally deferred while the stack
is local-only.

## Rollback

Rollback depends on the release mode:

- **Git-source build without registry history:** select the previous known-good Git commit/branch state and redeploy it.
- **Registry-backed deployment:** select the previous stored image/deployment in Dokploy and redeploy it.
- **Swarm automatic rollback:** works only after healthcheck and update configuration are explicitly enabled.

After rollback, repeat health, HTTPS, deep-link, and missing-static-file checks. Application rollback does not restore future database changes.

For mature production, build images in CI, tag them with the Git commit SHA, push them to a registry, and let Dokploy pull the immutable image. This avoids compilation on a small production VPS and makes rollback auditable.

## Troubleshooting

### Deep links return Nginx 404

- Confirm the image includes `deploy/nginx.conf`.
- Confirm the active server block uses `try_files $uri $uri/ /index.html`.
- Rebuild if the image predates the Nginx config.

### Domain returns 502 Bad Gateway

- Confirm the domain targets container port `80`.
- Check that `/healthz` succeeds inside the container.
- Check Dokploy deployment logs and Traefik routing.

### Backend is unhealthy

- Confirm `DATABASE_URL` uses the private Postgres service hostname, not `localhost`.
- Confirm `MINIO_ENDPOINT` uses the private MinIO hostname and API port `9000`.
- Check `/api/health` inside the backend container before debugging Traefik.

### MinIO is healthy but the bucket is missing

- Check the `minio-init` job/container exit code and logs.
- Re-run the idempotent init command; do not recreate or delete the data volume.
- Confirm `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, and `MINIO_BUCKET` match.

### Object count is higher than the source count

- `db:seed-images` overwrites managed keys but does not prune arbitrary stale
  objects. Review unexpected keys, then remove only the confirmed stale objects.
- Do not use `docker compose down -v` as cleanup; that deletes the whole MinIO
  volume and can also delete local Postgres data.

### Browser cannot load a future MinIO object URL

- Confirm the object exists under its full relative key and the bucket policy is `download`.
- Confirm the public object hostname has TLS and routes to MinIO API port `9000`.
- Do not solve this by exposing console port `9001`.

### Build exhausts VPS memory

- Build and push the image from CI or a dedicated build server.
- Configure Dokploy to deploy the registry image instead of building source on production.

### Browser serves an old release

- Confirm `index.html` returns `Cache-Control: no-store, no-cache, must-revalidate`.
- Confirm hashed files under `/assets/` changed with the Vite build.
- Purge external CDN cache only after checking origin response headers.
