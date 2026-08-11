import type { Metadata } from 'next';
import { Copyright, Info } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { HolidayApp } from '@/components/holiday-app';
import { PublicHolidayOverview } from '@/components/public-holiday-overview';
import type { Document, Holiday } from '@/domain/models';
import { publicMetadata } from '@/lib/site';
import { toCalendarHolidaySnapshots } from '@/lib/public-holiday-view';
import { webApplicationJsonLd, websiteJsonLd } from '@/lib/structured-data';
import { getPublicYearSnapshot } from '@/server/data/public-site';

export const revalidate = 3600;

const currentPapuaYear = () =>
  Number(
    new Intl.DateTimeFormat('en', {
      year: 'numeric',
      timeZone: 'Asia/Jayapura',
    }).format(new Date()),
  );

const currentPapuaMonth = () =>
  Number(
    new Intl.DateTimeFormat('en', {
      month: 'numeric',
      timeZone: 'Asia/Jayapura',
    }).format(new Date()),
  ) - 1;

export function generateMetadata(): Metadata {
  const year = currentPapuaYear();
  return publicMetadata({
    path: '/',
    title: `Kalender Hari Libur Indonesia ${year} & Papua Barat Daya`,
    description: `Kalender hari libur nasional, cuti bersama, long weekend, dan libur regional Papua Barat Daya tahun ${year} dengan dokumen sumber.`,
  });
}

export default async function Home() {
  const year = currentPapuaYear();
  let holidays: Holiday[] = [];
  let documents: Document[] = [];
  let initialError: string | undefined;

  try {
    const snapshot = await getPublicYearSnapshot(year);
    holidays = snapshot.holidays;
    documents = snapshot.documents;
  } catch (error) {
    console.error('Unable to load the initial public holiday snapshot:', error);
    initialError = `Data hari libur ${year} belum dapat dimuat.`;
  }

  const websiteSchema = JSON.stringify(websiteJsonLd()).replace(/</g, '\\u003c');
  const applicationSchema = JSON.stringify(webApplicationJsonLd(year)).replace(/</g, '\\u003c');

  return (
    <div className="min-h-screen bg-white transition-colors dark:bg-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: applicationSchema }} />
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#58717b] dark:text-[#b7c9d0]">
            Kalender nasional dan Papua Barat Daya
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#003049] dark:text-white sm:text-4xl">
            Kalender Hari Libur Indonesia {year}
          </h1>
          <p className="mt-4 text-base leading-7 text-[#274b5a] dark:text-gray-300 sm:text-lg">
            Periksa hari libur nasional, cuti bersama, libur regional Papua Barat Daya,
            dan rangkaian long weekend. Gunakan tampilan bulanan atau tahunan, lalu unduh
            kalender untuk membantu merencanakan waktu istirahat dan perjalanan.
          </p>
        </header>

        <HolidayApp
          initialYear={year}
          initialMonth={currentPapuaMonth()}
          initialHolidays={toCalendarHolidaySnapshots(holidays)}
          initialDocuments={documents}
          initialError={initialError}
        />

        <PublicHolidayOverview year={year} holidays={holidays} documents={documents} />

        <footer className="mt-12 border-t border-[#003049]/10 pt-8 dark:border-slate-800">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-[#405c68] dark:text-gray-400 sm:flex-row">
            <Link
              href="/about"
              className="flex items-center gap-1 transition hover:text-[#c1121f] dark:hover:text-[#8ecae6]"
            >
              <Info size={14} aria-hidden="true" />
              Tentang dan metodologi
            </Link>
            <div className="text-center">
              <p>Hari Libur Indonesia — Papua Barat Daya</p>
              <p className="mt-1 text-xs">Data kalender untuk tahun {year}</p>
            </div>
            <a
              href="https://rizkyyusfian.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition hover:text-[#c1121f] dark:hover:text-[#8ecae6]"
            >
              <Copyright size={14} aria-hidden="true" />
              MRYY 2026
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
