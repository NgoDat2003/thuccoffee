---
title: "Báo cáo Dokploy: hiểu đúng và áp dụng thực tế"
type: report
status: completed
researched_at: "2026-07-17T21:34:00+07:00"
scope: "Dokploy self-hosted, kỹ năng vận hành, áp dụng cho React/Vite thuccoffee"
---

# Báo cáo Dokploy: hiểu đúng và áp dụng thực tế

## Mục lục

1. [Kết luận trước](#1-kết-luận-trước)
2. [Dokploy là gì](#2-dokploy-là-gì)
3. [Dokploy vận hành thế nào](#3-dokploy-vận-hành-thế-nào)
4. [Khi nào nên và không nên dùng](#4-khi-nào-nên-và-không-nên-dùng)
5. [Các kỹ năng cần học](#5-các-kỹ-năng-cần-học)
6. [Các kỹ thuật production thường dùng](#6-các-kỹ-thuật-production-thường-dùng)
7. [Recipe cho repo thuccoffee](#7-recipe-cho-repo-thuccoffee)
8. [Bảo mật, backup, monitoring](#8-bảo-mật-backup-monitoring)
9. [Lỗi hay gặp](#9-lỗi-hay-gặp)
10. [Lộ trình học thực tế](#10-lộ-trình-học-thực-tế)
11. [Checklist go-live](#11-checklist-go-live)
12. [Nguồn và câu hỏi còn mở](#12-nguồn-và-câu-hỏi-còn-mở)

## 1. Kết luận trước

**Dokploy là một PaaS tự host:** trải nghiệm gần Heroku/Render/Railway, nhưng ứng dụng chạy trên server do chính người dùng quản lý. Dokploy giúp deploy và quản lý container; nó không loại bỏ công việc DevOps.

Verdict cho repo hiện tại:

- `thuccoffee` là React/Vite SPA thuần static, không backend, DB, auth hay payment.
- Nếu chỉ cần đưa website này lên Internet: static CDN như Cloudflare Pages, Netlify hoặc Vercel đơn giản và ít rủi ro hơn.
- Nếu mục tiêu là học Linux/Docker/CI-CD hoặc sau này host thêm API, PostgreSQL, Redis, n8n, worker: Dokploy đáng học và đáng dựng lab.
- Nếu chạy production trên Dokploy: build image trong CI, push registry, để VPS chỉ pull và chạy image. Chính Dokploy cảnh báo Docker build trên server nhỏ có thể ăn hết CPU/RAM và làm toàn server đứng. [Going Production](https://docs.dokploy.com/docs/core/applications/going-production)

Khuyến nghị theo thời điểm:

| Nhu cầu | Lựa chọn hợp lý |
|---|---|
| Chỉ host `thuccoffee` static | Static CDN |
| Học DevOps bằng dự án thật | Dokploy trên VPS lab |
| 1–3 service đầu tiên, không có người trực vận hành | Managed PaaS |
| Nhiều service/container, muốn kiểm soát hạ tầng | Dokploy |
| SLA cao, dữ liệu quan trọng, chưa biết restore | Chưa nên self-host production |

## 2. Dokploy là gì

Dokploy là control plane mã nguồn mở để triển khai và quản lý:

- application đơn dưới dạng container;
- Docker Compose/Docker Stack;
- database như PostgreSQL, MySQL, MariaDB, MongoDB, Redis;
- domain, HTTPS, environment variables, volume, log, monitoring;
- auto-deploy từ Git provider, webhook hoặc API;
- backup S3, healthcheck và rollback.

Tài liệu chính thức mô tả Dokploy là lựa chọn self-hosted thay thế Heroku/Vercel/Netlify, dựa trên Docker và Traefik. [Dokploy overview](https://docs.dokploy.com/docs/core)

### Dokploy không phải gì

- Không phải Kubernetes và không cần học Kubernetes để bắt đầu.
- Không phải hosting miễn phí: bản OSS miễn phí nhưng VPS, object storage, domain, thời gian vận hành vẫn có chi phí.
- Không tự tạo high availability chỉ vì có giao diện đẹp.
- Không tự bảo vệ dữ liệu nếu chưa cấu hình backup và chưa thử restore.
- Không biến một VPS thành hạ tầng “zero downtime” khi VPS hết RAM hoặc chết hoàn toàn.

Tại thời điểm nghiên cứu 17/07/2026, GitHub hiển thị bản phát hành mới nhất là **v0.29.5**. Dokploy còn dưới `1.0`, release thay đổi nhanh; cần đọc release notes trước mỗi lần update. [Release v0.29.5](https://github.com/Dokploy/dokploy/releases/tag/v0.29.5)

## 3. Dokploy vận hành thế nào

Control plane self-hosted gồm Dokploy UI/backend, PostgreSQL lưu cấu hình, Traefik làm reverse proxy/TLS/service discovery và Docker Swarm quản lý service. [Architecture](https://docs.dokploy.com/docs/core/architecture)

```text
Developer
   |
   | git push
   v
GitHub/GitLab ---- webhook/API ----> Dokploy control plane
   |                                      |
   | CI build image                       | deploy service
   v                                      v
Container Registry ----------------> Docker/Swarm
                                           |
Internet --> DNS --> Traefik --> HTTPS --> App container
                                           |
                                 logs / metrics / healthcheck

S3-compatible storage <---- backups ---- Dokploy + DB + volumes
```

Sơ đồ riêng: [Dokploy deployment flow](../visuals/dokploy-deployment-flow.md).

### Ba khái niệm phải tách riêng

1. **Build:** source code biến thành artifact hoặc Docker image.
2. **Deploy:** đưa image vào server và khởi động service.
3. **Route:** Traefik nhận domain/HTTPS rồi chuyển request đến đúng container/port.

Nhiều lỗi “Dokploy không chạy” thực ra thuộc một trong ba lớp trên. Tách lớp giúp debug nhanh.

### Các build type đáng biết

| Build type | Khi dùng | Nhận xét |
|---|---|---|
| Nixpacks/Railpack | Prototype, app đơn giản | Ít cấu hình, nhưng build ăn tài nguyên VPS và ít kiểm soát hơn Dockerfile |
| Dockerfile | Production, cần runtime rõ ràng | Reproducible, dễ scan/tag/rollback |
| Buildpack | App tương thích hệ sinh thái buildpack | Ít phổ biến hơn trong repo này |
| Static | Artifact đã là file static | Dokploy copy root vào Nginx; không nên nhầm với việc tự build source Vite |
| Docker image | CI đã build/push image | Khuyến nghị production |
| Compose/Stack | Nhiều service có quan hệ | Chỉ dùng khi thật sự có API/DB/worker |

Tài liệu Vite React của Dokploy dùng **Nixpacks + publish directory `./dist` + port `80`**. [Vite React example](https://docs.dokploy.com/docs/core/vite-react) Build type `Static` chỉ copy nội dung từ root đã chọn vào Nginx. [Build types](https://docs.dokploy.com/docs/core/applications/build-type)

## 4. Khi nào nên và không nên dùng

### Nên dùng Dokploy khi

- Có nhiều app/service cần một dashboard quản lý chung.
- Muốn kiểm soát VPS, network, registry, volume và chi phí hạ tầng.
- Có người chịu trách nhiệm update, backup, restore, cảnh báo và incident.
- Cần học DevOps qua một hệ thống đủ thật nhưng nhẹ hơn Kubernetes.
- Muốn deploy app, Compose và database trong cùng một workflow.

### Không nên dùng khi

- Chỉ có một website static như repo này.
- Không ai nhận trách nhiệm server ngoài giờ làm việc.
- Dữ liệu quan trọng nhưng chưa có backup off-site và restore drill.
- Muốn “cài một lần rồi quên”.
- VPS đang chạy reverse proxy hoặc Docker Swarm khác mà chưa đánh giá xung đột.

Installer chuẩn dùng port `80`, `443`, `3000`, khởi tạo Swarm và quản lý Traefik riêng. Tài liệu manual cảnh báo installer có thể buộc node rời Swarm hiện có; không chạy mù trên server đang có workload. [Installation](https://docs.dokploy.com/docs/core/installation) · [Manual installation](https://docs.dokploy.com/docs/core/manual-installation)

### So sánh ngắn

| Tiêu chí | Static CDN | Managed PaaS | Dokploy + VPS |
|---|---:|---:|---:|
| Hợp repo hiện tại | Rất cao | Trung bình | Thấp |
| Hợp full-stack nhiều service | Thấp | Cao | Cao |
| Việc vận hành | Rất ít | Ít–vừa | Cao |
| Quyền kiểm soát | Thấp–vừa | Vừa | Cao |
| Single point of failure tự quản | Không đáng kể | Provider quản | Có, nếu một VPS |
| Giá trị học DevOps | Thấp | Vừa | Rất cao |

## 5. Các kỹ năng cần học

### Level 1 — Deploy được

- Git branch, commit, webhook.
- DNS `A/AAAA/CNAME`, propagation.
- HTTP, HTTPS, certificate, port.
- Build Vite và hiểu thư mục `dist`.
- Environment variables; biết `VITE_*` là dữ liệu public sau khi build, không phải secret. [Vite env variables](https://vite.dev/guide/env-and-mode)

### Level 2 — Hiểu container

- Image khác container.
- Dockerfile multi-stage.
- Container port khác host port.
- Network, volume, bind mount.
- Docker Compose cho nhiều service.
- Registry, tag, digest, image pull.
- Healthcheck và resource limit.

### Level 3 — Vận hành server

- Linux user, SSH key, quyền file.
- Firewall của cloud provider và UFW.
- CPU/RAM/load/disk/inode.
- Log, process, Docker cleanup.
- Backup/restore, cron, S3-compatible storage.
- Patch OS, Docker, Dokploy, Traefik.

### Level 4 — Production engineering

- CI/CD: lint → test → build → scan → push → deploy → verify.
- Immutable release bằng Git SHA.
- Zero-downtime có điều kiện.
- Rollback application khác rollback database.
- Backward-compatible migration.
- External uptime monitoring và alert routing.
- Runbook sự cố và restore drill.

Không cần học ngay: Kubernetes, service mesh, Prometheus/Grafana/Loki đầy đủ, multi-node Swarm. YAGNI: một app static chưa tạo ra nhu cầu đó.

## 6. Các kỹ thuật production thường dùng

### 6.1 Build outside production

Pipeline tốt:

```text
push main
  -> lint/test
  -> build Docker image
  -> vulnerability scan
  -> push registry với tag Git SHA
  -> trigger Dokploy API/webhook
  -> healthcheck
  -> promote hoặc rollback
```

Lợi ích: VPS production không phải compile; release có danh tính rõ; rollback nhanh hơn. Dokploy hỗ trợ GitHub auto-deploy, webhook và API. [Auto Deploy](https://docs.dokploy.com/docs/core/auto-deploy)

### 6.2 Multi-stage Dockerfile

Stage 1 dùng Node để cài dependency và build. Stage 2 chỉ chứa Nginx + `dist`. Image nhỏ hơn, ít attack surface, không mang source/node_modules vào runtime.

### 6.3 Immutable image tag

- Tốt: `ghcr.io/org/thuccoffee:a1b2c3d`.
- Kém: chỉ có `latest`.

`latest` tiện nhưng không chứng minh container đang chạy code nào. Có thể giữ thêm tag `latest` cho convenience, nhưng Git SHA phải là nguồn truy vết.

### 6.4 Healthcheck + start-first + rollback

- Static app: healthcheck `/` và một asset quan trọng.
- API: tách `/live` và `/ready` nếu có dependency.
- `start-first` cần RAM dư để container cũ và mới cùng tồn tại.
- Automatic rollback chỉ hoạt động khi healthcheck phát hiện lỗi.

Dokploy hỗ trợ Swarm rollback và registry-based rollback. [Rollbacks](https://docs.dokploy.com/docs/core/applications/rollbacks) · [Zero downtime](https://docs.dokploy.com/docs/core/applications/zero-downtime)

### 6.5 SPA fallback

Repo dùng `createBrowserRouter`; request trực tiếp `/menu/...` hoặc `/cua-hang/...` phải được Nginx trả về `index.html`. Nếu thiếu `try_files ... /index.html`, trang chạy khi click nội bộ nhưng F5/deep link sẽ 404.

### 6.6 Secrets đúng chỗ

- Không commit `.env` chứa secret.
- Không đặt secret trong `VITE_*`.
- Không dùng Docker build arg làm kho secret.
- GitHub App chỉ cấp quyền đúng repository cần deploy.
- API token/registry token dùng least privilege và rotate.

### 6.7 Persistent data đúng loại

- Frontend này không cần volume.
- Database dùng named volume hoặc storage strategy đã thiết kế.
- Volume backup Dokploy không bảo vệ bind mount; phải có backup riêng cho bind mount. [Volume backups](https://docs.dokploy.com/docs/core/volume-backups)

## 7. Recipe cho repo thuccoffee

### Phương án A — Lab nhanh để học Dokploy

#### 1. Chuẩn bị VPS

- Ubuntu/Debian được Dokploy hỗ trợ.
- Tối thiểu chính thức: `2 GB RAM`, `30 GB disk`; nếu build trên cùng server, 4 GB thực tế an toàn hơn nhưng đây là khuyến nghị vận hành, không phải mức đảm bảo.
- Cloud firewall ban đầu:
  - `22/tcp`: chỉ IP quản trị hoặc VPN;
  - `80/tcp`, `443/tcp`: Internet;
  - `3000/tcp`: tạm thời chỉ IP quản trị.

#### 2. Cài Dokploy

Lệnh chính thức:

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Trong môi trường nghiêm túc: đọc script/release notes, backup trước update và pin version đã kiểm thử. Không dùng canary cho production.

#### 3. Bảo vệ panel

- Tạo admin và bật 2FA.
- Gắn `deploy.example.com`, bật HTTPS.
- Kiểm tra panel qua domain.
- Sau đó đóng public access đến port `3000`.

#### 4. Kết nối repository

- Cài GitHub App của Dokploy cho đúng repository, không chọn toàn bộ organization nếu không cần.
- Chọn branch `main`.

#### 5. Tạo Application

```text
Build type:         Nixpacks
Build path:         /
Install command:    npm ci
Build command:      npm run build
Publish directory:  ./dist
Domain port:        80
```

Đây là cấu hình gần nhất với ví dụ Vite React chính thức. Sau deploy, gắn domain và certificate.

#### 6. Test bắt buộc

- `/` trả `200`.
- F5 trực tiếp tại `/menu`.
- F5 một product detail `/menu/:slug`.
- F5 `/chuyen-cua-thuc/:slug`.
- F5 `/cua-hang/:slug`.
- Asset, font, favicon tải qua HTTPS.
- Push một commit nhỏ và xác nhận auto-deploy đúng branch.

Nếu deep link 404, không vá ngẫu nhiên trong dashboard. Chuyển sang Dockerfile + Nginx config có SPA fallback.

### Phương án B — Cấu hình production khuyến nghị

Các file cần có khi triển khai thật:

```text
Dockerfile
.dockerignore
deploy/nginx.conf
.github/workflows/deploy.yml
```

Dockerfile mục tiêu:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
```

Nginx cần ít nhất:

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location /assets/ {
    try_files $uri =404;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

CI/CD:

1. Chạy `npm ci`, lint, build.
2. Build Docker image.
3. Scan image.
4. Push GHCR/Docker Hub với tag Git SHA.
5. Trigger Dokploy API hoặc webhook.
6. Dokploy pull image; không build trên VPS.
7. Healthcheck pass mới nhận traffic.

Trong Dokploy chọn source type `Docker`, container port `80`, gắn domain/TLS, giới hạn CPU/RAM, bật rollback. Production guide chính thức cũng khuyến nghị external CI build. [Going Production](https://docs.dokploy.com/docs/core/applications/going-production)

### Phương án C — Đơn giản nhất cho đúng repo hiện tại

Deploy `npm run build` lên static CDN, cấu hình SPA rewrite về `index.html`. Đây là lựa chọn tốt nhất nếu mục tiêu là website online, không phải học self-hosting. [Vite static deployment](https://vite.dev/guide/static-deploy)

## 8. Bảo mật, backup, monitoring

### Bảo mật tối thiểu

- SSH key-only; tắt password login.
- Provider firewall đứng trước server.
- Không tin UFW đơn lẻ: Docker sửa `iptables` và port publish có thể bypass UFW. [Dokploy security](https://docs.dokploy.com/docs/core/remote-servers/security)
- Không expose database port ra Internet; chỉ route HTTP service qua Traefik.
- Panel chỉ dùng HTTPS; đóng port `3000` sau setup.
- 2FA cho admin.
- Update OS và xem Dokploy release/security advisory định kỳ.
- Backup trước update; test trên staging nếu có dữ liệu quan trọng.

Release `v0.29.3` từng yêu cầu upgrade rồi chạy thêm security patch script. Không được giả định “đã bấm update là đủ”; luôn đọc release notes từ version hiện tại đến version đích. [Release v0.29.3](https://github.com/Dokploy/dokploy/releases/tag/v0.29.3) Manual docs cũng nói Traefik không tự update cùng Dokploy. [Manual installation](https://docs.dokploy.com/docs/core/manual-installation)

### Ba lớp backup

1. **Control plane:** `dokploy-postgres` + `/etc/dokploy` → S3.
2. **Application database:** dump theo lịch → S3.
3. **Named volumes:** volume backup → S3.

Repo frontend này nằm trong Git và không có state; không cần backup container. Cần backup Dokploy để tái tạo panel/config nhanh. [Full Dokploy backups](https://docs.dokploy.com/docs/core/backups) · [Database backups](https://docs.dokploy.com/docs/core/databases/backups)

Nguyên tắc: backup chưa từng restore chỉ là hy vọng. Tối thiểu mỗi quý restore thử lên server/staging sạch và đo thời gian phục hồi.

### Monitoring tối thiểu

- Dokploy logs và CPU/RAM/disk/network để chẩn đoán.
- External uptime monitor nằm ngoài VPS.
- Alert disk, RAM, CPU, certificate và backup failure.
- Notification cho deploy fail/restart/backup.
- Error tracking ở application khi có backend.

Basic monitoring của self-hosted không thay thế hệ thống observability hoàn chỉnh. Không nên nhồi Prometheus/Grafana/Loki vào cùng VPS nhỏ nếu chưa có yêu cầu rõ. [Applications monitoring](https://docs.dokploy.com/docs/core/applications) · [Cloud vs self-hosted](https://docs.dokploy.com/docs/core/differences)

## 9. Lỗi hay gặp

| Lỗi | Hậu quả | Cách tránh |
|---|---|---|
| Dùng Dokploy chỉ cho một SPA | Tăng việc vận hành không tạo giá trị | Chọn static CDN hoặc coi đây là lab |
| Build trên VPS 2 GB | OOM/đứng toàn server | Build trong CI, VPS chỉ pull image |
| Mở port `3000` công khai lâu dài | Tăng attack surface | Panel domain + HTTPS rồi đóng port |
| Chỉ cấu hình UFW | Docker port vẫn có thể public | Dùng provider firewall, kiểm tra từ Internet |
| Chỉ dùng tag `latest` | Khó audit/rollback | Tag thêm Git SHA |
| Không có SPA fallback | F5 deep link bị 404 | Nginx `try_files ... /index.html` |
| Đặt secret trong `VITE_*` | Secret xuất hiện trong JS browser | Chỉ đặt public config vào `VITE_*` |
| DB dùng bind mount nhưng tưởng đã backup | Mất dữ liệu khi sự cố | Thiết kế named volume/backup riêng |
| Có backup nhưng chưa restore thử | Không biết backup có dùng được | Restore drill định kỳ |
| `start-first` trên server đầy RAM | Deploy mới làm OOM | Chừa headroom hoặc dùng stop-first có downtime |
| Update Dokploy/Traefik mù | Routing lỗi, downtime | Backup, đọc release notes, pin/test version |
| Expose DB port ra ngoài | Rủi ro xâm nhập dữ liệu | Internal network, VPN/bastion khi cần admin |

## 10. Lộ trình học thực tế

Đây là ước lượng học chủ động, không phải cam kết thời gian.

### Chặng 1 — 1 đến 2 giờ: static deployment

- Build Vite.
- Deploy static CDN.
- DNS + TLS.
- SPA fallback.

**Đầu ra:** website chạy, deep link F5 không 404.

### Chặng 2 — 8 đến 12 giờ: Docker nền tảng

- Dockerfile multi-stage.
- Image/container/port/network/volume.
- Healthcheck.
- Compose local.

**Đầu ra:** chạy frontend bằng image Nginx, không cần Node runtime.

### Chặng 3 — 8 đến 12 giờ: Linux/VPS

- SSH key, user, firewall.
- Theo dõi RAM/disk/log.
- Docker cleanup và OS patch.

**Đầu ra:** tự tìm được nguyên nhân container không chạy hoặc server đầy disk.

### Chặng 4 — 6 đến 10 giờ: Dokploy staging

- Cài panel.
- Domain/TLS.
- Git provider/registry.
- Auto-deploy và resource limit.

**Đầu ra:** push `main` tạo release có thể truy vết.

### Chặng 5 — 6 đến 10 giờ: failure drill

- Deploy bản lỗi rồi rollback.
- Rotate token.
- Restore control-plane backup.
- Giả lập mất VPS và dựng lại.

**Đầu ra:** có runbook; không cần mở tutorial giữa incident.

### Bài tập nâng cấp phù hợp repo

1. Deploy frontend bằng Nixpacks.
2. Cố tình mở deep link và sửa SPA fallback bằng Dockerfile.
3. Chuyển build từ VPS sang GitHub Actions + GHCR.
4. Deploy một API `/health` nhỏ.
5. Thêm PostgreSQL nhưng không expose port.
6. Backup DB lên S3 và restore sang staging.
7. Tắt container đang chạy, đo thời gian cảnh báo và phục hồi.

## 11. Checklist go-live

### Application

- [ ] Build reproducible bằng lockfile.
- [ ] Image tag theo Git SHA.
- [ ] Healthcheck chạy thật.
- [ ] Deep-link test pass.
- [ ] CPU/RAM limit hợp lý.
- [ ] Rollback đã thử.

### Server

- [ ] SSH key-only.
- [ ] Provider firewall đúng rule.
- [ ] Chỉ `80/443` public; `3000` đã đóng.
- [ ] Disk alert và cleanup policy.
- [ ] Timezone/NTP đúng.
- [ ] OS/Docker/Dokploy có lịch update.

### Data

- [ ] Secret không nằm trong Git hoặc frontend bundle.
- [ ] S3 backup chạy đúng lịch.
- [ ] Restore test pass.
- [ ] RPO/RTO được ghi rõ.
- [ ] DB migration có rollback/forward-fix plan.

### Operations

- [ ] External uptime monitor.
- [ ] Alert đến người có trách nhiệm.
- [ ] Runbook deploy/rollback/restore.
- [ ] Có owner vận hành.
- [ ] Biết ai xử lý khi VPS chết ngoài giờ.

## 12. Nguồn và câu hỏi còn mở

### Phương pháp nghiên cứu

- Thời điểm: 17/07/2026.
- Context7 không có Dokploy; fallback sang tài liệu Dokploy và GitHub chính thức.
- Ưu tiên nguồn chính thức cho kiến trúc, build, production, security, backup, rollback và release.
- Khuyến nghị static CDN là đánh giá kiến trúc dựa trên trạng thái repo hiện tại, không phải tuyên bố của Dokploy.

### Nguồn chính

- [Dokploy documentation](https://docs.dokploy.com/docs/core)
- [Architecture](https://docs.dokploy.com/docs/core/architecture)
- [Installation](https://docs.dokploy.com/docs/core/installation)
- [Applications](https://docs.dokploy.com/docs/core/applications)
- [Build types](https://docs.dokploy.com/docs/core/applications/build-type)
- [Vite React example](https://docs.dokploy.com/docs/core/vite-react)
- [Going Production](https://docs.dokploy.com/docs/core/applications/going-production)
- [Security](https://docs.dokploy.com/docs/core/remote-servers/security)
- [Backups](https://docs.dokploy.com/docs/core/backups)
- [Rollbacks](https://docs.dokploy.com/docs/core/applications/rollbacks)
- [GitHub releases](https://github.com/Dokploy/dokploy/releases)

### Câu hỏi còn mở

- Mục tiêu thật là học DevOps hay đưa website lên production nhanh nhất?
- Sẽ dùng Dokploy self-hosted OSS hay Dokploy Cloud?
- Đã có VPS/domain/S3 bucket/container registry chưa?
- Production có yêu cầu uptime, RPO, RTO và người trực vận hành không?
- Có muốn triển khai phase lab bằng Nixpacks trước, sau đó nâng lên Dockerfile + CI không?

