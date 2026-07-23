import 'server-only';

import { z } from 'zod';

const runtimeSchema = z.object({
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  PASSWORD: z.string().min(8, 'PASSWORD must contain at least 8 characters'),
  ADMIN_SESSION_SECRET: z.string().min(32, 'ADMIN_SESSION_SECRET must contain at least 32 characters'),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_BASE_URL: z.string().url(),
});

function formatEnvError(error: z.ZodError): Error {
  const names = [...new Set(error.issues.map((issue) => issue.path.join('.')))].join(', ');
  return new Error(`Missing or invalid server environment variables: ${names}`);
}

export function getAuthEnv() {
  const schema = runtimeSchema.pick({
    PASSWORD: true,
    ADMIN_SESSION_SECRET: true,
    NEXT_PUBLIC_SITE_URL: true,
  });
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) throw formatEnvError(parsed.error);
  return parsed.data;
}

export function getR2Env() {
  const schema = runtimeSchema.pick({
    R2_ACCOUNT_ID: true,
    R2_ACCESS_KEY_ID: true,
    R2_SECRET_ACCESS_KEY: true,
    R2_BUCKET_NAME: true,
    R2_PUBLIC_BASE_URL: true,
  });
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) throw formatEnvError(parsed.error);
  return parsed.data;
}

export function getDatabaseUrl(): string {
  const parsed = z.string().url().startsWith('postgresql://').safeParse(process.env.DATABASE_URL);
  if (!parsed.success) throw new Error('Missing or invalid server environment variable: DATABASE_URL');
  return parsed.data;
}
