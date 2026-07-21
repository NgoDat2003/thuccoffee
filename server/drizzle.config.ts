import 'dotenv/config';

declare const process: {
  env: {
    DATABASE_URL?: string;
    [key: string]: string | undefined;
  };
};

import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL là bắt buộc để chạy Drizzle.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
