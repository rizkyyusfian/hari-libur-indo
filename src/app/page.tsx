import type { Metadata } from "next";
import { ArrowUpRight, Copyright, Info } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { HolidayApp } from "@/components/holiday-app";
import type { Document, Holiday } from "@/domain/models";
import { publicMetadata } from "@/lib/site";
import { toCalendarHolidaySnapshots } from "@/lib/public-holiday-view";
import { webApplicationJsonLd, websiteJsonLd } from "@/lib/structured-data";
import { getPublicYearSnapshot } from "@/server/data/public-site";

export const revalidate = 3600;

const currentPapuaYear = () =>
  Number(
    new Intl.DateTimeFormat("en", {
      year: "numeric",
      timeZone: "Asia/Jayapura",
    }).format(new Date()),
  );

const currentPapuaMonth = () =>
  Number(
    new Intl.DateTimeFormat("en", {
      month: "numeric",
      timeZone: "Asia/Jayapura",
    }).format(new Date()),
  ) - 1;

export function generateMetadata(): Metadata {
  const year = currentPapuaYear();
  return publicMetadata({
    path: "/",
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
    console.error("Unable to load the initial public holiday snapshot:", error);
    initialError = `Data hari libur ${year} belum dapat dimuat.`;
  }

  const websiteSchema = JSON.stringify(websiteJsonLd()).replace(
    /</g,
    "\\u003c",
  );
  const applicationSchema = JSON.stringify(webApplicationJsonLd(year)).replace(
    /</g,
    "\\u003c",
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: websiteSchema }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: applicationSchema }}
      />
      <Header />

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <header className="relative w-full overflow-hidden rounded-2xl border border-line bg-surface px-5 py-8 pop-shadow sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="absolute -right-8 -top-12 size-32 rotate-12 rounded-3xl bg-accent/80" aria-hidden="true" />
          <div className="absolute -bottom-16 right-24 size-28 -rotate-12 rounded-full bg-info-soft" aria-hidden="true" />
          <div className="relative">
            <h1 className="max-w-4xl text-balance text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-[3.4rem]">
              Rencanakan hari baikmu, <span className="text-info">lebih awal.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-pretty text-sm leading-6 text-muted sm:text-base sm:leading-7">
              Cek hari libur nasional, cuti bersama, kalender Papua Barat Daya, dan long weekend dalam satu tampilan yang mudah dibaca.
            </p>
          </div>
        </header>

        <HolidayApp
          initialYear={year}
          initialMonth={currentPapuaMonth()}
          initialHolidays={toCalendarHolidaySnapshots(holidays)}
          initialDocuments={documents}
          initialError={initialError}
        />

        <footer className="mt-12 border-t border-line pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
            <Link
              href="/about"
              className="focus-ring surface-transition flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold hover:text-primary"
            >
              <Info size={14} aria-hidden="true" />
              Tentang
            </Link>
            <div className="text-center">
              <p>Hari Libur Indonesia — Papua Barat Daya</p>
              <p className="mt-1 text-xs">Data kalender untuk tahun {year}</p>
            </div>
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
