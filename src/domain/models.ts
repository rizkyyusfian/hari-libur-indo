export interface Region {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

type HolidayType = 'national' | 'regional';
export type DocumentKind = 'original' | 'revision' | 'addendum' | 'cancellation';
export type DocumentStatus = 'draft' | 'published' | 'archived' | 'superseded';
type StorageStatus = 'missing' | 'pending' | 'ready' | 'deleting' | 'error';
type HolidayDocumentRelation = 'source' | 'adds' | 'revises' | 'cancels';

export interface Document {
  id: string;
  title: string;
  year: number;
  type: HolidayType;
  region_id?: string;
  document_kind: DocumentKind;
  status: DocumentStatus;
  storage_status: StorageStatus;
  published_date?: string;
  summary?: string;
  supersedes_document_id?: string;
  object_key?: string;
  file_url?: string;
  original_filename?: string;
  byte_size?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  region?: Region;
  supersedes_document?: Document;
}

interface HolidayDocument {
  holiday_id: string;
  document_id: string;
  relation_type: HolidayDocumentRelation;
  note?: string;
  created_at: string;
  document?: Document;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: HolidayType;
  region_id?: string;
  description?: string;
  is_cuti_bersama: boolean;
  created_at: string;
  updated_at: string;
  region?: Region;
  holiday_documents?: HolidayDocument[];
}

export interface HolidayMutationInput {
  date: string;
  name: string;
  type: HolidayType;
  region_id?: string;
  description?: string;
  is_cuti_bersama: boolean;
  document_ids?: string[];
  document_relation_type?: HolidayDocumentRelation;
  updated_at?: string;
}

export interface CreateDocumentInput {
  title: string;
  year: number;
  type?: HolidayType;
  region_id?: string;
  document_kind?: DocumentKind;
  published_date?: string;
  summary?: string;
  supersedes_document_id?: string;
}
