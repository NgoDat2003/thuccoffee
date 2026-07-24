# Local Environment and CI

Companion to `deployment.md`. That file covers the production Dokploy handoff;
this one covers how the project runs on a developer machine and what CI checks
on every push.

## Ways to Run the Container

The same `frontend/Dockerfile` drives three separate environments. They share
the image definition but run in different places and never touch each other.

| Environment | Where it runs | Command | URL |
|---|---|---|---|
| Compose | Docker Desktop on Windows | `docker compose up -d --build` | `http://localhost:3000` |
| CI | GitHub-hosted runner | automatic on push | n/a (asserts, then discards) |
| Dokploy | WSL distro `Dokploy` | deploy from the Dokploy UI | needs a Domain entry |

Local port map: frontend `3000`, backend `8080`, Postgres `5432`. An optional
local Dokploy install would want `3000`/`80`/`443`, so run it and the Compose
frontend one at a time rather than together.

## Continuous Integration

`.github/workflows/ci.yml` runs on push and pull request to `main`, in two
parallel jobs.

**`lint-and-build`** installs with `npm ci` inside `frontend/` (and `server/`
separately), then runs `npm run lint` and `npm run build` in each. Catches
TypeScript and lint regressions.

**`docker`** builds the `runtime` stage, starts the container, waits for the
Dockerfile `HEALTHCHECK` to report healthy, then asserts HTTP behavior:

- `/healthz` returns body `ok`
- `/menu` returns `200` (SPA deep link falls back to `index.html`)
- a missing `/assets/*.js` returns `404`, not `index.html`

These are the same assertions listed in `deployment.md` under Local
Verification, automated so they run on every push.

CI does **not** deploy. See Known Limits below.

## Local Dokploy (Learning Setup)

Optional. Only needed to explore the Dokploy UI on a workstation; production
deployment does not depend on any of this.

Dokploy requires Docker Swarm and real volume mounts, which do not work through
Docker Desktop's WSL integration. It therefore lives in its own WSL distro with
its own Docker Engine:

```
WSL distro "Dokploy"  (integration OFF in Docker Desktop)
├── Docker Engine     installed inside the distro
├── dokploy           UI on port 3000
├── dokploy-postgres  Dokploy's own config store
└── traefik           reverse proxy on 80/443
```

Other WSL distros keep their Docker Desktop integration, so existing Dev
Container workflows are unaffected.

### Keeping it running

WSL suspends an idle distro, which stops the Docker daemon and kills every
container — the browser then shows `ERR_CONNECTION_REFUSED` on port 3000.
Setting `vmIdleTimeout=-1` in `.wslconfig` did not prevent this on WSL 2.7.10.

What does work is holding a session open from the Windows side. A scheduled
task named `DokployKeeper` runs `dokploy-keeper.vbs` at logon to do that:

```powershell
Get-ScheduledTask DokployKeeper        # status
Start-ScheduledTask DokployKeeper      # start now
Unregister-ScheduledTask DokployKeeper # remove when done with Dokploy
```

Manual equivalent, if the task is not running:

```bash
wsl -d Dokploy -e bash -lc 'systemctl start docker; nohup sleep infinity >/dev/null 2>&1 & disown'
```

### Reaching a deployed app

A successful deploy is not reachable until the app has a Domain entry — Traefik
returns `404` for hosts it has no route for. In the application's Domains tab
add host `thuccoffee.localhost`, path `/`, container port `80`, HTTPS disabled.

HTTPS cannot work locally: Let's Encrypt only issues certificates for domains it
can reach over the public internet, and `.localhost` is not one.

## Known Limits

**No automated deployment.** A local Dokploy sits behind a home router, so
GitHub cannot reach it with a deploy webhook. Deployments are triggered by hand
from the Dokploy UI. On a public VPS this gap closes.

**No test suite.** `frontend/package.json` defines `lint` and `build` only, so
CI checks compilation and runtime behavior, not application logic.

**Docker Desktop and local Dokploy are independent.** Separate daemons, separate
image stores. An image built in one is invisible to the other, and Dokploy keeps
running with Docker Desktop shut down.

## Notes for Production Deployment

Two findings from local verification that affect a real VPS:

**Size the VPS for the build.** Source images total 51 MB across 153 files, 12
of them over 1 MB and the largest at 3.1 MB. `vite build` on a 1 GB instance is
likely to be OOM-killed with no clear error. Use 2 GB or more, or build the
image in CI and have Dokploy pull it from a registry.

**Images are unoptimized.** None are served as WebP or AVIF. Converting them is
the single largest available win for page weight and load time.
