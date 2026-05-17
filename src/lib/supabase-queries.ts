import { supabase } from './supabase';

// Types
export interface Region {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'national' | 'regional';
  region_id?: string;
  description?: string;
  is_cuti_bersama: boolean;
  created_at: string;
  updated_at: string;
  region?: Region;
  holiday_documents?: HolidayDocument[];
}

export type DocumentKind = 'original' | 'revision' | 'addendum' | 'cancellation';
export type DocumentStatus = 'draft' | 'published' | 'archived' | 'superseded';
export type HolidayDocumentRelation = 'source' | 'adds' | 'revises' | 'cancels';

export interface Document {
  id: string;
  title: string;
  file_url: string;
  year: number;
  type: 'national' | 'regional';
  region_id?: string;
  document_kind: DocumentKind;
  status: DocumentStatus;
  published_date?: string;
  summary?: string;
  supersedes_document_id?: string;
  is_active: boolean;
  created_at: string;
  region?: Region;
  supersedes_document?: Document;
}

export interface HolidayDocument {
  holiday_id: string;
  document_id: string;
  relation_type: HolidayDocumentRelation;
  note?: string;
  created_at: string;
  document?: Document;
}

type HolidayMutationInput = Omit<Holiday, 'id' | 'created_at' | 'updated_at' | 'region' | 'holiday_documents'> & {
  document_ids?: string[];
  document_relation_type?: HolidayDocumentRelation;
};

const holidaySelect = `
  *,
  region:regions(*),
  holiday_documents(
    holiday_id,
    document_id,
    relation_type,
    note,
    created_at,
    document:documents(
      *,
      region:regions(*),
      supersedes_document:documents!documents_supersedes_document_id_fkey(*)
    )
  )
`;

const holidaySelectFallback = `
  *,
  region:regions(*),
  holiday_documents(
    holiday_id,
    document_id,
    relation_type,
    note,
    created_at,
    document:documents(
      *,
      region:regions(*)
    )
  )
`;

const documentSelect = `
  *,
  region:regions(*),
  supersedes_document:documents!documents_supersedes_document_id_fkey(*)
`;

const documentSelectFallback = `
  *,
  region:regions(*)
`;

const isDocumentsSelfRelationMissing = (error: { code?: string; message?: string } | null): boolean =>
  Boolean(
    error &&
    error.code === 'PGRST200' &&
    error.message?.includes("between 'documents' and 'documents'")
  );

// Region Queries
export async function getRegions(): Promise<Region[]> {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function getRegionByCode(code: string): Promise<Region | null> {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .eq('code', code)
    .single();
  
  if (error) return null;
  return data;
}

// Holiday Queries
export async function getHolidays(year?: number): Promise<Holiday[]> {
  const runQuery = async (selectClause: string) => {
    let query = supabase
      .from('holidays')
      .select(selectClause)
      .order('date');
    
    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('date', startDate).lte('date', endDate);
    }

    return query;
  };

  const primary = await runQuery(holidaySelect);
  if (!isDocumentsSelfRelationMissing(primary.error)) {
    if (primary.error) throw primary.error;
    return (primary.data as unknown as Holiday[]) || [];
  }

  const fallback = await runQuery(holidaySelectFallback);
  if (fallback.error) throw fallback.error;
  return (fallback.data as unknown as Holiday[]) || [];
}

export async function getHolidayById(id: string): Promise<Holiday | null> {
  const primary = await supabase
    .from('holidays')
    .select(holidaySelect)
    .eq('id', id)
    .single();

  if (!isDocumentsSelfRelationMissing(primary.error)) {
    if (primary.error) return null;
    return primary.data;
  }

  const fallback = await supabase
    .from('holidays')
    .select(holidaySelectFallback)
    .eq('id', id)
    .single();

  if (fallback.error) return null;
  return fallback.data;
}

