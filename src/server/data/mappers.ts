import type { Document, Holiday, Region } from '@/domain/models';
import { getR2Env } from '@/server/env';

type RegionRow = {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
};

type DocumentRow = {
  id: string;
  title: string;
  year: number;
  type: 'national' | 'regional';
  regionId: string | null;
  kind: 'original' | 'revision' | 'addendum' | 'cancellation';
  publicationStatus: 'draft' | 'published' | 'archived' | 'superseded';
  storageStatus: 'missing' | 'pending' | 'ready' | 'deleting' | 'error';
  publishedDate: string | null;
  summary: string | null;
  supersedesDocumentId: string | null;
  objectKey: string | null;
  originalFilename: string | null;
  byteSize: number | null;
  createdAt: Date;
  updatedAt: Date;
  region?: RegionRow | null;
  supersedes?: DocumentRow | null;
};

type HolidayLinkRow = {
  holidayId: string;
  documentId: string;
  relationType: 'source' | 'adds' | 'revises' | 'cancels';
  note: string | null;
  createdAt: Date;
  document?: DocumentRow | null;
};

type HolidayRow = {
  id: string;
  holidayDate: string;
  name: string;
  type: 'national' | 'regional';
  regionId: string | null;
  description: string | null;
  isCutiBersama: boolean;
  createdAt: Date;
  updatedAt: Date;
  region?: RegionRow | null;
  documentLinks?: HolidayLinkRow[];
};

export function mapRegion(row: RegionRow): Region {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    created_at: row.createdAt.toISOString(),
  };
}

function publicFileUrl(objectKey: string | null): string | undefined {
  if (!objectKey) return undefined;
  const base = getR2Env().R2_PUBLIC_BASE_URL.replace(/\/$/, '');
  return `${base}/${objectKey.split('/').map(encodeURIComponent).join('/')}`;
}

// Drizzle relational rows are intentionally accepted structurally here so query
// modules remain the only place coupled to database column names.
export function mapDocument(row: DocumentRow): Document {
  const region = row.region ? mapRegion(row.region) : undefined;
  const supersedes = row.supersedes ? mapDocument(row.supersedes) : undefined;
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    type: row.type,
    region_id: row.regionId ?? undefined,
    document_kind: row.kind,
    status: row.publicationStatus,
    storage_status: row.storageStatus,
    published_date: row.publishedDate ?? undefined,
    summary: row.summary ?? undefined,
    supersedes_document_id: row.supersedesDocumentId ?? undefined,
    object_key: row.objectKey ?? undefined,
    file_url: row.storageStatus === 'ready' ? publicFileUrl(row.objectKey) : undefined,
    original_filename: row.originalFilename ?? undefined,
    byte_size: row.byteSize ?? undefined,
    is_active: row.publicationStatus === 'published' && row.storageStatus === 'ready',
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    region,
    supersedes_document: supersedes,
  };
}

export function mapHoliday(row: HolidayRow): Holiday {
  return {
    id: row.id,
    date: row.holidayDate,
    name: row.name,
    type: row.type,
    region_id: row.regionId ?? undefined,
    description: row.description ?? undefined,
    is_cuti_bersama: row.isCutiBersama,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    region: row.region ? mapRegion(row.region) : undefined,
    holiday_documents: row.documentLinks?.map((link) => ({
      holiday_id: link.holidayId,
      document_id: link.documentId,
      relation_type: link.relationType,
      note: link.note ?? undefined,
      created_at: link.createdAt.toISOString(),
      document: link.document ? mapDocument(link.document) : undefined,
    })),
  };
}
