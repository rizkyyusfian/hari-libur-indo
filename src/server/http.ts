import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { AppError, toSafeError } from '@/domain/errors';
import { getAuthEnv } from '@/server/env';

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) throw new AppError('UNAUTHENTICATED', 'Origin permintaan tidak valid.');
  const allowed = new URL(getAuthEnv().NEXT_PUBLIC_SITE_URL).origin;
  if (origin !== allowed && !(process.env.NODE_ENV !== 'production' && origin === 'http://localhost:3000')) {
    throw new AppError('UNAUTHENTICATED', 'Origin permintaan tidak valid.');
  }
}

export function errorResponse(error: unknown) {
  const requestId = randomUUID();
  const safe = toSafeError(error, requestId);
  const status =
    error instanceof AppError
      ? {
          VALIDATION: 400,
          UNAUTHENTICATED: 401,
          RATE_LIMITED: 429,
          NOT_FOUND: 404,
          CONFLICT: 409,
          STORAGE_STATE: 409,
          INFRASTRUCTURE: 500,
        }[error.code]
      : 500;
  return NextResponse.json(safe, { status });
}
