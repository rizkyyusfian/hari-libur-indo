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
      className="relative mt-8 sm:mt-10"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="min-w-0 space-y-5 lg:col-span-2 lg:space-y-6">
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

        <aside className="min-w-0 space-y-5 lg:col-span-1 lg:space-y-6" aria-label="Ringkasan dan alat kalender">
          <SummaryCard holidays={holidays} />
          <TimezoneInfo />
          <ExportControls />
        </aside>
      </div>

      {(pending || loadError) && (
        <div className="absolute inset-0 z-40 flex min-h-72 items-start justify-center rounded-2xl bg-background/95 p-4 pt-16 backdrop-blur-sm sm:p-6 sm:pt-20">
          <div
            role={loadError ? 'alert' : 'status'}
            aria-live="polite"
            className={`w-full max-w-md rounded-2xl border p-5 text-center shadow-xl ${
              loadError
                ? 'border-primary/30 bg-surface text-foreground'
                : 'border-info/30 bg-surface text-foreground'
            }`}
          >
            {loadError ? (
              <>
                <span className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-primary/12 text-primary">
                  <AlertCircle size={26} aria-hidden="true" />
                </span>
                <p className="font-extrabold">Data hari libur gagal dimuat</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{loadError}</p>
                <button
                  type="button"
                  onClick={() => void loadYear(requestedYear)}
                  className="focus-ring surface-transition mx-auto mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-white hover:-translate-y-0.5 hover:bg-primary-strong"
                >
                  <RefreshCw size={17} aria-hidden="true" />
                  Coba lagi untuk {requestedYear}
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3 font-bold text-info">
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
