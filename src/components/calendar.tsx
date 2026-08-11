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
          className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-[#003049]/10 dark:bg-[#669bbc]/20 text-[#003049] dark:text-[#669bbc] rounded font-medium hover:bg-[#003049]/20 dark:hover:bg-[#669bbc]/30 transition"
          title={title}
        >
          {label}
          <ExternalLink size={8} />
        </a>
      );
    }

    return (
      <span className="text-[10px] px-1.5 py-0.5 bg-[#003049]/10 dark:bg-[#669bbc]/20 text-[#003049] dark:text-[#669bbc] rounded font-medium">
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

    let bgClass = 'bg-white dark:bg-slate-800';
    let textClass = 'text-[#003049] dark:text-gray-100';
    let borderClass = 'border border-transparent';

    if (isToday) {
      bgClass = 'bg-[#003049] dark:bg-[#669bbc]';
      textClass = 'text-white font-bold';
    } else if (holiday) {
      if (holiday.isCutiBersama) {
        // Cuti Bersama - lighter/faded red
        bgClass = 'bg-[#c1121f]/20 dark:bg-[#c1121f]/30';
        textClass = 'text-[#c1121f] font-medium';
      } else {
        // Regular holiday - darker red
        bgClass = 'bg-[#c1121f] dark:bg-[#c1121f]';
        textClass = 'text-white font-semibold';
      }
    } else if (weekend) {
      // Weekend - red font only (no border)
      bgClass = 'bg-white dark:bg-slate-800';
      textClass = 'text-[#c1121f] dark:text-[#ff8a95]';
      borderClass = 'border border-transparent';
    } else if (fridayWFH) {
      bgClass = 'bg-[#669bbc]/15 dark:bg-[#669bbc]/20';
      textClass = 'text-[#003049] dark:text-[#669bbc] font-medium';
      borderClass = 'border border-[#669bbc]/50';
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
          <h4 className="text-sm font-semibold text-[#003049] dark:text-gray-100 mb-2 text-center">
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
                className={`text-center font-semibold text-[#405c68] dark:text-gray-300 ${compact ? 'text-[10px] py-1' : 'text-xs py-2'}`}
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
                    className={`${compact ? 'aspect-square text-[10px]' : 'aspect-square text-sm'} flex items-center justify-center rounded ${bgClass} ${textClass} ${borderClass} cursor-pointer transition hover:ring-2 hover:ring-[#669bbc]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003049] dark:focus-visible:ring-[#8ecae6]`}
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
    <div id="calendar-export" className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/10 dark:border-slate-700 p-4 shadow-sm relative">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-[#003049] dark:text-gray-100 capitalize">
            {viewMode === 'month' 
              ? focusDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
              : focusDate.getFullYear()}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onShowWFHFridayChange(!showWFHFriday)}
            aria-pressed={showWFHFriday}
            aria-label={`${showWFHFriday ? 'Sembunyikan' : 'Tampilkan'} WFH setiap Jumat`}
            className={`min-h-11 px-3 py-2 text-xs rounded-md border transition ${
              showWFHFriday
                ? 'bg-[#669bbc]/20 border-[#669bbc]/50 text-[#003049] dark:text-[#669bbc]'
                : 'bg-white dark:bg-slate-800 border-[#003049]/20 dark:border-slate-700 text-[#003049]/70 dark:text-gray-300'
            }`}
            title="Tampilkan WFH setiap Jumat"
          >
            WFH Jumat: {showWFHFriday ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            onClick={backToToday}
            className="min-h-11 px-3 py-2 text-xs rounded-md border border-[#003049]/20 dark:border-slate-700 text-[#003049] dark:text-gray-100 hover:bg-[#669bbc]/20 dark:hover:bg-slate-800 transition"
            title="Kembali ke tanggal hari ini"
          >
            Hari Ini
          </button>
          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => onViewModeChange('month')}
              aria-label="Gunakan tampilan bulanan"
              aria-pressed={viewMode === 'month'}
              className={`inline-flex size-11 items-center justify-center rounded ${viewMode === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
              title="Tampilan Bulanan"
            >
              <CalendarIcon size={16} className="text-[#003049] dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('year')}
              aria-label="Gunakan tampilan tahunan"
              aria-pressed={viewMode === 'year'}
              className={`inline-flex size-11 items-center justify-center rounded ${viewMode === 'year' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
              title="Tampilan Tahunan"
            >
              <CalendarDays size={16} className="text-[#003049] dark:text-gray-300" />
            </button>
          </div>
          {/* Navigation */}
          <button 
            type="button"
            onClick={viewMode === 'month' ? prevMonth : prevYear} 
            aria-label={viewMode === 'month' ? 'Bulan sebelumnya' : 'Tahun sebelumnya'}
            className="inline-flex size-11 items-center justify-center hover:bg-[#669bbc]/20 dark:hover:bg-slate-800 rounded-lg transition text-[#003049] dark:text-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            type="button"
            onClick={viewMode === 'month' ? nextMonth : nextYear} 
            aria-label={viewMode === 'month' ? 'Bulan berikutnya' : 'Tahun berikutnya'}
            className="inline-flex size-11 items-center justify-center hover:bg-[#669bbc]/20 dark:hover:bg-slate-800 rounded-lg transition text-[#003049] dark:text-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'month' ? (
        <>
          {renderMonth(focusDate)}
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#003049]/10 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded bg-[#c1121f]" />
              <span className="text-[#003049] dark:text-gray-400">Libur</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded bg-[#c1121f]/20" />
              <span className="text-[#003049] dark:text-gray-400">Cuti Bersama</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded border-2 border-[#c1121f]/50 bg-white dark:bg-slate-800" />
              <span className="text-[#003049] dark:text-gray-400">Akhir Pekan</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded bg-[#003049] dark:bg-[#669bbc]" />
              <span className="text-[#003049] dark:text-gray-400">Hari Ini</span>
            </div>
          </div>

          {/* Month Holidays List */}
          {monthHolidays.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#003049]/10 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-[#003049] dark:text-gray-100 mb-3">
                Hari Libur Bulan Ini ({monthHolidays.length})
              </h3>
              <div className="space-y-2">
                {monthHolidays.map((holiday, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-3 p-2 rounded-lg border ${
                      holiday.isCutiBersama 
                        ? 'bg-[#c1121f]/10 border-[#c1121f]/20' 
                        : 'bg-[#c1121f]/5 border-[#c1121f]/30'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center ${
                      holiday.isCutiBersama ? 'bg-[#c1121f]/30 text-[#c1121f]' : 'bg-[#c1121f] text-white'
                    }`}>
                      <span className="text-xs font-medium leading-none">
                        {holiday.date.toLocaleDateString('id-ID', { weekday: 'short' })}
                      </span>
                      <span className="text-sm font-bold leading-none">
                        {holiday.date.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#003049] dark:text-gray-100 truncate">
                          {holiday.name}
                        </p>
                        <PBDBadge holiday={holiday} />
                      </div>
                      <p className="text-xs text-[#003049]/60 dark:text-gray-400">
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
            <div className="mt-4 pt-4 border-t border-[#003049]/10 dark:border-slate-700">
              <p className="text-sm text-[#003049]/60 dark:text-gray-400 text-center py-2">
                Tidak ada hari libur di bulan ini
              </p>
            </div>
          )}
        </>
      ) : (
        /* Yearly View - 4x3 grid */
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="border border-[#003049]/10 dark:border-slate-700 rounded-lg p-2">
                {renderMonth(new Date(focusDate.getFullYear(), i, 1), true)}
              </div>
            ))}
          </div>

          {/* Yearly Holiday List */}
          {yearHolidays.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#003049]/10 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-[#003049] dark:text-gray-100 mb-3">
                Daftar Hari Libur Tahun {focusDate.getFullYear()} ({yearHolidays.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {yearHolidays.map((holiday, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-2 p-2 rounded-lg border ${
                      holiday.isCutiBersama 
                        ? 'bg-[#c1121f]/10 border-[#c1121f]/20' 
                        : 'bg-[#c1121f]/5 border-[#c1121f]/30'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded flex flex-col items-center justify-center text-xs ${
                      holiday.isCutiBersama ? 'bg-[#c1121f]/30 text-[#c1121f]' : 'bg-[#c1121f] text-white'
                    }`}>
                      <span className="font-bold leading-none">
                        {holiday.date.getDate()}
                      </span>
                      <span className="text-[10px] leading-none">
                        {holiday.date.toLocaleDateString('id-ID', { month: 'short' }).slice(0, 3)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#003049] dark:text-gray-100 truncate">
                        {holiday.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {holiday.isCutiBersama && (
                          <span className="text-[10px] text-[#c1121f]">Cuti Bersama</span>
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
          className="fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-[#003049]/20 dark:border-slate-600 p-3 min-w-[200px] pointer-events-none"
          style={{
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y + 8}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <p className="text-sm font-semibold text-[#003049] dark:text-gray-100">
            {hoveredDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {(() => {
            const holiday = isHoliday(hoveredDate, holidays);
            const weekend = isWeekend(hoveredDate);
            if (holiday) {
              return (
                <div className="text-xs mt-1">
                  <p className="text-[#c1121f]">
                    {holiday.name}
                    {holiday.isCutiBersama && ' (Cuti Bersama)'}
                  </p>
                  <div className="mt-1">
                    <PBDBadge holiday={holiday} />
                  </div>
                </div>
              );
            } else if (weekend) {
              return <p className="text-xs mt-1 text-[#003049]/60 dark:text-gray-400">Akhir Pekan</p>;
            } else if (showWFHFriday && hoveredDate.getDay() === 5) {
              return <p className="text-xs mt-1 text-[#003049]/60 dark:text-gray-400">WFH Jumat</p>;
            } else {
              return <p className="text-xs mt-1 text-[#003049]/60 dark:text-gray-400">Hari Kerja</p>;
            }
          })()}
        </div>
      )}
    </div>
  );
}
