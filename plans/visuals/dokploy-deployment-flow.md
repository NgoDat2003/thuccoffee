# Dokploy Deployment Flow

```text
DEVELOPMENT                         PRODUCTION VPS

+-------------+                    +---------------------------+
| Developer   |                    | Dokploy control plane     |
| git push    |                    | UI/API + PostgreSQL       |
+------+------+                    +-------------+-------------+
       |                                           |
       v                                           | deploy
+-------------+     webhook/API                    v
| Git provider+--------------------------------> Docker/Swarm
+------+------+                                     |
       | CI build                                   v
       v                              +-------------+-------------+
+-------------+     pull image        | Application container    |
| Registry    +---------------------->| Nginx + React/Vite dist  |
+-------------+                       +-------------+-------------+
                                                    ^
                                                    |
Internet --> DNS --> Traefik --> TLS/domain --------+

Off-site S3 <---- control-plane / database / volume backups
External monitor ---- HTTPS probe ----> public domain
```

Legend:

- Git provider giữ source và kích hoạt pipeline.
- CI build image để production VPS không phải compile.
- Registry giữ release image và Git SHA phục vụ truy vết/rollback.
- Dokploy điều phối deploy; Docker/Swarm chạy service.
- Traefik nhận domain/HTTPS và route đến container port.
- S3 và external monitor phải nằm ngoài VPS để tránh cùng failure domain.

