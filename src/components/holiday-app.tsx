'use client';

import { useMemo, useRef, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Calendar } from '@/components/calendar';
import DocumentReference from '@/components/document-reference';
import { ExportControls } from '@/components/export-controls';
import { LongWeekendList } from '@/components/long-weekend-list';
import { SummaryCard } from '@/components/summary-card';
import { TimezoneInfo } from '@/components/timezone-info';
import type { Document } from '@/domain/models';
import { getHolidays, getPublishedDocumentsByYear } from '@/lib/data-client';
import {
  type CalendarHolidaySnapshot,
  toCalendarHolidays,
  toCalendarHolidaySnapshots,
} from '@/lib/public-holiday-view';

interface HolidayAppProps {
  initialYear: number;
  initialMonth: number;
  initialHolidays: CalendarHolidaySnapshot[];
  initialDocuments: Document[];
  initialError?: string;
}

export function HolidayApp({
  initialYear,
  initialMonth,
  initialHolidays,
  initialDocuments,
  initialError,
}: HolidayAppProps) {
  const [holidaySnapshots, setHolidaySnapshots] = useState(initialHolidays);
  const [documents, setDocuments] = useState(initialDocuments);
  const [loadedYear, setLoadedYear] = useState<number | null>(
    initialError ? null : initialYear,
  );
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'year'>('month');
  const [calendarFocusDate, setCalendarFocusDate] = useState(
    () => new Date(initialYear, initialMonth, 1),
  );
  const [showWFHFriday, setShowWFHFriday] = useState(false);
  const [includeFridayInLongWeekend, setIncludeFridayInLongWeekend] = useState(false);
  const [loadingYear, setLoadingYear] = useState<number | null>(null);
  const [loadError, setLoadError] = useState(initialError ?? null);
  const requestSequence = useRef(0);

  const requestedYear = calendarFocusDate.getFullYear();
  const holidays = useMemo(
    () => toCalendarHolidays(holidaySnapshots),
    [holidaySnapshots],
  );

  const loadYear = async (year: number) => {
    const requestId = ++requestSequence.current;
    setLoadingYear(year);
    setLoadError(null);

    try {
      const [nextHolidays, nextDocuments] = await Promise.all([
        getHolidays(year),
        getPublishedDocumentsByYear(year),
      ]);
      if (requestId !== requestSequence.current) return;
      setHolidaySnapshots(toCalendarHolidaySnapshots(nextHolidays));
      setDocuments(nextDocuments);
      setLoadedYear(year);
      setLoadingYear(null);
    } catch (error: unknown) {
      if (requestId !== requestSequence.current) return;
      console.error('Error loading holidays:', error);
      setLoadingYear(null);
      setLoadError(
        error instanceof Error
          ? error.message
          : `Data hari libur ${year} belum dapat dimuat.`,
      );
    }
  };

  const handleFocusDateChange = (date: Date) => {
    setCalendarFocusDate(date);
    const year = date.getFullYear();
    if (year === loadedYear) {
      requestSequence.current += 1;
      setLoadingYear(null);
      setLoadError(null);
      return;
    }
    void loadYear(year);
  };

  const pending = loadingYear !== null;

  return (
    <section
      aria-label="Kalender interaktif hari libur"
      aria-busy={pending}
      className="relative mt-8"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Calendar
            holidays={holidays}
            viewMode={calendarViewMode}
            focusDate={calendarFocusDate}
            onViewModeChange={setCalendarViewMode}
            onFocusDateChange={handleFocusDateChange}
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
          <DocumentReference documents={documents} loading={pending} />
        </div>

        <div className="space-y-6 lg:col-span-1">
          <SummaryCard holidays={holidays} />
          <TimezoneInfo />
          <ExportControls />
        </div>
      </div>

      {(pending || loadError) && (
        <div className="absolute inset-0 z-40 flex min-h-72 items-start justify-center rounded-xl bg-white/95 p-6 pt-16 backdrop-blur-sm dark:bg-slate-950/95">
          <div
            role={loadError ? 'alert' : 'status'}
            aria-live="polite"
            className={`w-full max-w-md rounded-xl border p-5 text-center shadow-lg ${
              loadError
                ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100'
                : 'border-[#669bbc]/30 bg-white text-[#003049] dark:border-slate-700 dark:bg-slate-900 dark:text-white'
            }`}
          >
            {loadError ? (
              <>
                <AlertCircle className="mx-auto mb-3" size={28} aria-hidden="true" />
                <p className="font-semibold">Data hari libur gagal dimuat</p>
                <p className="mt-1 text-sm">{loadError}</p>
                <button
                  type="button"
                  onClick={() => void loadYear(requestedYear)}
                  className="mx-auto mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#003049] px-4 py-2 font-semibold text-white hover:bg-[#164457] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#669bbc] focus-visible:ring-offset-2 dark:bg-[#669bbc] dark:text-slate-950"
                >
                  <RefreshCw size={17} aria-hidden="true" />
                  Coba lagi untuk {requestedYear}
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3 font-semibold">
                <Loader2 className="animate-spin" size={22} aria-hidden="true" />
                Memuat data hari libur {loadingYear}…
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
