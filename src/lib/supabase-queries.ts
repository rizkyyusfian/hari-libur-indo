import { supabase, getSupabaseAdmin } from './supabase';

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
}

export interface Document {
  id: string;
  title: string;
  file_url: string;
  year: number;
  type: 'national' | 'regional';
  region_id?: string;
  is_active: boolean;
  created_at: string;
  region?: Region;
}

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
  let query = supabase
    .from('holidays')
    .select(`
      *,
      region:regions(*)
    `)
    .order('date');
  
  if (year) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    query = query.gte('date', startDate).lte('date', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

export async function getHolidayById(id: string): Promise<Holiday | null> {
  const { data, error } = await supabase
    .from('holidays')
    .select(`
      *,
      region:regions(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
}

export async function createHoliday(holiday: Omit<Holiday, 'id' | 'created_at' | 'updated_at' | 'region'>): Promise<Holiday> {
  const { data, error } = await supabase
    .from('holidays')
    .insert(holiday)
    .select(`
      *,
      region:regions(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateHoliday(id: string, holiday: Partial<Omit<Holiday, 'id' | 'created_at' | 'updated_at' | 'region'>>): Promise<Holiday> {
  const { data, error } = await supabase
    .from('holidays')
    .update(holiday)
    .eq('id', id)
    .select(`
      *,
      region:regions(*)
    `)
    .single();
  
  if (error) throw error;
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
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      region:regions(*)
    `)
    .order('year', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getActiveDocument(year?: number): Promise<Document | null> {
  let query = supabase
    .from('documents')
    .select(`
      *,
      region:regions(*)
    `)
    .eq('is_active', true)
    .eq('type', 'national')
    .order('year', { ascending: false })
    .limit(1);
  
  if (year) {
    query = query.eq('year', year);
  }
  
  const { data, error } = await query;
  
  if (error) return null;
  return data?.[0] || null;
}

// Get regional document for a specific year and region
export async function getRegionalDocument(year: number, regionCode: string): Promise<Document | null> {
  const region = await getRegionByCode(regionCode);
  if (!region) {
    console.warn('[getRegionalDocument] Region not found:', regionCode);
    return null;
  }

  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      region:regions(*)
    `)
    .eq('is_active', true)
    .eq('type', 'regional')
    .eq('region_id', region.id)
    .eq('year', year)
    .limit(1);
  
  if (error) {
    console.error('[getRegionalDocument] Supabase error:', error);
    return null;
  }
  
  if (!data || data.length === 0) {
    console.warn('[getRegionalDocument] No active regional document found for:', { year, regionCode, regionId: region.id });
  }
  
  return data?.[0] || null;
}

// Get all documents for a year (both national and regional)
export async function getDocumentsByYear(year: number): Promise<{ national: Document | null; regional: Document[] }> {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      region:regions(*)
    `)
    .eq('is_active', true)
    .eq('year', year);
  
  if (error) return { national: null, regional: [] };
  
  const national = data?.find(d => d.type === 'national') || null;
  const regional = data?.filter(d => d.type === 'regional') || [];
  
  return { national, regional };
}

export interface CreateDocumentInput {
  title: string;
  year: number;
  file_path: string;
  type?: 'national' | 'regional';
  region_id?: string;
  is_active?: boolean;
}

export async function createDocument(doc: CreateDocumentInput): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title: doc.title,
      year: doc.year,
      file_url: doc.file_path, // file_path is the URL from storage
      type: doc.type || 'national',
      region_id: doc.region_id,
      is_active: doc.is_active ?? false,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateDocument(id: string, doc: Partial<Omit<Document, 'id' | 'created_at'>>): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .update(doc)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function setActiveDocument(id: string): Promise<void> {
  // First, deactivate all documents
  const { error: deactivateError } = await supabase
    .from('documents')
    .update({ is_active: false })
    .neq('id', id);
  
  if (deactivateError) throw deactivateError;
  
  // Then activate the selected one
  const { error } = await supabase
    .from('documents')
    .update({ is_active: true })
    .eq('id', id);
  
  if (error) throw error;
}

// File Upload
export async function uploadPDF(file: File, filename: string): Promise<string> {
  const bucket = process.env.SUPABASE_BUCKET || 'pdf-uploads';
  const filePath = `surat-edaran/${filename}`;
  
  const { data, error } = await supabase
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
