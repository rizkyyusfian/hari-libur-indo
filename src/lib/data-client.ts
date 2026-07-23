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

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

const adminPath = (path: string) => `/api/admin${path}`;
const publicPath = (path: string) => `/api/public${path}`;

export const getRegions = () => api<Region[]>(adminPath('/regions'));

export const getHolidays = (year?: number) =>
  api<Holiday[]>(`${publicPath('/holidays')}${year ? `?year=${year}` : ''}`);
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
  api<Document[]>(`${publicPath('/documents')}?year=${year}`);
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
