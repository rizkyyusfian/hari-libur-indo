'use client';

import { Holiday, detectLongWeekends, formatDateIndonesian, isHoliday, isWeekend, getDayNameIndonesian } from '@/lib/date-utils';
import { Calendar, ExternalLink } from 'lucide-react';
import { addDays } from 'date-fns';

interface LongWeekendListProps {
  holidays: Holiday[];
  viewMode: 'month' | 'year';
  focusDate: Date;
  includeFridayInLongWeekend: boolean;
  onIncludeFridayInLongWeekendChange: (enabled: boolean) => void;
}

interface DayDetail {
  date: Date;
  dayName: string;
  info: string;
  isRegional?: boolean;
  sourceDocuments?: Holiday['sourceDocuments'];
}

export function LongWeekendList({
  holidays,
  viewMode,
  focusDate,
  includeFridayInLongWeekend,
  onIncludeFridayInLongWeekendChange,
}: LongWeekendListProps) {
  const currentYear = focusDate.getFullYear();
  const allLongWeekends = detectLongWeekends(holidays, currentYear, undefined, {
    includeFridayAsOffDay: includeFridayInLongWeekend,
  });
  const monthStart = new Date(currentYear, focusDate.getMonth(), 1);
  const monthEnd = new Date(currentYear, focusDate.getMonth() + 1, 0);
  const longWeekends = viewMode === 'month'
    ? allLongWeekends.filter(lw => lw.start <= monthEnd && lw.end >= monthStart)
    : allLongWeekends;
  // Get all days in a long weekend period with details
  const getDaysInPeriod = (start: Date, end: Date): DayDetail[] => {
    const days: DayDetail[] = [];
    let current = new Date(start);
    
    while (current <= end) {
      const holiday = isHoliday(current, holidays);
      const weekend = isWeekend(current);
      const dayName = getDayNameIndonesian(current);
      
      let info = '';
      let isRegional = false;
      if (holiday) {
        info = holiday.name;
        isRegional = holiday.type === 'regional';
      } else if (weekend) {
        info = current.getDay() === 0 ? 'Minggu' : 'Sabtu';
      } else if (includeFridayInLongWeekend && current.getDay() === 5) {
        info = 'Jumat';
      }
      
      days.push({
        date: new Date(current),
        dayName,
        info,
        isRegional,
        sourceDocuments: holiday?.sourceDocuments,
      });
      
      current = addDays(current, 1);
    }
    
    return days;
  };

  const getPrimaryRegionalSource = (documents?: Holiday['sourceDocuments']) =>
    documents?.find(d => d.documentKind === 'addendum') ||
    documents?.find(d => d.documentKind === 'revision') ||
    documents?.find(d => d.documentKind === 'cancellation') ||
    documents?.[0];

  const PBDBadge = ({ day }: { day: DayDetail }) => {
    if (!day.isRegional) {
      return null;
    }

    const source = getPrimaryRegionalSource(day.sourceDocuments);
    const label =
      source?.documentKind === 'addendum'
        ? 'Tambahan'
        : source?.documentKind === 'revision'
          ? 'Revisi'
          : source?.documentKind === 'cancellation'
            ? 'Pembatalan'
            : 'PBD';
    const href = source?.fileUrl;
    const title = source?.title || 'Dokumen PBD';

    if (href) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring surface-transition inline-flex items-center gap-1 rounded-md bg-info-soft px-2 py-1 text-[11px] font-bold text-info hover:bg-info/20"
          title={title}
        >
          {label}
          <ExternalLink size={11} aria-hidden="true" />
        </a>
      );
    }

    return (
      <span className="rounded-md bg-info-soft px-2 py-1 text-[11px] font-bold text-info">
        {label}
      </span>
    );
  };

  if (longWeekends.length === 0) {
    return (
      <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5" aria-labelledby="long-weekend-empty-title">
        <div className="mb-4 flex flex-col gap-3 min-[520px]:flex-row min-[520px]:items-center">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-info-soft text-info"><Calendar size={18} aria-hidden="true" /></span>
            <h2 id="long-weekend-empty-title" className="font-extrabold tracking-[-0.025em] text-foreground">Long Weekend</h2>
          </div>
          <button
            type="button"
            onClick={() => onIncludeFridayInLongWeekendChange(!includeFridayInLongWeekend)}
            aria-pressed={includeFridayInLongWeekend}
            className={`focus-ring surface-transition min-h-11 rounded-xl border px-3 py-2 text-xs font-bold min-[520px]:ml-auto ${
              includeFridayInLongWeekend
                ? 'border-accent bg-accent text-ink'
                : 'border-line bg-surface text-muted hover:border-accent hover:text-foreground'
            }`}
          >
            Hitung Hari Jumat: {includeFridayInLongWeekend ? 'Aktif' : 'Nonaktif'}
          </button>
        </div>
        <div className="rounded-xl bg-surface-subtle px-4 py-8 text-center">
          <p className="text-sm font-bold text-foreground">
            {viewMode === 'month'
              ? 'Belum ada long weekend pada bulan ini.'
              : 'Belum ada long weekend pada tahun ini.'}
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted">Coba periode lain atau aktifkan perhitungan hari Jumat untuk melihat kemungkinan waktu rehat yang lebih panjang.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5" aria-labelledby="long-weekend-title">
      <div className="mb-5 flex flex-col gap-3 min-[520px]:flex-row min-[520px]:items-center">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-info-soft text-info"><Calendar size={18} aria-hidden="true" /></span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-muted">Waktu Rehat</p>
            <h2 id="long-weekend-title" className="font-extrabold tracking-[-0.025em] text-foreground">
              Long Weekend <span className="text-muted">({longWeekends.length})</span>
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onIncludeFridayInLongWeekendChange(!includeFridayInLongWeekend)}
          aria-pressed={includeFridayInLongWeekend}
          className={`focus-ring surface-transition min-h-11 rounded-xl border px-3 py-2 text-xs font-bold min-[520px]:ml-auto ${
            includeFridayInLongWeekend
              ? 'border-accent bg-accent text-ink'
              : 'border-line bg-surface text-muted hover:border-accent hover:text-foreground'
          }`}
        >
          Hitung Hari Jumat: {includeFridayInLongWeekend ? 'Aktif' : 'Nonaktif'}
        </button>
      </div>

      <div className="space-y-4">
        {longWeekends.map((lw, idx) => {
          const days = getDaysInPeriod(lw.start, lw.end);
          const monthYear = lw.start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
          
          return (
            <article key={idx} className={`overflow-hidden rounded-2xl border ${idx === 0 ? 'border-primary/35 shadow-[3px_4px_0_var(--line)]' : 'border-line'}`}>
              {/* Header */}
              <div className="bg-panel-inverse px-4 py-3 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-extrabold capitalize">
                    {monthYear}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-extrabold text-inherit">
                    {lw.length} hari
                  </span>
                </div>
              </div>
              
              {/* Table */}
              <div className="overflow-x-auto overscroll-x-contain">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="bg-surface-subtle">
                      <th className="w-36 px-4 py-2.5 text-left text-xs font-extrabold text-muted">Tanggal</th>
                      <th className="w-24 px-4 py-2.5 text-left text-xs font-extrabold text-muted">Hari</th>
                      <th className="px-4 py-2.5 text-left text-xs font-extrabold text-muted">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, dayIdx) => (
                      <tr 
                        key={dayIdx} 
                        className={`border-t border-line ${
                          isHoliday(day.date, holidays) 
                            ? 'bg-primary/6' 
                            : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold tabular-nums text-foreground">
                          {formatDateIndonesian(day.date)}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {day.dayName}
                        </td>
                        <td className={`px-4 py-3 ${
                          isHoliday(day.date, holidays) 
                            ? 'font-bold text-primary'
                            : 'text-muted'
                        }`}>
                          <span className="flex items-center gap-1.5 break-words">
                            {day.info}
                            <PBDBadge day={day} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
      </div>

    </section>
  );
}