async function setHolidayDocuments(
  holidayId: string,
  documentIds: string[],
  relationType: HolidayDocumentRelation = 'source'
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('holiday_documents')
    .delete()
    .eq('holiday_id', holidayId);

  if (deleteError) throw deleteError;

  if (documentIds.length === 0) {
    return;
  }

  const uniqueDocumentIds = [...new Set(documentIds)];
  const { error: insertError } = await supabase
    .from('holiday_documents')
    .insert(uniqueDocumentIds.map(documentId => ({
      holiday_id: holidayId,
      document_id: documentId,
      relation_type: relationType,
    })));

  if (insertError) throw insertError;
}

export async function createHoliday(holiday: HolidayMutationInput): Promise<Holiday> {
  const { document_ids, document_relation_type, ...holidayData } = holiday;
  const { data, error } = await supabase
    .from('holidays')
    .insert(holidayData)
    .select('*')
    .single();

  if (error) throw error;

  if (document_ids) {
    await setHolidayDocuments(data.id, document_ids, document_relation_type);
    const updatedHoliday = await getHolidayById(data.id);
    if (updatedHoliday) return updatedHoliday;
  }

  return data;
}

export async function updateHoliday(id: string, holiday: Partial<HolidayMutationInput>): Promise<Holiday> {
  const { document_ids, document_relation_type, ...holidayData } = holiday;
  const { data, error } = await supabase
    .from('holidays')
    .update(holidayData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  if (document_ids) {
    await setHolidayDocuments(id, document_ids, document_relation_type);
    const updatedHoliday = await getHolidayById(id);
    if (updatedHoliday) return updatedHoliday;
  }

  return data;
}

export async function deleteHoliday(id: string): Promise<void> {
  const { error } = await supabase
    .from('holidays')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Document Queries
export async function getDocuments(): Promise<Document[]> {
  const runQuery = async (selectClause: string) =>
    supabase
      .from('documents')
      .select(selectClause)
      .order('year', { ascending: false })
      .order('type')
      .order('published_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

  const primary = await runQuery(documentSelect);
  if (!isDocumentsSelfRelationMissing(primary.error)) {
    if (primary.error) throw primary.error;
    return (primary.data as unknown as Document[]) || [];
  }

  const fallback = await runQuery(documentSelectFallback);
  if (fallback.error) throw fallback.error;
  return (fallback.data as unknown as Document[]) || [];
}

export async function getActiveDocument(year?: number): Promise<Document | null> {
  const runQuery = async (selectClause: string) => {
    let query = supabase
      .from('documents')
      .select(selectClause)
      .eq('is_active', true)
      .eq('status', 'published')
      .eq('type', 'national')
      .order('year', { ascending: false })
      .limit(1);

    if (year) {
      query = query.eq('year', year);
    }

    return query;
  };

  const primary = await runQuery(documentSelect);
  if (!isDocumentsSelfRelationMissing(primary.error)) {
    if (primary.error) return null;
    const rows = (primary.data as unknown as Document[]) || [];
    return rows[0] || null;
  }

  const fallback = await runQuery(documentSelectFallback);
  if (fallback.error) return null;
  const rows = (fallback.data as unknown as Document[]) || [];
  return rows[0] || null;
}

// Get regional document for a specific year and region
export async function getRegionalDocument(year: number, regionCode: string): Promise<Document | null> {
  const region = await getRegionByCode(regionCode);
  if (!region) {
    console.warn('[getRegionalDocument] Region not found:', regionCode);
    return null;
  }

  const runQuery = async (selectClause: string) =>
    supabase
      .from('documents')
      .select(selectClause)
      .eq('is_active', true)
      .eq('status', 'published')
      .eq('type', 'regional')
      .eq('region_id', region.id)
      .eq('year', year)
      .order('published_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(1);

  const primary = await runQuery(documentSelect);
  const { data, error } = isDocumentsSelfRelationMissing(primary.error)
    ? await runQuery(documentSelectFallback)
    : primary;

  if (error) {
    console.error('[getRegionalDocument] Supabase error:', error);
    return null;
  }
  
  if (!data || data.length === 0) {
    console.warn('[getRegionalDocument] No active regional document found for:', { year, regionCode, regionId: region.id });
  }
  
  const rows = (data as unknown as Document[]) || [];
  return rows[0] || null;
}

// Get all documents for a year (both national and regional)
export async function getDocumentsByYear(year: number): Promise<{ national: Document | null; regional: Document[] }> {
  const runQuery = async (selectClause: string) =>
    supabase
      .from('documents')
      .select(selectClause)
      .eq('is_active', true)
      .eq('status', 'published')
      .eq('year', year);

  const primary = await runQuery(documentSelect);
  const { data, error } = isDocumentsSelfRelationMissing(primary.error)
    ? await runQuery(documentSelectFallback)
    : primary;

  if (error) return { national: null, regional: [] };

  const rows = (data as unknown as Document[]) || [];
  const national = rows.find(d => d.type === 'national') || null;
  const regional = rows.filter(d => d.type === 'regional');
  
  return { national, regional };
}

export async function getPublishedDocumentsByYear(year: number): Promise<Document[]> {
  const runQuery = async (selectClause: string) =>
    supabase
      .from('documents')
      .select(selectClause)
      .eq('is_active', true)
      .eq('status', 'published')
      .eq('year', year)
      .order('type')
      .order('published_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

  const primary = await runQuery(documentSelect);
  if (!isDocumentsSelfRelationMissing(primary.error)) {
    if (primary.error) throw primary.error;
    return (primary.data as unknown as Document[]) || [];
  }

  const fallback = await runQuery(documentSelectFallback);
  if (fallback.error) throw fallback.error;
  return (fallback.data as unknown as Document[]) || [];
}

export interface CreateDocumentInput {
  title: string;
  year: number;
  file_path: string;
  type?: 'national' | 'regional';
  region_id?: string;
  document_kind?: DocumentKind;
  status?: DocumentStatus;
  published_date?: string;
  summary?: string;
  supersedes_document_id?: string;
  is_active?: boolean;
}

async function getDocumentById(id: string): Promise<Document | null> {
  const primary = await supabase
    .from('documents')
    .select(documentSelect)
    .eq('id', id)
    .single();

  if (!isDocumentsSelfRelationMissing(primary.error)) {
    if (primary.error) return null;
    return primary.data;
  }

  const fallback = await supabase
    .from('documents')
    .select(documentSelectFallback)
    .eq('id', id)
    .single();

  if (fallback.error) return null;
  return fallback.data;
}

export async function createDocument(doc: CreateDocumentInput): Promise<Document> {
  const documentData = {
    title: doc.title,
    year: doc.year,
    file_url: doc.file_path, // file_path is the URL from storage
    type: doc.type || 'national',
    region_id: doc.region_id,
    document_kind: doc.document_kind || 'original',
    status: doc.status || 'published',
    published_date: doc.published_date || null,
    summary: doc.summary || null,
    supersedes_document_id: doc.supersedes_document_id || null,
    is_active: doc.is_active ?? false,
  };

  const { data, error } = await supabase
    .from('documents')
    .insert(documentData)
    .select('*')
    .single();

  if (error) throw error;

  const created = await getDocumentById(data.id);
  return created || data;
}

export async function updateDocument(id: string, doc: Partial<Omit<Document, 'id' | 'created_at'>>): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .update(doc)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  const updated = await getDocumentById(id);
  return updated || data;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function publishDocument(id: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ is_active: true, status: 'published' })
    .eq('id', id);

  if (error) throw error;
}

export async function archiveDocument(id: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ is_active: false, status: 'archived' })
    .eq('id', id);
  
  if (error) throw error;
}

export const setActiveDocument = publishDocument;

// File Upload
export async function uploadPDF(file: File, filename: string): Promise<string> {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'pdf-uploads';
  const filePath = `surat-edaran/${filename}`;
  
  const { error } = await supabase
    .storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: urlData } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return urlData.publicUrl;
}

// Statistics
export async function getHolidayStats(year: number) {
  const holidays = await getHolidays(year);
  
  const national = holidays.filter(h => h.type === 'national').length;
  const regional = holidays.filter(h => h.type === 'regional').length;
  const cutiBersama = holidays.filter(h => h.is_cuti_bersama).length;
  
  return {
    total: holidays.length,
    national,
    regional,
    cutiBersama,
  };
}
