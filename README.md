# 🇮🇩 Hari Libur Indo

Kalender hari libur Indonesia dengan dukungan hari libur nasional, cuti
bersama, dan hari libur regional Papua Barat Daya.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Neon](https://img.shields.io/badge/Neon-Postgres-00E599?logo=postgresql)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2-F38020?logo=cloudflare)
![License](https://img.shields.io/badge/License-MIT-blue)

## Overview

Hari Libur Indo menyediakan kalender publik read-only dan panel admin untuk
mengelola data hari libur serta dokumen resmi. Data disimpan di Neon Postgres,
sedangkan PDF Surat Edaran disimpan di Cloudflare R2.

## Features

- Kalender bulanan dan tahunan
- Hari libur nasional, regional, dan cuti bersama
- Deteksi long weekend
- Referensi dokumen resmi
- Export kalender sebagai PNG atau PDF
- Light dan dark mode
- Admin CRUD dan batch input hari libur
- Upload, verifikasi, publish, archive, dan supersede dokumen PDF
- Password-only admin login dengan signed session

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Neon Postgres |
| ORM | Drizzle ORM |
| Storage | Cloudflare R2 |
| Authentication | Server-only password session |
| Testing | Vitest and Playwright |
| Deployment | Vercel |

## Requirements

- Node.js 20 or newer
- npm
- Neon project
- Cloudflare R2 bucket with a public custom domain
- Vercel account for deployment

## Clone and Run Locally

```bash
git clone https://github.com/rizkyyusfian/hari-libur-indo.git
cd hari-libur-indo
npm install
cp .env.example .env.local
```

Complete `.env.local`, then apply the database migrations and start the app:

```bash
npm run db:migrate
npm run dev
```

Open:

- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Add the required variables from `.env.example` in **Project Settings →
   Environment Variables**.
3. Apply the Drizzle migrations to the production Neon database:

   ```bash
   npm run db:migrate
   ```

4. Configure the R2 bucket CORS policy for the production application origin.
5. Deploy the project.
6. Verify the public calendar, admin login, and one PDF upload.

## License

This project is licensed under the [MIT License](LICENSE).

## Author

**Rizky Yusfian**

- Website: [rizkyyusfian.tech](https://rizkyyusfian.tech)
- GitHub: [@rizkyyusfian](https://github.com/rizkyyusfian)
