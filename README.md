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
---

## ✅ Implementation Status

### Phase 1 ✓ COMPLETE
- [x] Calendar view (month/week/day)
- [x] Holiday data with mock
- [x] Regional toggle (national + Papua Barat Daya)
- [x] Summary card with today status
- [x] Roast message system

### Phase 2 ✓ COMPLETE
- [x] Long weekend detection algorithm
- [x] Countdown to next holiday
- [x] Long weekend list component (grouped by month)
- [x] Year statistics

### Phase 3 ✓ COMPLETE
- [x] Cuti planner algorithm with optimization
- [x] Cuti planner component with slider input
- [x] PDF export (jspdf)
- [x] JPG/PNG export (html2canvas)

### Phase 4 ✓ COMPLETE
- [x] Internationalization (ID + EN)
- [x] Dark mode toggle with persistence
- [x] Timezone detection (WIB, WITA, WIT)
- [x] Language switcher
- [x] UI polish and responsive design

### Admin Panel / Phase 5 (Not Started)
- [ ] Admin authentication (Supabase Auth)
- [ ] Holiday CRUD operations
- [ ] PDF upload for Surat Edaran
- [ ] Admin dashboard

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

1. Create `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SUPABASE_BUCKET=pdf-uploads
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── header.tsx        # App header with theme/language toggle
│   ├── calendar.tsx      # Calendar grid component
│   ├── summary-card.tsx  # Today status & next holiday
│   ├── toggle-region.tsx # Region filter buttons
│   ├── long-weekend-list.tsx # Long weekend display
│   ├── cuti-planner.tsx  # Leave planner component
│   ├── export-controls.tsx # PDF/Image export buttons
│   ├── timezone-info.tsx # Current timezone display
│   └── language-switcher.tsx # Language toggle
└── lib/
    ├── date-utils.ts     # Date manipulation & holiday logic
    ├── cuti-planner.ts   # Leave planning algorithm
    ├── export-utils.ts   # PDF/image export functions
    ├── mock-data.ts      # Mock holiday data
    ├── supabase.ts       # Supabase client
    ├── i18n.ts           # Internationalization
    └── timezone.ts       # Timezone utilities
```

---

## 🎨 Key Features Implemented

### Calendar View
- Month grid with day/week navigation
- Holiday highlighting in green
- Weekend highlighting in red
- Current day in blue
- Interactive day selection

### Long Weekend Detection
- Automatically detects 3+ consecutive off days
- Groups by month for easy viewing
- Shows date ranges and duration
- Lists contributing holidays/weekends

### Cuti Planner
- Interactive slider (1-30 days)
- Smart algorithm to maximize days off
- Shows total potential off days
- Provides up to 5 recommendations
- Displays exact dates to take leave

### Regional Filtering
- National holidays only
- National + Papua Barat Daya
- Dedicated regional holidays

### Export Functionality
- Export calendar as PNG image
- Export calendar as PDF document
- Uses html2canvas and jspdf libraries

### Localization
- Bahasa Indonesia (default)
- English
- Auto-detection based on browser language
- Persistent language selection

### Timezone Support
- WIB (UTC+7) - Western Indonesia
- WITA (UTC+8) - Central Indonesia  
- WIT (UTC+9) - Eastern Indonesia
- Auto-detection based on system
- Real-time clock display

### Dark Mode
- Light/Dark theme toggle
- Persistent preference storage
- System preference detection

---

## 🔄 Next Steps for Admin Panel

To complete Phase 5, implement:

1. **Authentication**
   - Setup Supabase Auth with email/password
   - Protect admin routes
   - Create login page

2. **Holiday Management**
   - Create form for adding holidays
   - Edit existing holidays
   - Delete holidays
   - Batch upload from CSV

3. **Document Upload**
   - Upload Surat Edaran PDFs
   - Link documents to holidays
   - Display PDF links in UI

4. **Database Integration**
   - Replace mock-data with Supabase queries
   - Real-time updates
   - Row-level security policies

---

## 🧪 Testing

Build and verify:
```bash
npm run build
npm run lint
```

---

## 📝 Notes

- Holiday data is currently mocked (2026 data)
- Admin panel not yet implemented
- Supabase setup required for production
- Mobile-responsive design implemented
- RTL language support (future enhancement)

---

## 📄 License

This project is part of the Hari Libur Indo initiative.

