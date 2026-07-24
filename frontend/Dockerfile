# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm ci --prefix frontend

# tsc cua frontend di theo import type qua alias @server/* (frontend/tsconfig.app.json)
# tro vao server/src/**/*.schemas.ts; cac file do import zod/drizzle-orm nen can
# server/node_modules de resolve (du chi type-only). Container giu frontend/ va
# server/ song song giong cau truc tren host de alias resolve dung o ca hai noi.
# Runtime stage (nginx) chi COPY frontend/dist nen khong phinh image.
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --prefix server

COPY frontend/. ./frontend/
COPY server/. ./server/
WORKDIR /app/frontend
ARG VITE_MINIO_BASE_URL=/media
ENV VITE_MINIO_BASE_URL=$VITE_MINIO_BASE_URL
RUN npm run build

FROM nginx:1.29-alpine AS runtime

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1

