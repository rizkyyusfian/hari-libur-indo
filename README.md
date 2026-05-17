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

## Quick Start

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

## 🗄️ Database Setup

Run the SQL in `supabase-schema.sql` to create tables:

- `regions` — Regional data (Papua Barat Daya)
- `holidays` — Holiday entries (national & regional)
- `documents` — Surat Edaran PDFs, including original documents, revisions, addendums, and cancellations
- `holiday_documents` — Links specific holidays to the document(s) that support them

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
