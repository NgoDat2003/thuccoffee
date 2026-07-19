# Deployment

## Platform: Dokploy Self-Hosted

The frontend is a React/Vite single-page application served by Nginx from a two-stage Docker image. It currently has no runtime secrets, persistent volume, backend, or database.

Production URL: `TBD`

## Runtime Contract

| Setting | Value |
|---|---|
| Build source | Repository `Dockerfile` |
| Docker context | `.` |
| Dockerfile path | `Dockerfile` |
| Docker target stage | `runtime` |
| Container port | `80` |
| Health endpoint | `/healthz` |
| Persistent volume | None |
| Runtime environment variables | None |

Nginx gives hashed Vite assets long-lived immutable caching. `index.html` is not cached, React Router deep links fall back to `index.html`, and missing static-looking files return `404`.

## Local Verification

```bash
npm ci
npm run lint
npm run build
docker build -t thuccoffee-frontend:dokploy-local .
docker run --rm --name thuccoffee-frontend-local -p 8080:80 thuccoffee-frontend:dokploy-local
```

In another terminal:

```bash
curl -i http://127.0.0.1:8080/healthz
curl -I http://127.0.0.1:8080/
curl -I http://127.0.0.1:8080/menu
curl -I http://127.0.0.1:8080/chuyen-cua-thuc/example
curl -I http://127.0.0.1:8080/cua-hang/example
curl -fsS http://127.0.0.1:8080/menu | grep -q 'id="root"'
curl -fsS http://127.0.0.1:8080/chuyen-cua-thuc/example | grep -q 'id="root"'
curl -I http://127.0.0.1:8080/assets/does-not-exist.js
curl -I http://127.0.0.1:8080/robots.txt
docker inspect --format '{{.State.Health.Status}}' thuccoffee-frontend-local
```

Expected:

- `/healthz` returns `200`, body `ok`, and `Cache-Control: no-store`.
- Application and deep routes return `200` and GET assertions find the SPA root.
- Missing `/assets/...` and root static-looking files return `404`, not `index.html`.
- A real hashed `/assets/...` file returns immutable one-year caching.
- Docker health becomes `healthy`.

## Dokploy Setup

### 1. Project Structure

```text
Project: thuccoffee
Environment: production
Application: frontend
```

The future backend must be a separate `backend` Application. PostgreSQL must be a separate database service without a public port.

### 2. Git Source

1. Commit and push `Dockerfile`, `.dockerignore`, `deploy/nginx.conf`, and the application source before deploying.
2. Connect the Git provider in Dokploy and grant access only to the required repository.
3. Select the production branch, normally `main`.
4. Set build path to `/`.

### 3. Build Settings

```text
Build type: Dockerfile
Dockerfile path: Dockerfile
Docker context path: .
Docker build stage: runtime
```

No environment variables are required for this frontend. Never place a secret in a Vite `VITE_*` variable because it is compiled into the browser bundle.

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

### 5. Deploy and Auto-Deploy

1. Save the Application and run the first deployment manually.
2. Check build logs, deployment logs, `/healthz`, and representative deep routes.
3. Enable auto-deploy only for the intended production branch.

## Release Verification

After every production deployment:

1. Confirm Dokploy reports the service healthy.
2. Open the homepage through HTTPS.
3. Hard-refresh `/menu`, one product route, one blog route, and one store route.
4. Confirm missing static files return `404`.
5. Confirm the deployed commit matches the intended release.

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

### Build exhausts VPS memory

- Build and push the image from CI or a dedicated build server.
- Configure Dokploy to deploy the registry image instead of building source on production.

### Browser serves an old release

- Confirm `index.html` returns `Cache-Control: no-store, no-cache, must-revalidate`.
- Confirm hashed files under `/assets/` changed with the Vite build.
- Purge external CDN cache only after checking origin response headers.

