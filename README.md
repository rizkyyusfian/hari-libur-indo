# 🇮🇩 Hari Libur Indo

> Kalender hari libur Indonesia dengan fokus Papua Barat Daya — smart, modern, dan helpful.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2-F38020?logo=cloudflare)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 📅 **Calendar View** — Monthly & yearly view dengan highlight hari libur
- 🏝️ **Long Weekend Detection** — Auto-detect long weekend (≥3 hari berturut-turut)
- 🎯 **Regional Support** — Hari libur nasional + regional khusus Papua Barat Daya
- 📄 **Surat Edaran** — Link ke dokumen resmi SKB Cuti Bersama
- 🌙 **Dark Mode** — Light/dark theme toggle
- 📥 **Export** — Download kalender sebagai PNG atau PDF
- ⏰ **Timezone Aware** — Support WIB, WITA, WIT

## Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm
- Neon project
- Cloudflare R2 bucket with a public custom domain

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/hari-libur-indo.git
cd hari-libur-indo

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Neon, admin-session, and R2 configuration

# Run development server
npm run dev
```

For the complete provider-by-provider setup, variable scope, CORS policy,
migration procedure, and troubleshooting checklist, see
[ENV_SETUP.md](ENV_SETUP.md).

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Neon Postgres + Drizzle ORM |
| Storage | Cloudflare R2 |
| Auth | Server-only password session |
| Icons | Lucide React |
| Export | html-to-image, jsPDF |

## 🗄️ Database Setup

Generate and apply the versioned Drizzle migrations:

```bash
npm run db:generate
npm run db:migrate
```

The schema contains:

- `regions` — Regional data (Papua Barat Daya)
- `holidays` — Holiday entries (national & regional)
- `documents` — Surat Edaran PDFs, including original documents, revisions, addendums, and cancellations
- `holiday_documents` — Links specific holidays to the document(s) that support them
- `admin_login_attempts` — Durable password-login throttling
- `admin_audit_log` — Shared-admin operational history

Runtime database access uses the pooled `DATABASE_URL`. Migration commands use
the direct `DATABASE_URL_UNPOOLED`.

### Record-only migration

After applying the Drizzle migrations to an empty Neon database, set
`SOURCE_DATABASE_URL` to the existing Postgres database and run the importer in
dry-run mode:

```bash
npm run migrate:records
```

Review the generated, git-ignored `migration-report-*.json`, then apply the same
validated import:

```bash
npm run migrate:records -- --apply
```

The importer preserves region, holiday, document-metadata, and relationship
records only. Existing file URLs are intentionally discarded, previously
published documents become drafts with `missing` storage state, and PDFs must
be uploaded and published again through the admin.

## R2 Setup

Create a bucket-scoped read/write API token and connect a production custom
domain to the bucket. Keep the managed `r2.dev` URL disabled in production.
Configure bucket CORS to allow `PUT` from the application origin.

Admin uploads use five-minute presigned URLs and upload directly to R2, avoiding
Vercel Function payload limits. The server verifies object size, MIME type, and
the PDF signature before a document can be published.

## 🔐 Admin Panel

Access the admin panel at `/admin/login`. Login uses the server-only `PASSWORD`
environment variable and a signed 12-hour `HttpOnly` cookie backed by
`ADMIN_SESSION_SECRET`.

Features:
- 📝 CRUD holidays (single & batch insert)
- 📄 Upload Surat Edaran PDF
- 🔗 Link holidays to exact source/revision/addendum documents
- 🏷️ Assign regional holidays
- 📊 Dashboard overview

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run test:e2e
npm run build
```

Integration tests require `TEST_DATABASE_URL`. Browser tests require
`E2E_BASE_URL` and a configured running application.

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
