import 'server-only';

import { createHmac, randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { AppError } from '@/domain/errors';
import { getAuthEnv } from '@/server/env';

export const ADMIN_COOKIE_NAME = 'hari_libur_admin_session';
const SESSION_SECONDS = 12 * 60 * 60;

function signingKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

function credentialFingerprint(password: string, secret: string): string {
  return createHmac('sha256', secret).update(`credential-v1\0${password}`).digest('base64url');
}

export async function createSessionToken(now = new Date()): Promise<string> {
  const env = getAuthEnv();
  const issuedAt = Math.floor(now.getTime() / 1000);

  return new SignJWT({
    version: 1,
    sid: randomUUID(),
    credential: credentialFingerprint(env.PASSWORD, env.ADMIN_SESSION_SECRET),
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + SESSION_SECONDS)
    .sign(signingKey(env.ADMIN_SESSION_SECRET));
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    const env = getAuthEnv();
    const { payload } = await jwtVerify(token, signingKey(env.ADMIN_SESSION_SECRET), {
      algorithms: ['HS256'],
    });
    const expected = credentialFingerprint(env.PASSWORD, env.ADMIN_SESSION_SECRET);
    return payload.version === 1 && payload.credential === expected;
  } catch {
    return false;
  }
}

export async function setAdminSessionCookie(): Promise<void> {
  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

async function hasAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function requireAdminSession(): Promise<void> {
  if (!(await hasAdminSession())) {
    throw new AppError('UNAUTHENTICATED', 'Sesi admin tidak valid atau telah berakhir.');
  }
}
