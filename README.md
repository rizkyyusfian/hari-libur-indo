# 🇮🇩 Hari Libur Indo

> Kalender hari libur Indonesia dengan fokus Papua Barat Daya — smart, modern, dan helpful.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 📅 **Calendar View** — Monthly & yearly view dengan highlight hari libur
- 🏝️ **Long Weekend Detection** — Auto-detect long weekend (≥3 hari berturut-turut)
- 🎯 **Regional Support** — Hari libur nasional + regional khusus Papua Barat Daya
- 📄 **Surat Edaran** — Link ke dokumen resmi SKB Cuti Bersama
- 🌙 **Dark Mode** — Light/dark theme toggle
- 📥 **Export** — Download kalender sebagai PNG atau PDF
- ⏰ **Timezone Aware** — Support WIB, WITA, WIT

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/hari-libur-indo.git
cd hari-libur-indo

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
# Optional fallback (legacy naming):
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_BUCKET=your_bucket_name
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Icons | Lucide React |
| Export | html-to-image, jsPDF |

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main calendar page
│   ├── about/            # About page
│   └── admin/            # Admin panel (protected)
├── components/
│   ├── calendar.tsx      # Calendar component
│   ├── summary-card.tsx  # Today's status
│   ├── long-weekend-list.tsx
│   ├── export-controls.tsx
│   ├── document-reference.tsx
│   └── ui/               # Reusable UI components
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── date-utils.ts     # Date helpers
│   └── export-utils.ts   # PNG/PDF export
└── providers/
    └── theme-provider.tsx
```

## 🗄️ Database Setup

Run the SQL in `supabase-schema.sql` to create tables:

- `regions` — Regional data (Papua Barat Daya)
- `holidays` — Holiday entries (national & regional)
- `documents` — Surat Edaran PDFs, including original documents, revisions, addendums, and cancellations
- `holiday_documents` — Links specific holidays to the document(s) that support them

<details>
<summary>Quick Schema Overview</summary>

```sql
-- Regions
create table regions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null
);

-- Holidays  
create table holidays (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  name text not null,
  type text check (type in ('national', 'regional')),
  region_id uuid references regions(id),
  is_cuti_bersama boolean default false
);

-- Documents
create table documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  file_url text not null,
  year integer not null,
  type text check (type in ('national', 'regional')),
  region_id uuid references regions(id),
  document_kind text check (document_kind in ('original', 'revision', 'addendum', 'cancellation')),
  status text check (status in ('draft', 'published', 'archived', 'superseded')),
  published_date date,
  summary text,
  supersedes_document_id uuid references documents(id),
  is_active boolean default true
);

-- Holiday source links
create table holiday_documents (
  holiday_id uuid references holidays(id),
  document_id uuid references documents(id),
  relation_type text check (relation_type in ('source', 'adds', 'revises', 'cancels')),
  primary key (holiday_id, document_id)
);
```

</details>

## 🔐 Admin Panel

Access admin panel at `/admin/login`

Features:
- 📝 CRUD holidays (single & batch insert)
- 📄 Upload Surat Edaran PDF
- 🔗 Link holidays to exact source/revision/addendum documents
- 🏷️ Assign regional holidays
- 📊 Dashboard overview

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Rizky Yusfian**

- Website: [rizkyyusfian.dev](https://rizkyyusfian.dev)
- GitHub: [@rizkyyusfian](https://github.com/rizkyyusfian)

---

<p align="center">
  Made with ☕ in Papua Barat Daya, Indonesia
  <br>
  <sub>© 2026 MRYY</sub>
</p>
