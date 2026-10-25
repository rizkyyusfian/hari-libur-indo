'use client';

import { useState } from 'react';
import { Holiday, isHoliday, isWeekend, formatDateIndonesian, formatDateISO } from '@/lib/date-utils';
import { ChevronLeft, ChevronRight, CalendarDays, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';

interface CalendarProps {
  holidays: Holiday[];
  viewMode: 'month' | 'year';
  focusDate: Date;
  onViewModeChange: (mode: 'month' | 'year') => void;
  onFocusDateChange: (date: Date) => void;
  showWFHFriday: boolean;
  onShowWFHFridayChange: (enabled: boolean) => void;
}

export function Calendar({
  holidays,
  viewMode,
  focusDate,
  onViewModeChange,
  onFocusDateChange,
  showWFHFriday,
  onShowWFHFridayChange,
}: CalendarProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const getPrimaryRegionalSource = (holiday: Holiday) =>
    holiday.sourceDocuments?.find(d => d.documentKind === 'addendum') ||
    holiday.sourceDocuments?.find(d => d.documentKind === 'revision') ||
    holiday.sourceDocuments?.find(d => d.documentKind === 'cancellation') ||
    holiday.sourceDocuments?.[0];

  const PBDBadge = ({ holiday }: { holiday: Holiday }) => {
    if (holiday.type !== 'regional') {
      return null;
    }

    const source = getPrimaryRegionalSource(holiday);
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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    onFocusDateChange(new Date(focusDate.getFullYear(), focusDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    onFocusDateChange(new Date(focusDate.getFullYear(), focusDate.getMonth() + 1, 1));
  };

  const prevYear = () => {
    onFocusDateChange(new Date(focusDate.getFullYear() - 1, focusDate.getMonth(), 1));
  };

  const nextYear = () => {
    onFocusDateChange(new Date(focusDate.getFullYear() + 1, focusDate.getMonth(), 1));
  };

  const backToToday = () => {
    onFocusDateChange(new Date());
    onViewModeChange('month');
  };

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const today = new Date();

  // Get day class based on holiday/weekend status
  const getDayClasses = (date: Date) => {
    const holiday = isHoliday(date, holidays);
    const weekend = isWeekend(date);
    const fridayWFH = showWFHFriday && date.getDay() === 5;
    const isToday = date.toDateString() === today.toDateString();

    let bgClass = 'bg-surface';
    let textClass = 'text-foreground';
    let borderClass = 'border border-line/65';

    if (isToday) {
      bgClass = 'bg-info';
      textClass = 'text-white font-extrabold';
      borderClass = 'border border-white/70 ring-2 ring-info/30';
    } else if (holiday) {
      if (holiday.isCutiBersama) {
        // Cuti Bersama - lighter/faded red
        bgClass = 'bg-primary/12';
        textClass = 'text-primary font-extrabold';
        borderClass = 'border border-primary/35 border-dashed';
      } else {
        // Regular holiday - darker red
        bgClass = 'bg-primary';
        textClass = 'text-white font-extrabold';
        borderClass = 'border border-primary';
      }
    } else if (weekend) {
      // Weekend - red font only (no border)
      bgClass = 'bg-surface-subtle';
      textClass = 'text-primary font-bold';
      borderClass = 'border border-line/65';
    } else if (fridayWFH) {
      bgClass = 'bg-info-soft';
      textClass = 'text-info font-bold';
      borderClass = 'border border-info/40';
    }

    return { bgClass, textClass, borderClass };
  };

  const showDatePopover = (date: Date, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setPopoverPosition({ x: rect.left + rect.width / 2, y: rect.bottom });
    setHoveredDate(date);
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  // Render single month
  const renderMonth = (monthDate: Date, compact = false) => {
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    const days: Array<Date | null> = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), i));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    const weeks = Array.from({ length: days.length / 7 }, (_, weekIndex) =>
      days.slice(weekIndex * 7, weekIndex * 7 + 7),
    );

    const monthName = monthDate.toLocaleDateString('id-ID', { month: 'long' });

    return (
      <div className={compact ? '' : ''}>
        {compact && (
          <h4 className="mb-2 text-center text-sm font-extrabold capitalize text-foreground">
            {monthName}
          </h4>
        )}
        <div
          className={`grid grid-cols-7 ${compact ? 'gap-0.5' : 'gap-1'}`}
          role="grid"
          aria-label={`Kalender ${monthName} ${monthDate.getFullYear()}`}
        >
          <div role="row" className="contents">
            {dayNames.map(day => (
              <div
                key={day}
                role="columnheader"
                className={`text-center font-extrabold uppercase tracking-wide text-muted ${compact ? 'py-1 text-[10px]' : 'py-2 text-[11px] sm:text-xs'}`}
              >
                {compact ? day.charAt(0) : day}
              </div>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} role="row" className="contents">
              {week.map((date, dayIndex) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${weekIndex}-${dayIndex}`}
                      role="gridcell"
                      aria-hidden="true"
                      className="aspect-square"
                    />
                  );
                }

                const { bgClass, textClass, borderClass } = getDayClasses(date);
                const holiday = isHoliday(date, holidays);

                return (
                  <button
                    type="button"
                    key={formatDateISO(date)}
                    role="gridcell"
                    className={`${compact ? 'aspect-square text-[11px]' : 'aspect-square text-xs sm:text-sm'} focus-ring surface-transition flex cursor-pointer items-center justify-center rounded-lg ${bgClass} ${textClass} ${borderClass} hover:-translate-y-0.5 hover:border-info hover:shadow-sm`}
                    onMouseEnter={(event) => showDatePopover(date, event.currentTarget)}
                    onMouseLeave={handleMouseLeave}
                    onFocus={(event) => showDatePopover(date, event.currentTarget)}
                    onBlur={handleMouseLeave}
                    aria-current={date.toDateString() === today.toDateString() ? 'date' : undefined}
                    aria-label={`${date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${holiday ? `, ${holiday.name}${holiday.isCutiBersama ? ', cuti bersama' : ''}` : showWFHFriday && date.getDay() === 5 ? ', WFH Jumat' : ''}`}
                    title={holiday?.name || (showWFHFriday && date.getDay() === 5 ? 'WFH Jumat' : '')}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get holidays for current month (monthly view)
  const monthHolidays = holidays.filter(h => {
    return h.date.getMonth() === focusDate.getMonth() && 
           h.date.getFullYear() === focusDate.getFullYear();
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  // Get holidays for current year (yearly view)
  const yearHolidays = holidays.filter(h => {
    return h.date.getFullYear() === focusDate.getFullYear();
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <section id="calendar-export" className="relative overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-[0_18px_45px_rgba(16,36,62,0.08)]">
      {/* Header */}
      <div className="-mx-4 -mt-4 mb-5 flex flex-col gap-4 bg-panel-inverse p-4 text-white sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold capitalize tracking-[-0.035em] text-white sm:text-2xl">
            {viewMode === 'month' 
              ? focusDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
              : focusDate.getFullYear()}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2 min-[460px]:flex min-[460px]:flex-wrap min-[460px]:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => onShowWFHFridayChange(!showWFHFriday)}
            aria-pressed={showWFHFriday}
            aria-label={`${showWFHFriday ? 'Sembunyikan' : 'Tampilkan'} WFH setiap Jumat`}
            className={`focus-ring surface-transition min-h-11 rounded-xl border px-3 py-2 text-xs font-bold ${
              showWFHFriday
                ? 'border-accent bg-accent text-ink'
                : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Tampilkan WFH setiap Jumat"
          >
            WFH Jumat: {showWFHFriday ? 'Aktif' : 'Nonaktif'}
          </button>
          <button
            type="button"
            onClick={backToToday}
            className="focus-ring surface-transition min-h-11 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
            title="Kembali ke tanggal hari ini"
          >
            Hari Ini
          </button>
          {/* View toggle */}
          <div className="col-span-2 flex rounded-xl bg-black/20 p-1 min-[460px]:col-span-1">
            <button
              type="button"
              onClick={() => onViewModeChange('month')}
              aria-label="Gunakan tampilan bulanan"
              aria-pressed={viewMode === 'month'}
              className={`focus-ring surface-transition inline-flex size-11 items-center justify-center rounded-lg ${viewMode === 'month' ? 'bg-white text-ink shadow-sm' : 'text-white hover:bg-white/15'}`}
              title="Tampilan Bulanan"
            >
              <CalendarIcon size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('year')}
              aria-label="Gunakan tampilan tahunan"
              aria-pressed={viewMode === 'year'}
              className={`focus-ring surface-transition inline-flex size-11 items-center justify-center rounded-lg ${viewMode === 'year' ? 'bg-white text-ink shadow-sm' : 'text-white hover:bg-white/15'}`}
              title="Tampilan Tahunan"
            >
              <CalendarDays size={17} aria-hidden="true" />
            </button>
          </div>
          {/* Navigation */}
          <button 
            type="button"
            onClick={viewMode === 'month' ? prevMonth : prevYear} 
            aria-label={viewMode === 'month' ? 'Bulan sebelumnya' : 'Tahun sebelumnya'}
            className="focus-ring surface-transition inline-flex size-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={viewMode === 'month' ? nextMonth : nextYear} 
            aria-label={viewMode === 'month' ? 'Bulan berikutnya' : 'Tahun berikutnya'}
            className="focus-ring surface-transition inline-flex size-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'month' ? (
        <>
          {renderMonth(focusDate)}
          
          {/* Legend */}
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-3 border-t border-line pt-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted">
              <div className="size-4 rounded-md bg-primary" aria-hidden="true" />
              <span>Libur</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="size-4 rounded-md border border-dashed border-primary/50 bg-primary/12" aria-hidden="true" />
              <span className="text-muted">Cuti Bersama</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="size-4 rounded-md border border-line bg-surface-subtle" aria-hidden="true" />
              <span className="text-muted">Akhir Pekan</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="size-4 rounded-md bg-info ring-2 ring-info/25" aria-hidden="true" />
              <span className="text-muted">Hari Ini</span>
            </div>
          </div>

          {/* Month Holidays List */}
          {monthHolidays.length > 0 && (
            <div className="mt-5 border-t border-line pt-5">
              <h3 className="mb-3 text-sm font-extrabold text-foreground">
                Hari Libur Bulan Ini ({monthHolidays.length})
              </h3>
              <div className="space-y-2">
                {monthHolidays.map((holiday, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      holiday.isCutiBersama 
                        ? 'border-primary/25 bg-primary/8' 
                        : 'border-primary/25 bg-surface-subtle'
                    }`}
                  >
                    <div className={`flex size-11 shrink-0 flex-col items-center justify-center rounded-xl ${
                      holiday.isCutiBersama ? 'border border-dashed border-primary/40 bg-primary/12 text-primary' : 'bg-primary text-white'
                    }`}>
                      <span className="text-xs font-medium leading-none">
                        {holiday.date.toLocaleDateString('id-ID', { weekday: 'short' })}
                      </span>
                      <span className="text-sm font-bold leading-none">
                        {holiday.date.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="min-w-0 break-words text-sm font-bold text-foreground">
                          {holiday.name}
                        </p>
                        <PBDBadge holiday={holiday} />
                      </div>
                      <p className="mt-1 text-xs font-medium text-muted">
                        {formatDateIndonesian(holiday.date)}
                        {holiday.isCutiBersama && ' • Cuti Bersama'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monthHolidays.length === 0 && (
            <div className="mt-5 border-t border-line pt-5">
              <div className="rounded-xl bg-info-soft px-4 py-5 text-center">
                <p className="text-sm font-bold text-foreground">Bulan ini tidak memiliki hari libur tercatat.</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">Data berhasil dimuat. Coba bulan lain untuk melihat jadwal berikutnya.</p>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Yearly View - 4x3 grid */
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface-subtle/45 p-3">
                {renderMonth(new Date(focusDate.getFullYear(), i, 1), true)}
              </div>
            ))}
          </div>

          {/* Yearly Holiday List */}
          {yearHolidays.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <h3 className="mb-3 text-sm font-extrabold text-foreground">
                Daftar Hari Libur Tahun {focusDate.getFullYear()} ({yearHolidays.length})
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {yearHolidays.map((holiday, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 ${
                      holiday.isCutiBersama 
                        ? 'border-primary/25 bg-primary/8' 
                        : 'border-line bg-surface-subtle/50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded flex flex-col items-center justify-center text-xs ${
                      holiday.isCutiBersama ? 'bg-primary/15 text-primary' : 'bg-primary text-white'
                    }`}>
                      <span className="font-bold leading-none">
                        {holiday.date.getDate()}
                      </span>
                      <span className="text-[11px] leading-none">
                        {holiday.date.toLocaleDateString('id-ID', { month: 'short' }).slice(0, 3)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-2 text-xs font-bold text-foreground">
                        {holiday.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {holiday.isCutiBersama && (
                          <span className="text-[11px] font-semibold text-primary">Cuti Bersama</span>
                        )}
                        <PBDBadge holiday={holiday} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Popover */}
      {hoveredDate && (
        <div 
          className="pointer-events-none fixed z-50 min-w-[200px] max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-3 shadow-xl"
          style={{
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y + 8}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <p className="text-sm font-extrabold text-foreground">
            {hoveredDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {(() => {
            const holiday = isHoliday(hoveredDate, holidays);
            const weekend = isWeekend(hoveredDate);
            if (holiday) {
              return (
                <div className="text-xs mt-1">
                  <p className="text-primary">
                    {holiday.name}
                    {holiday.isCutiBersama && ' (Cuti Bersama)'}
                  </p>
                  <div className="mt-1">
                    <PBDBadge holiday={holiday} />
                  </div>
                </div>
              );
            } else if (weekend) {
              return <p className="mt-1 text-xs text-muted">Akhir Pekan</p>;
            } else if (showWFHFriday && hoveredDate.getDay() === 5) {
              return <p className="mt-1 text-xs text-muted">WFH Jumat</p>;
            } else {
              return <p className="mt-1 text-xs text-muted">Hari Kerja</p>;
            }
          })()}
        </div>
      )}
    </section>
  );
}
