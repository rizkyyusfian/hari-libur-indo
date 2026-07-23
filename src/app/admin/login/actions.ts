'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthEnv } from '@/server/env';
import { verifyPassword } from '@/server/auth/password';
import {
  assertLoginAllowed,
  clearLoginFailures,
  fingerprintClient,
  recordLoginFailure,
} from '@/server/auth/throttle';
import { clearAdminSessionCookie, setAdminSessionCookie } from '@/server/auth/session';
import { AppError } from '@/domain/errors';

export type LoginResult = { ok: true } | { ok: false; message: string };

function normalizedClientAddress(headerStore: Headers): string {
  return (
    headerStore.get('x-vercel-forwarded-for') ??
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

export async function loginAction(password: string): Promise<LoginResult> {
  const headerStore = await headers();
  const origin = headerStore.get('origin');
  const allowedOrigin = new URL(getAuthEnv().NEXT_PUBLIC_SITE_URL).origin;
  if (
    origin !== allowedOrigin &&
    !(process.env.NODE_ENV !== 'production' && origin === 'http://localhost:3000')
  ) {
    return { ok: false, message: 'Permintaan login tidak valid.' };
  }
  const fingerprint = fingerprintClient(normalizedClientAddress(headerStore));

  try {
    await assertLoginAllowed(fingerprint);
  } catch (error) {
    if (error instanceof AppError && error.code === 'RATE_LIMITED') {
      return { ok: false, message: error.message };
    }
    throw error;
  }

  if (!verifyPassword(password, getAuthEnv().PASSWORD)) {
    await recordLoginFailure(fingerprint);
    return { ok: false, message: 'Password tidak valid.' };
  }

  await clearLoginFailures(fingerprint);
  await setAdminSessionCookie();
  return { ok: true };
}

export async function logoutAction(): Promise<never> {
  await clearAdminSessionCookie();
  redirect('/admin/login');
}
