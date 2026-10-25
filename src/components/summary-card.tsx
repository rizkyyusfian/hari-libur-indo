'use client';

import { Holiday, LongWeekend, getNextOffPeriod } from '@/lib/date-utils';
import { ArrowRight, CalendarDays, Clock } from 'lucide-react';

interface SummaryCardProps {
  holidays: Holiday[];
}

export function SummaryCard({ holidays }: SummaryCardProps) {
  const today = new Date();
  const todayHoliday = holidays.find(h => h.date.toDateString() === today.toDateString());
  const nextOffPeriod = getNextOffPeriod(today, holidays);
  const nextOffDetails = nextOffPeriod?.details;
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;

  // Count remaining holidays this year
  const remainingHolidays = holidays.filter(h => h.date > today).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface pop-shadow" aria-labelledby="today-summary-title">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
            Hari Ini
          </p>
          <h2 id="today-summary-title" className="mt-2 text-pretty text-xl font-extrabold leading-tight tracking-[-0.035em] text-foreground">
            {todayHoliday 
              ? todayHoliday.name 
              : isWeekend 
                ? 'Akhir Pekan' 
                : 'Hari Kerja'}
          </h2>
          {todayHoliday && (
            <span className={`mt-2 inline-block rounded-md px-2 py-1 text-xs font-bold ${
              todayHoliday.isCutiBersama 
                ? 'bg-primary/15 text-primary' 
                : 'bg-info-soft text-info'
            }`}>
              {todayHoliday.isCutiBersama ? 'Cuti Bersama' : todayHoliday.type === 'national' ? 'Libur Nasional' : 'Libur Regional'}
            </span>
          )}
        </div>
        <div className={`grid size-12 shrink-0 place-items-center rounded-xl ${
          todayHoliday || isWeekend 
            ? 'bg-primary/12 text-primary' 
            : 'bg-info-soft text-info'
        }`}>
          <CalendarDays size={24} aria-hidden="true" />
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-line">
        <div className="min-w-0 border-r border-line p-4">
          <p className="text-xs font-semibold text-muted">
            {nextOffPeriod?.type === 'long-weekend' ? 'Long Weekend' : 'Libur Berikutnya'}
          </p>
          {nextOffPeriod ? (
            <>
              <p className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-foreground">
                {nextOffPeriod.type === 'long-weekend'
                  ? `${(nextOffDetails as LongWeekend).length} hari`
                  : (nextOffDetails as Holiday).name}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted">
                <Clock size={13} aria-hidden="true" />
                <span>{nextOffPeriod.daysUntil} hari lagi</span>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">Belum ada</p>
          )}
        </div>

        <div className="min-w-0 p-4">
          <p className="text-xs font-semibold text-muted">Sisa Libur Tahun Ini</p>
          <p className="mt-2 text-3xl font-black tabular-nums tracking-[-0.04em] text-foreground">
            {remainingHolidays}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted"><ArrowRight size={13} aria-hidden="true" /> hari libur</p>
        </div>
      </div>
    </section>
  );
}
