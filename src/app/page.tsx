'use client';

import { useCallback, useEffect, useState } from 'react';
import { Copyright, Info } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { SummaryCard } from '@/components/summary-card';
import { Calendar } from '@/components/calendar';
import { LongWeekendList } from '@/components/long-weekend-list';
import { ExportControls } from '@/components/export-controls';
import { TimezoneInfo } from '@/components/timezone-info';
import DocumentReference from '@/components/document-reference';
import { getHolidays } from '@/lib/supabase-queries';
import { Holiday } from '@/lib/date-utils';
import { useMounted } from '@/lib/use-mounted';

export default function Home() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const mounted = useMounted();
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'year'>('month');
  const [calendarFocusDate, setCalendarFocusDate] = useState(new Date());
  const [showWFHFriday, setShowWFHFriday] = useState(false);
  const [includeFridayInLongWeekend, setIncludeFridayInLongWeekend] = useState(false);
  const currentYear = new Date().getFullYear();

  const loadHolidays = useCallback(async () => {
    try {
      const data = await getHolidays(currentYear);
      // Transform Supabase data to Holiday format
      const parsedHolidays: Holiday[] = data.map(h => ({
        id: h.id,
        date: new Date(h.date),
        name: h.name,
        type: h.type as 'national' | 'regional',
        region: h.region?.code || undefined,
        isCutiBersama: h.is_cuti_bersama,
        sourceDocuments: h.holiday_documents
          ?.map(link => link.document)
          .filter((document): document is NonNullable<typeof document> => Boolean(document))
          .map(document => ({
            id: document.id,
            title: document.title,
            fileUrl: document.file_url,
            type: document.type,
            documentKind: document.document_kind,
          })),
      }));
      setHolidays(parsedHolidays);
    } catch (error) {
      console.error('Error loading holidays:', error);
      setHolidays([]);
    }
  }, [currentYear]);

  useEffect(() => {
    // Data is loaded client-side because the Supabase browser client owns this request.
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
