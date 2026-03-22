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
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Migration: Add columns if table already exists
-- Run these if you need to update an existing table:
-- ALTER TABLE documents ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'national' CHECK (type IN ('national', 'regional'));
-- ALTER TABLE documents ADD COLUMN IF NOT EXISTS region_id uuid REFERENCES regions(id) ON DELETE CASCADE;

-- 4. Enable Row Level Security
alter table regions enable row level security;
alter table holidays enable row level security;
alter table documents enable row level security;

-- 5. RLS Policies - Public can read
create policy "Public can read regions"
on regions for select using (true);

create policy "Public can read holidays"
on holidays for select using (true);

create policy "Public can read documents"
on documents for select using (true);

-- 6. RLS Policies - Authenticated users (admin) can modify
create policy "Auth can insert holidays"
on holidays for insert
with check (auth.role() = 'authenticated');

create policy "Auth can update holidays"
on holidays for update
using (auth.role() = 'authenticated');

create policy "Auth can delete holidays"
on holidays for delete
using (auth.role() = 'authenticated');

create policy "Auth can insert documents"
on documents for insert
with check (auth.role() = 'authenticated');

create policy "Auth can update documents"
on documents for update
using (auth.role() = 'authenticated');

create policy "Auth can delete documents"
on documents for delete
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
