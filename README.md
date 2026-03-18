# 🇮🇩 Indonesia Holiday Web App (Papua Barat Daya Focus)

## 📌 Overview

This project is a **holiday calendar web application** focused on **Papua Barat Daya province**, while still supporting **national Indonesian holidays**.

Unlike typical calendar apps, this project aims to provide:

* Accurate **regional holiday support**
* Smart **long weekend detection**
* Intelligent **cuti (paid leave) planner**
* Clean, modern, and responsive UI

---

## 🎯 Goals

* Provide **accurate holiday data** (manual input, verified)
* Support **regional + national holiday filtering**
* Help users **optimize time off (cuti)**
* Deliver a **simple, fast, and enjoyable UX**

---

## 🧱 Tech Stack

### Frontend

* **Next.js (App Router)**
* **Tailwind CSS**
* **shadcn/ui**

### Backend

* **Supabase**

  * Database (PostgreSQL)
  * Storage (PDF documents)
  * Auth (admin login)

---

## ⚙️ Environment Variables

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_BUCKET=pdf-uploads
DEFAULT_PDF_URL=
```

---

## 🗄️ Database Schema

### 1. Regions

```sql
create table regions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  created_at timestamp default now()
);
```

Seed:

```sql
insert into regions (name, code)
values ('Papua Barat Daya', 'papua_barat_daya');
```

---

### 2. Holidays

```sql
create table holidays (
  id uuid primary key default uuid_generate_v4(),

  date date not null,
  name text not null,

  type text not null check (type in ('national', 'regional')),
  region_id uuid references regions(id) on delete cascade,

  description text,
  is_cuti_bersama boolean default false,

  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

---

### 3. Documents (PDF Surat Edaran)

```sql
create table documents (
  id uuid primary key default uuid_generate_v4(),

  holiday_id uuid references holidays(id) on delete cascade,
  title text,
  file_url text not null,

  created_at timestamp default now()
);
```

---

## 🔐 Row Level Security (RLS)

Enable:

```sql
alter table holidays enable row level security;
alter table documents enable row level security;
```

Public read:

```sql
create policy "Public can read holidays"
on holidays for select using (true);

create policy "Public can read documents"
on documents for select using (true);
```

Authenticated users (admin) can modify:

```sql
create policy "Auth can insert holidays"
on holidays for insert
with check (auth.role() = 'authenticated');

create policy "Auth can update holidays"
on holidays for update
using (auth.role() = 'authenticated');

create policy "Auth can delete holidays"
on holidays for delete
using (auth.role() = 'authenticated');
```

---

## 📦 Storage (Supabase)

Bucket:

```
pdf-uploads
```

Used for:

* Surat Edaran (PDF documents)

---

## 🧠 Core Features

### 1. Calendar View

* Day / Week / Month / Year
* Highlight:

  * Holidays
  * Weekends
* Toggle:

  * National only
  * Include Papua Barat Daya

---

### 2. Holiday Summary

* Current day status:

  * Holiday / Not holiday
* Nearest holiday
* Nearest long weekend
* Total holidays per year

---

### 3. Long Weekend Detection

#### Logic:

* Combine:

  * Holidays
  * Weekends (Sat/Sun)
* Detect consecutive ≥ 3 days

#### Output Example:

```json
{
  "start": "2026-12-24",
  "end": "2026-12-28",
  "length": 5
}
```

---

### 4. Cuti Planner (Core Feature)

#### Input:

* Number of cuti days

#### Output:

* Recommended leave dates
* Total days off

#### Strategy:

* Fill gaps between holidays
* Extend existing long weekends
* Maximize total days off

---

### 5. Long Weekend List

* Grouped by month
* Includes weekend bridging

---

### 6. Admin Panel

#### Features:

* Login (Supabase Auth)
* Add/Edit/Delete holidays
* Upload PDF (Surat Edaran)
* Assign region (optional)

---

### 7. PDF Upload

Flow:

1. Upload file to Supabase Storage
2. Get public URL
3. Save to `documents.file_url`

---

### 8. Export Calendar

* JPG (html2canvas)
* PDF (jspdf)

---

### 9. Localization

* Default: Bahasa Indonesia
* Secondary: English

---

### 10. Dark Mode

* Light / Dark toggle

---

### 11. Timezone Detection

* Auto-detect user timezone
* Support:

  * WIB
  * WITA
  * WIT

---

## 🎨 UI Structure

```
/app
  /page.tsx
  /components
    header.tsx
    summary-card.tsx
    calendar.tsx
    toggle-region.tsx
    long-weekend-list.tsx
    cuti-planner.tsx
```

---

## 🧩 Key UI Sections

### Header

* App title
* Theme toggle

### Summary Card

* Today status
* Nearest holiday
* Long weekend info
* Fun "roast" message

### Calendar

* Grid (7 columns)
* Highlight holidays

### Long Weekend List

* Date range + duration

### Cuti Planner

* Input: cuti days
* Output: recommendation

---

## 😄 UX Enhancement (Roast Text)

Examples:

* "Belum libur bos, kerja dulu 😭"
* "Tahan dikit, libur bentar lagi 💪"
* "Gas! Long weekend 🔥"

---

## 🚀 Development Phases

### Phase 1 (MVP)

* Calendar view
* Holiday data (manual input)
* Toggle regional
* Basic summary

---

### Phase 2

* Long weekend detection
* Countdown
* Year stats

---

### Phase 3

* Cuti planner (core logic)
* Export PDF/JPG

---

### Phase 4

* Localization (EN)
* Multi-region support

---

## 🧠 Key Design Decisions

* Holiday data is **manually managed**
* No external API dependency
* Supabase handles:

  * DB
  * Auth
  * Storage
* Schema is **future-proof for multi-region**

---

## 📌 Future Improvements

* Multi-province support
* Shareable holiday plans
* Notifications (PWA)
* Mobile-first optimization

---

## 💬 Notes

This project is designed as:

> A practical, accurate, and intelligent holiday planning tool for Indonesia.

---

## 🛠️ Next Steps

* Setup Supabase project
* Run SQL schema
* Build admin panel
* Connect frontend to database
* Implement core algorithms

---

## 👨‍💻 Author Notes

This README serves as:

* Project blueprint
* Development guide
* Copilot CLI context file

Keep updating this as the project evolves