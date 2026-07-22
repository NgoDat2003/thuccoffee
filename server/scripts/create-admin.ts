import 'dotenv/config';

import argon2 from 'argon2';
import { Pool } from 'pg';
import { z } from 'zod';

const bootstrapEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  ADMIN_EMAIL: z.string().trim().email(),
  ADMIN_PASSWORD: z.string().min(12),
});

const bootstrapEnv = bootstrapEnvSchema.parse(process.env);
const email = bootstrapEnv.ADMIN_EMAIL.toLowerCase();
const passwordHash = await argon2.hash(bootstrapEnv.ADMIN_PASSWORD, {
  type: argon2.argon2id,
});
const pool = new Pool({ connectionString: bootstrapEnv.DATABASE_URL });

try {
  await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role = 'admin',
           updated_at = NOW()`,
    [email, passwordHash],
  );
  console.log(`Admin account is ready for ${email}.`);
} finally {
  await pool.end();
}
