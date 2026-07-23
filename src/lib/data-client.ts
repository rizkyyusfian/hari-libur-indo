import type {
  CreateDocumentInput,
  Document,
  Holiday,
  HolidayMutationInput,
  Region,
} from '@/domain/models';

export type {
  CreateDocumentInput,
  Document,
  DocumentKind,
  DocumentStatus,
  Holiday,
  HolidayMutationInput,
  Region,
} from '@/domain/models';

const TRANSIENT_STATUSES = new Set([502, 503, 504]);
const PUBLIC_RETRY_DELAY_MS = 250;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function redirectExpiredAdminSession(url: string, status: number) {
  if (
    status !== 401 ||
    !url.startsWith('/api/admin/') ||
    typeof window === 'undefined' ||
    window.location.pathname === '/admin/login'
  ) {
    return;
  }

  const next = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/admin/login?next=${encodeURIComponent(next)}`);
}

const wait = (milliseconds: number) =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

async function api<T>(
  url: string,
  init?: RequestInit,
  options: { retryTransient?: boolean } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: 'no-store',
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    if (options.retryTransient) {
      await wait(PUBLIC_RETRY_DELAY_MS);
      return api<T>(url, init);
    }
    throw error;
  }

  if (options.retryTransient && TRANSIENT_STATUSES.has(response.status)) {
    await wait(PUBLIC_RETRY_DELAY_MS);
    return api<T>(url, init);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    redirectExpiredAdminSession(url, response.status);
    throw new ApiError(
      payload?.message ?? `Request failed (${response.status})`,
      response.status,
      payload?.code,
      payload?.requestId,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

const adminPath = (path: string) => `/api/admin${path}`;
const publicPath = (path: string) => `/api/public${path}`;

export const getRegions = () => api<Region[]>(adminPath('/regions'));

export const getHolidays = (year?: number) =>
  api<Holiday[]>(
    `${publicPath('/holidays')}${year ? `?year=${year}` : ''}`,
    undefined,
    { retryTransient: true },
  );
export const getAdminHolidays = (year?: number) =>
  api<Holiday[]>(`${adminPath('/holidays')}${year ? `?year=${year}` : ''}`);
export const getHolidayById = (id: string) => api<Holiday | null>(adminPath(`/holidays/${id}`));
export const createHoliday = (holiday: HolidayMutationInput) =>
  api<Holiday>(adminPath('/holidays'), { method: 'POST', body: JSON.stringify(holiday) });
export const updateHoliday = (id: string, holiday: Partial<HolidayMutationInput>) =>
  api<Holiday>(adminPath(`/holidays/${id}`), { method: 'PUT', body: JSON.stringify(holiday) });
export const deleteHoliday = (id: string) =>
  api<void>(adminPath(`/holidays/${id}`), { method: 'DELETE' });
export const createHolidayBatch = (rows: HolidayMutationInput[]) =>
  api<{ count: number }>(adminPath('/holidays/batch'), {
    method: 'POST',
    body: JSON.stringify(rows),
  });

export const getDocuments = () => api<Document[]>(adminPath('/documents'));
export const getPublishedDocumentsByYear = (year: number) =>
  api<Document[]>(
    `${publicPath('/documents')}?year=${year}`,
    undefined,
    { retryTransient: true },
  );
export const createDocument = (doc: CreateDocumentInput) =>
  api<Document>(adminPath('/documents'), { method: 'POST', body: JSON.stringify(doc) });
export const deleteDocument = (id: string) =>
  api<void>(adminPath(`/documents/${id}`), { method: 'DELETE' });
export const publishDocument = (id: string) =>
  api<Document>(adminPath(`/documents/${id}`), {
    method: 'PATCH',
    body: JSON.stringify({ action: 'publish' }),
  });
export const archiveDocument = (id: string) =>
  api<Document>(adminPath(`/documents/${id}`), {
    method: 'PATCH',
    body: JSON.stringify({ action: 'archive' }),
  });

export async function uploadDocumentPDF(documentId: string, file: File) {
  const authorization = await api<{
    uploadUrl: string;
    headers: Record<string, string>;
  }>(adminPath(`/documents/${documentId}/upload`), {
    method: 'POST',
    body: JSON.stringify({
      action: 'authorize',
      filename: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });
  const upload = await fetch(authorization.uploadUrl, {
    method: 'PUT',
    headers: authorization.headers,
    body: file,
  });
  if (!upload.ok) throw new Error(`Upload R2 gagal (${upload.status}).`);
  return api<Document>(adminPath(`/documents/${documentId}/upload`), {
    method: 'POST',
    body: JSON.stringify({ action: 'finalize' }),
  });
}

export async function getHolidayStats(year: number) {
  const rows = await getAdminHolidays(year);
  return {
    total: rows.length,
    national: rows.filter((row) => row.type === 'national').length,
    regional: rows.filter((row) => row.type === 'regional').length,
    cutiBersama: rows.filter((row) => row.is_cuti_bersama).length,
  };
}
