export type AppErrorCode =
  | 'VALIDATION'
  | 'UNAUTHENTICATED'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'STORAGE_STATE'
  | 'INFRASTRUCTURE';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function toSafeError(error: unknown, requestId: string) {
  if (error instanceof AppError) {
    return { code: error.code, message: error.message, details: error.details, requestId };
  }

  console.error(`[${requestId}] Unexpected server error`, error);
  return {
    code: 'INFRASTRUCTURE' as const,
    message: `Terjadi gangguan pada layanan. Kode: ${requestId}`,
    requestId,
  };
}
