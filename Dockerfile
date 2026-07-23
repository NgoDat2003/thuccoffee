# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# tsc cua frontend di theo import type vao server/src/**/*.schemas.ts; cac file
# do import zod/drizzle-orm nen can server/node_modules de resolve (du chi
# type-only). Runtime stage (nginx) chi COPY /app/dist nen khong phinh image.
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --prefix server

COPY . .
ARG VITE_MINIO_BASE_URL=/media
ENV VITE_MINIO_BASE_URL=$VITE_MINIO_BASE_URL
RUN npm run build

FROM nginx:1.29-alpine AS runtime

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1

