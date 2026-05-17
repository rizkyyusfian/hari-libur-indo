-- Hari Libur Indo - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Regions Table
create table if not exists regions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  created_at timestamp with time zone default now()
);

-- Seed default region
insert into regions (name, code)
values ('Papua Barat Daya', 'papua_barat_daya')
on conflict (code) do nothing;

-- 2. Holidays Table
create table if not exists holidays (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  name text not null,
  type text not null check (type in ('national', 'regional')),
  region_id uuid references regions(id) on delete cascade,
  description text,
  is_cuti_bersama boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Documents Table (Surat Edaran - official source reference)
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,  -- e.g., "SKB 3 Menteri Tahun 2026"
  file_url text not null,
  year integer not null,
  type text not null default 'national' check (type in ('national', 'regional')),
  region_id uuid references regions(id) on delete cascade,
  document_kind text not null default 'original' check (document_kind in ('original', 'revision', 'addendum', 'cancellation')),
  status text not null default 'published' check (status in ('draft', 'published', 'archived', 'superseded')),
  published_date date,
  summary text,
  supersedes_document_id uuid references documents(id) on delete set null,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Migration: Add columns if table already exists
-- Run these if you need to update an existing table:
ALTER TABLE documents ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'national' CHECK (type IN ('national', 'regional'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS region_id uuid REFERENCES regions(id) ON DELETE CASCADE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_kind text NOT NULL DEFAULT 'original' CHECK (document_kind IN ('original', 'revision', 'addendum', 'cancellation'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'superseded'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS published_date date;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS supersedes_document_id uuid REFERENCES documents(id) ON DELETE SET NULL;

-- 3b. Holiday source documents
create table if not exists holiday_documents (
  holiday_id uuid not null references holidays(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  relation_type text not null default 'source' check (relation_type in ('source', 'adds', 'revises', 'cancels')),
  note text,
  created_at timestamp with time zone default now(),
  primary key (holiday_id, document_id)
);

-- 4. Enable Row Level Security
alter table regions enable row level security;
alter table holidays enable row level security;
alter table documents enable row level security;
alter table holiday_documents enable row level security;

-- 5. RLS Policies - Public can read
drop policy if exists "Public can read regions" on regions;
create policy "Public can read regions"
on regions for select using (true);

drop policy if exists "Public can read holidays" on holidays;
create policy "Public can read holidays"
on holidays for select using (true);

drop policy if exists "Public can read documents" on documents;
create policy "Public can read documents"
on documents for select using (true);

drop policy if exists "Public can read holiday documents" on holiday_documents;
create policy "Public can read holiday documents"
on holiday_documents for select using (true);

-- 6. RLS Policies - Authenticated users (admin) can modify
drop policy if exists "Auth can insert holidays" on holidays;
create policy "Auth can insert holidays"
on holidays for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Auth can update holidays" on holidays;
create policy "Auth can update holidays"
on holidays for update
using (auth.role() = 'authenticated');

drop policy if exists "Auth can delete holidays" on holidays;
create policy "Auth can delete holidays"
on holidays for delete
using (auth.role() = 'authenticated');

drop policy if exists "Auth can insert documents" on documents;
create policy "Auth can insert documents"
on documents for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Auth can update documents" on documents;
create policy "Auth can update documents"
on documents for update
using (auth.role() = 'authenticated');

drop policy if exists "Auth can delete documents" on documents;
create policy "Auth can delete documents"
on documents for delete
using (auth.role() = 'authenticated');

drop policy if exists "Auth can insert holiday documents" on holiday_documents;
create policy "Auth can insert holiday documents"
on holiday_documents for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Auth can update holiday documents" on holiday_documents;
create policy "Auth can update holiday documents"
on holiday_documents for update
using (auth.role() = 'authenticated');

drop policy if exists "Auth can delete holiday documents" on holiday_documents;
create policy "Auth can delete holiday documents"
on holiday_documents for delete
using (auth.role() = 'authenticated');

-- 7. Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 8. Apply trigger to holidays table
drop trigger if exists update_holidays_updated_at on holidays;
create trigger update_holidays_updated_at
  before update on holidays
  for each row
  execute function update_updated_at_column();

-- 9. Create indexes for better query performance
create index if not exists idx_holidays_date on holidays(date);
create index if not exists idx_holidays_type on holidays(type);
create index if not exists idx_holidays_region on holidays(region_id);
create index if not exists idx_documents_year on documents(year);
create index if not exists idx_documents_active on documents(is_active);
create index if not exists idx_documents_status on documents(status);
create index if not exists idx_documents_kind on documents(document_kind);
create index if not exists idx_documents_supersedes on documents(supersedes_document_id);
create index if not exists idx_holiday_documents_holiday on holiday_documents(holiday_id);
create index if not exists idx_holiday_documents_document on holiday_documents(document_id);


-- 10. Storage bucket for PDF uploads
-- Ensure this bucket name matches NEXT_PUBLIC_SUPABASE_BUCKET (or use default: pdf-uploads)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pdf-uploads',
  'pdf-uploads',
  true,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 11. Storage RLS policies for PDF uploads
-- Required for upload with upsert=true: INSERT + SELECT + UPDATE
drop policy if exists "Public can read pdf uploads" on storage.objects;
create policy "Public can read pdf uploads"
on storage.objects for select
using (bucket_id = 'pdf-uploads');

drop policy if exists "Auth can insert pdf uploads" on storage.objects;
create policy "Auth can insert pdf uploads"
on storage.objects for insert to authenticated
with check (bucket_id = 'pdf-uploads');

drop policy if exists "Auth can update pdf uploads" on storage.objects;
create policy "Auth can update pdf uploads"
on storage.objects for update to authenticated
using (bucket_id = 'pdf-uploads')
with check (bucket_id = 'pdf-uploads');

drop policy if exists "Auth can delete pdf uploads" on storage.objects;
create policy "Auth can delete pdf uploads"
on storage.objects for delete to authenticated
using (bucket_id = 'pdf-uploads');