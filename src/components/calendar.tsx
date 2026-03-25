'use client';

import { useState, useEffect } from 'react';
import { Holiday, isHoliday, isWeekend, formatDateIndonesian, formatDateISO } from '@/lib/date-utils';
import { ChevronLeft, ChevronRight, CalendarDays, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { getRegionalDocument, Document } from '@/lib/supabase-queries';

interface CalendarProps {
  holidays: Holiday[];
}

export function Calendar({ holidays }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [regionalDoc, setRegionalDoc] = useState<Document | null>(null);

  useEffect(() => {
    loadRegionalDoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate.getFullYear()]);

  const loadRegionalDoc = async () => {
    try {
      const doc = await getRegionalDocument(currentDate.getFullYear(), 'papua_barat_daya');
      if (!doc) {
        console.warn('[Calendar] Regional document not found for year:', currentDate.getFullYear());
      } else if (!doc.file_url) {
        console.warn('[Calendar] Regional document found but file_url is missing:', doc);
      }
      setRegionalDoc(doc);
    } catch (error) {
      console.error('[Calendar] Error loading regional document:', error);
    }
  };

  // PBD Badge component - clickable if regional doc exists
  const PBDBadge = () => {
    if (regionalDoc?.file_url) {
      return (
        <a
          href={regionalDoc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-[#003049]/10 dark:bg-[#669bbc]/20 text-[#003049] dark:text-[#669bbc] rounded font-medium hover:bg-[#003049]/20 dark:hover:bg-[#669bbc]/30 transition"
          title={regionalDoc.title}
        >
          PBD
          <ExternalLink size={8} />
        </a>
      );
    }
    return (
      <span className="text-[10px] px-1.5 py-0.5 bg-[#003049]/10 dark:bg-[#669bbc]/20 text-[#003049] dark:text-[#669bbc] rounded font-medium">
        PBD
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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1));
  };

  const nextYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1));
  };

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const today = new Date();

  // Get day class based on holiday/weekend status
  const getDayClasses = (date: Date) => {
    const holiday = isHoliday(date, holidays);
    const weekend = isWeekend(date);
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
      textClass = 'text-[#c1121f] dark:text-[#c1121f]';
      borderClass = 'border border-transparent';
    }

    return { bgClass, textClass, borderClass };
  };

  const handleMouseEnter = (date: Date, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
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
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), i));
    }

    const monthName = monthDate.toLocaleDateString('id-ID', { month: 'long' });

    return (
      <div className={compact ? '' : ''}>
        {compact && (
          <h4 className="text-sm font-semibold text-[#003049] dark:text-gray-100 mb-2 text-center">
            {monthName}
          </h4>
        )}
        <div className={`grid grid-cols-7 ${compact ? 'gap-0.5' : 'gap-1'}`}>
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className={`text-center font-semibold text-[#003049]/60 dark:text-gray-500 ${compact ? 'text-[10px] py-1' : 'text-xs py-2'}`}>
              {compact ? day.charAt(0) : day}
            </div>
          ))}
          {/* Days */}
          {days.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className={`${compact ? 'aspect-square' : 'aspect-square'}`} />;
            }

            const { bgClass, textClass, borderClass } = getDayClasses(date);
            const holiday = isHoliday(date, holidays);

            return (
              <div
                key={formatDateISO(date)}
                className={`${compact ? 'aspect-square text-[10px]' : 'aspect-square text-sm'} rounded ${bgClass} ${textClass} ${borderClass} flex items-center justify-center cursor-pointer transition hover:ring-2 hover:ring-[#669bbc]/50`}
                onMouseEnter={(e) => handleMouseEnter(date, e)}
                onMouseLeave={handleMouseLeave}
                title={holiday?.name || ''}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Get holidays for current month (monthly view)
  const monthHolidays = holidays.filter(h => {
    return h.date.getMonth() === currentDate.getMonth() && 
           h.date.getFullYear() === currentDate.getFullYear();
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  // Get holidays for current year (yearly view)
  const yearHolidays = holidays.filter(h => {
    return h.date.getFullYear() === currentDate.getFullYear();
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div id="calendar-export" className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/10 dark:border-slate-700 p-4 shadow-sm relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-[#003049] dark:text-gray-100 capitalize">
            {viewMode === 'month' 
              ? currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
              : currentDate.getFullYear()}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`p-1.5 rounded ${viewMode === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
              title="Tampilan Bulanan"
            >
              <CalendarIcon size={16} className="text-[#003049] dark:text-gray-300" />
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`p-1.5 rounded ${viewMode === 'year' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
              title="Tampilan Tahunan"
            >
              <CalendarDays size={16} className="text-[#003049] dark:text-gray-300" />
            </button>
          </div>
          {/* Navigation */}
          <button 
            onClick={viewMode === 'month' ? prevMonth : prevYear} 
            className="p-2 hover:bg-[#669bbc]/20 dark:hover:bg-slate-800 rounded-lg transition text-[#003049] dark:text-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={viewMode === 'month' ? nextMonth : nextYear} 
            className="p-2 hover:bg-[#669bbc]/20 dark:hover:bg-slate-800 rounded-lg transition text-[#003049] dark:text-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'month' ? (
        <>
          {renderMonth(currentDate)}
          
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
                        {holiday.type === 'regional' && <PBDBadge />}
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
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="border border-[#003049]/10 dark:border-slate-700 rounded-lg p-2">
                {renderMonth(new Date(currentDate.getFullYear(), i, 1), true)}
              </div>
            ))}
          </div>

          {/* Yearly Holiday List */}
          {yearHolidays.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#003049]/10 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-[#003049] dark:text-gray-100 mb-3">
                Daftar Hari Libur Tahun {currentDate.getFullYear()} ({yearHolidays.length})
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
                        {holiday.type === 'regional' && <PBDBadge />}
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
                  {holiday.type === 'regional' && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#003049]/10 dark:bg-[#669bbc]/20 text-[#003049] dark:text-[#669bbc] text-[10px] rounded font-medium">
                      PBD
                    </span>
                  )}
                </div>
              );
            } else if (weekend) {
              return <p className="text-xs mt-1 text-[#003049]/60 dark:text-gray-400">Akhir Pekan</p>;
            } else {
              return <p className="text-xs mt-1 text-[#003049]/60 dark:text-gray-400">Hari Kerja</p>;
            }
          })()}
        </div>
      )}
    </div>
  );
}
