import type { Metadata } from 'next';
import {
  ArrowLeft,
  ArrowUpRight,
  Code,
  Copyright,
  Github,
  Globe,
  Heart,
  Info,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { publicMetadata } from '@/lib/site';
import { aboutPageJsonLd } from '@/lib/structured-data';

export const metadata: Metadata = publicMetadata({
  path: '/about',
  title: 'Tentang Hari Libur Indo',
  description:
    'Pelajari tujuan, sumber resmi, proses verifikasi, koreksi data, dan pengelola Kalender Hari Libur Indonesia yang berfokus pada Papua Barat Daya.',
});

const sectionTitleClass =
  'flex items-center gap-2 text-xl font-extrabold tracking-[-0.035em] text-foreground';
const bodyClass = 'text-sm leading-7 text-muted sm:text-base';

export default function AboutPage() {
  const jsonLd = aboutPageJsonLd();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Header />

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <article className="mx-auto max-w-4xl">
          <header className="relative overflow-hidden rounded-2xl border border-line bg-surface px-5 py-8 pop-shadow sm:px-8 sm:py-10">
            <div className="absolute -right-10 -top-12 size-32 rotate-12 rounded-3xl bg-primary/15" aria-hidden="true" />
            <div className="absolute -bottom-16 right-16 size-28 rounded-full bg-accent/75" aria-hidden="true" />
            <div className="relative max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Tentang Proyek</p>
              <h1 className="mt-3 text-balance text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl">
                Kalender publik yang dibuat untuk <span className="text-info">rencana nyata.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-sm leading-6 text-muted sm:text-base sm:leading-7">
                Hari Libur Indo merangkum tanggal nasional dan Papua Barat Daya supaya rencana cuti, perjalanan, dan waktu istirahat lebih mudah disusun.
              </p>
            </div>
          </header>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6" aria-labelledby="about-site-title">
              <h2 id="about-site-title" className={sectionTitleClass}>
                <Globe size={20} className="text-info" aria-hidden="true" />
                Tentang Website Ini
              </h2>
              <p className={`${bodyClass} mt-4`}>
                <strong className="text-foreground">Hari Libur Indo</strong> adalah side project yang nunjukin kalender hari libur nasional + regional Indonesia, fokus ke wilayah Papua Barat Daya. Simple tapi powerful.
              </p>
              <p className={`${bodyClass} mt-4 font-semibold text-foreground`}>Fitur-fitur yang ada:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted marker:text-primary sm:text-base">
                <li>Kalender interaktif dalam tampilan bulanan dan tahunan</li>
                <li>Daftar long weekend untuk planning liburan</li>
                <li>Ekspor kalender ke PDF atau gambar</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-line bg-surface-subtle p-5 sm:p-6" aria-labelledby="origin-title">
              <h2 id="origin-title" className={sectionTitleClass}>
                <Heart size={20} className="text-primary" aria-hidden="true" />
                Kenapa Bikin Ini?
              </h2>
              <p className={`${bodyClass} mt-4`}>
                Jadi gini, project ini lahir pas lagi gabut mudik lebaran Idul Fitri 2026 (1447H). Trigger utamanya? Pusing mikirin kapan waktu yang pas buat ambil cuti biar dapet long weekend maksimal. Jadinya ya bikin aja tool yang bisa bantu planning liburan dengan lebih proper.
              </p>
            </section>
          </div>

          <section className="mt-5 overflow-hidden rounded-2xl border border-[#d5b92b] bg-accent text-[#10243e]" aria-labelledby="pbd-title">
            <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-[auto_1fr] md:items-start">
              <span className="grid size-12 place-items-center rounded-xl bg-[#10243e] text-white">
                <MapPin size={22} aria-hidden="true" />
              </span>
              <div>
                <h2 id="pbd-title" className="text-xl font-extrabold tracking-[-0.035em]">Kenapa Papua Barat Daya?</h2>
                <p className="mt-3 text-sm leading-7 text-[#10243e]/80 sm:text-base">
                  Simple, karena pas bikin web ini (2026) gue lagi stay di Papua Barat Daya. Plus, banyak libur fakultatif khusus daerah sini yang sering gak ke-track di kalender nasional — kayak HUT Provinsi Papua Barat Daya (8 Desember) dan beberapa hari libur keagamaan. Sayang kan kalau missed.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-line bg-surface p-5 sm:p-7" aria-labelledby="sources-title">
            <h2 id="sources-title" className={sectionTitleClass}>
              <Info size={20} className="text-info" aria-hidden="true" />
              Sumber Data dan Verifikasi
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 md:gap-6">
              <p className={bodyClass}>
                Kalender disusun dari dokumen publik yang dicatat dalam aplikasi, termasuk keputusan atau surat edaran hari libur nasional, cuti bersama, dan ketentuan regional Papua Barat Daya. Tautan dokumen sumber ditampilkan pada daftar hari libur agar pengunjung dapat memeriksa dasar setiap tanggal secara langsung.
              </p>
              <p className={bodyClass}>
                Data diperiksa kembali ketika ada dokumen baru, perubahan resmi, atau laporan koreksi. Tidak ada jadwal pembaruan tetap dan hubungan antara tanggal dengan dokumen tidak diubah secara otomatis. Jika dua sumber berbeda, dokumen yang lebih baru dan paling spesifik terhadap wilayah menjadi bahan peninjauan sebelum tampilan kalender diperbarui.
              </p>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-primary/30 bg-primary/6 p-5 sm:p-7" aria-labelledby="corrections-title">
            <h2 id="corrections-title" className={sectionTitleClass}>
              <Github size={20} className="text-primary" aria-hidden="true" />
              Koreksi dan Batas Penggunaan
            </h2>
            <div className="mt-4 space-y-4">
              <p className={bodyClass}>
                Menemukan tanggal, nama hari libur, wilayah, atau tautan sumber yang keliru? Laporkan melalui{' '}
                <a
                  href="https://github.com/rizkyyusfian/hari-libur-indo/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex items-center gap-1 rounded font-bold text-info underline decoration-info/40 underline-offset-4 hover:decoration-info"
                >
                  GitHub Issues
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>{' '}
                dengan menyertakan tahun, wilayah, bagian yang perlu diperbaiki, dan tautan dokumen pendukung. Laporan ditinjau oleh pengelola proyek sebelum data publik diubah.
              </p>
              <p className={bodyClass}>
                Situs ini merupakan alat perencanaan independen, bukan situs resmi pemerintah dan bukan pengganti dokumen instansi penerbit. Untuk keputusan perjalanan, layanan kantor, atau kewajiban kerja, selalu cocokkan kembali informasi dengan dokumen sumber dan pengumuman instansi terkait.
              </p>
            </div>
          </section>

          <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-[#10243e] text-white dark:bg-[#202022]" aria-labelledby="open-source-title">
            <div className="p-5 sm:p-7">
              <h2 id="open-source-title" className="flex items-center gap-2 text-xl font-extrabold tracking-[-0.035em]">
                <Code size={20} className="text-accent" aria-hidden="true" />
                Open Source & Author
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/75 sm:text-base">
                Project ini 95% vibe coding sambil nunggu buka puasa, 5% sisanya buat polishing doang. Built with modern tech stack:
              </p>
              <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm text-white/75 marker:text-accent sm:grid-cols-2 sm:text-base">
                <li>Copilot CLI (AI-assisted dev ftw)</li>
                <li>Next.js 16</li>
                <li>Tailwind CSS v4</li>
                <li>Neon Postgres + Cloudflare R2</li>
              </ul>
              <p className="mt-6 border-t border-white/15 pt-6 text-sm leading-7 text-white/75 sm:text-base">
                Made by <strong className="text-white">Rizky Yusfian</strong> — Software Engineer yang lagi pivoting ke DevOps & networking karena AI makin jago ngoding. Adaptasi atau punah, kan?
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://github.com/rizkyyusfian/hari-libur-indo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring surface-transition inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:-translate-y-0.5 hover:bg-primary-strong"
                >
                  <Github size={18} aria-hidden="true" />
                  GitHub Repo
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
                <a
                  href="https://rizkyyusfian.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring surface-transition inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-2 text-sm font-bold text-white hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <Globe size={18} aria-hidden="true" />
                  rizkyyusfian.tech
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </article>

        <footer className="mt-12 border-t border-line pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
            <Link href="/" className="focus-ring surface-transition flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold hover:text-primary">
              <ArrowLeft size={14} aria-hidden="true" />
              Beranda
            </Link>
            <p className="text-center">Hari Libur Indonesia — Papua Barat Daya</p>
            <a
              href="https://rizkyyusfian.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring surface-transition inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold hover:text-primary"
            >
              <Copyright size={14} aria-hidden="true" />
              MRYY 2026
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
