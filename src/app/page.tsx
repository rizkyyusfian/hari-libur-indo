'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Copyright, Info, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { SummaryCard } from '@/components/summary-card';
import { Calendar } from '@/components/calendar';
import { LongWeekendList } from '@/components/long-weekend-list';
import { ExportControls } from '@/components/export-controls';
import { TimezoneInfo } from '@/components/timezone-info';
import DocumentReference from '@/components/document-reference';
import { getHolidays } from '@/lib/data-client';
import { Holiday } from '@/lib/date-utils';
import { useMounted } from '@/lib/use-mounted';

export default function Home() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mounted = useMounted();
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'year'>('month');
  const [calendarFocusDate, setCalendarFocusDate] = useState(new Date());
  const [showWFHFriday, setShowWFHFriday] = useState(false);
  const [includeFridayInLongWeekend, setIncludeFridayInLongWeekend] = useState(false);
  const currentYear = calendarFocusDate.getFullYear();

  const loadHolidays = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await getHolidays(currentYear);
      // Transform API data to the calendar domain format.
      const parsedHolidays: Holiday[] = data.map(h => ({
        id: h.id,
        date: new Date(h.date),
        name: h.name,
        type: h.type as 'national' | 'regional',
        region: h.region?.code || undefined,
        isCutiBersama: h.is_cuti_bersama,
        sourceDocuments: h.holiday_documents
          ?.map(link => link.document)
          .filter(
            (document): document is NonNullable<typeof document> =>
              Boolean(document?.file_url),
          )
          .map(document => ({
            id: document.id,
            title: document.title,
            fileUrl: document.file_url!,
            type: document.type,
            documentKind: document.document_kind,
          })),
      }));
      setHolidays(parsedHolidays);
    } catch (error) {
      console.error('Error loading holidays:', error);
      setHolidays([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Data hari libur belum dapat dimuat.',
      );
    }
  }, [currentYear]);

  useEffect(() => {
    // Year navigation loads through the read-only application API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHolidays();
  }, [loadHolidays]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {loadError && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="font-medium">Data hari libur gagal dimuat</p>
                    <p className="mt-0.5 text-red-700 dark:text-red-300">{loadError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={loadHolidays}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-3 py-2 font-medium text-red-800 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 dark:border-red-800 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900"
                >
                  <RefreshCw size={16} />
                  Coba lagi
                </button>
              </div>
            )}
            <Calendar
              holidays={holidays}
              viewMode={calendarViewMode}
              focusDate={calendarFocusDate}
              onViewModeChange={setCalendarViewMode}
              onFocusDateChange={setCalendarFocusDate}
              showWFHFriday={showWFHFriday}
              onShowWFHFridayChange={setShowWFHFriday}
            />
            <LongWeekendList
              holidays={holidays}
              viewMode={calendarViewMode}
              focusDate={calendarFocusDate}
              includeFridayInLongWeekend={includeFridayInLongWeekend}
              onIncludeFridayInLongWeekendChange={setIncludeFridayInLongWeekend}
            />
            <DocumentReference year={currentYear} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <SummaryCard holidays={holidays} />
            <TimezoneInfo />
            <ExportControls />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-[#003049]/10 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[#003049]/70 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <Link 
                href="/about" 
                className="flex items-center gap-1 hover:text-[#c1121f] dark:hover:text-[#669bbc] transition"
              >
                <Info size={14} />
                <span>Tentang</span>
              </Link>
            </div>
            <div className="text-center">
              <p>Hari Libur Indonesia - Papua Barat Daya</p>
              <p className="text-xs mt-1">Data libur diperbarui untuk tahun {currentYear}</p>
            </div>
            <a
              href="https://rizkyyusfian.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#c1121f] dark:hover:text-[#669bbc] transition"
            >
              <Copyright size={14} />
              <span>MRYY 2026</span>
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
