import 'server-only';

import { createHmac } from 'node:crypto';
import { eq, lt } from 'drizzle-orm';
import { adminLoginAttempts } from '@/db/schema';
import { getDb } from '@/db/client';
import { AppError } from '@/domain/errors';
import { getAuthEnv } from '@/server/env';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

export function fingerprintClient(clientAddress: string): string {
  const { ADMIN_SESSION_SECRET } = getAuthEnv();
  return createHmac('sha256', ADMIN_SESSION_SECRET)
    .update(`login-client-v1\0${clientAddress}`)
    .digest('base64url');
}

export async function assertLoginAllowed(fingerprintHash: string, now = new Date()): Promise<void> {
  const db = getDb();
  await db
    .delete(adminLoginAttempts)
    .where(lt(adminLoginAttempts.updatedAt, new Date(now.getTime() - WINDOW_MS * 2)));

  const [attempt] = await db
    .select()
    .from(adminLoginAttempts)
    .where(eq(adminLoginAttempts.fingerprintHash, fingerprintHash))
    .limit(1);

  if (attempt?.blockedUntil && attempt.blockedUntil > now) {
    throw new AppError('RATE_LIMITED', 'Terlalu banyak percobaan. Coba lagi setelah 15 menit.');
  }
}

export async function recordLoginFailure(fingerprintHash: string, now = new Date()): Promise<void> {
  const db = getDb();
  const [attempt] = await db
    .select()
    .from(adminLoginAttempts)
    .where(eq(adminLoginAttempts.fingerprintHash, fingerprintHash))
    .limit(1);

  const insideWindow =
    attempt && now.getTime() - attempt.windowStartedAt.getTime() < WINDOW_MS;
  const failureCount = insideWindow ? attempt.failureCount + 1 : 1;

  await db
    .insert(adminLoginAttempts)
    .values({
      fingerprintHash,
      windowStartedAt: insideWindow ? attempt.windowStartedAt : now,
      failureCount,
      blockedUntil: failureCount >= MAX_FAILURES ? new Date(now.getTime() + WINDOW_MS) : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: adminLoginAttempts.fingerprintHash,
      set: {
        windowStartedAt: insideWindow ? attempt.windowStartedAt : now,
        failureCount,
        blockedUntil: failureCount >= MAX_FAILURES ? new Date(now.getTime() + WINDOW_MS) : null,
        updatedAt: now,
      },
    });
}

export async function clearLoginFailures(fingerprintHash: string): Promise<void> {
  await getDb()
    .delete(adminLoginAttempts)
    .where(eq(adminLoginAttempts.fingerprintHash, fingerprintHash));
}
