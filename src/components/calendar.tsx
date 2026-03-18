'use client';

import { Holiday, isHoliday, isWeekend, formatDateISO } from '@/lib/date-utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CalendarProps {
  holidays: Holiday[];
  regionFilter?: string;
}

export function Calendar({ holidays, regionFilter }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

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

  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const today = new Date();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
            {monthName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tekan hari untuk detail</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) {
            return (
              <div key={`empty-${idx}`} className="aspect-square bg-gray-50 dark:bg-slate-800 rounded" />
            );
          }

          const holiday = isHoliday(date, holidays, regionFilter);
          const weekend = isWeekend(date);
          const isToday = date.toDateString() === today.toDateString();

          let bgClass = 'bg-white dark:bg-slate-700';
          let textClass = 'text-gray-900 dark:text-gray-100';

          if (isToday) {
            bgClass = 'bg-blue-500 dark:bg-blue-600';
            textClass = 'text-white font-bold';
          } else if (holiday) {
            bgClass = 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500';
            textClass = 'text-green-700 dark:text-green-300 font-semibold';
          } else if (weekend) {
            bgClass = 'bg-red-50 dark:bg-red-900/20';
            textClass = 'text-red-600 dark:text-red-400';
          }

          return (
            <button
              key={formatDateISO(date)}
              className={`aspect-square rounded-lg p-1 text-sm font-medium transition hover:shadow-md ${bgClass} ${textClass} border border-gray-200 dark:border-slate-600`}
              title={holiday?.name || (weekend ? 'Akhir Pekan' : '')}
            >
              <div className="h-full flex flex-col items-center justify-center">
                <span>{date.getDate()}</span>
                {holiday && <span className="text-xs leading-none">✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border-2 border-green-500" />
          <span className="text-gray-600 dark:text-gray-400">Libur</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-red-50 dark:bg-red-900/20" />
          <span className="text-gray-600 dark:text-gray-400">Akhir Pekan</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">Hari Ini</span>
        </div>
      </div>
    </div>
  );
}
