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
    <div className="bg-white dark:bg-slate-800/50 rounded-lg border-2 border-purple-200 dark:border-purple-700/50 p-4 shadow-lg backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent capitalize">
            {monthName}
          </h2>
          <p className="text-sm text-purple-600 dark:text-purple-400">Tekan hari untuk detail</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition text-purple-600 dark:text-purple-400">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition text-purple-600 dark:text-purple-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-bold text-purple-600 dark:text-purple-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) {
            return (
              <div key={`empty-${idx}`} className="aspect-square bg-purple-50 dark:bg-purple-900/20 rounded" />
            );
          }

          const holiday = isHoliday(date, holidays, regionFilter);
          const weekend = isWeekend(date);
          const isToday = date.toDateString() === today.toDateString();

          let bgClass = 'bg-white dark:bg-slate-700';
          let textClass = 'text-purple-900 dark:text-purple-100';

          if (isToday) {
            bgClass = 'bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600';
            textClass = 'text-white font-bold';
          } else if (holiday) {
            bgClass = 'bg-gradient-to-br from-pink-200 to-pink-300 dark:from-pink-900/50 dark:to-pink-800/50 border-2 border-pink-500 dark:border-pink-600';
            textClass = 'text-pink-700 dark:text-pink-200 font-bold';
          } else if (weekend) {
            bgClass = 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30';
            textClass = 'text-orange-600 dark:text-orange-400 font-semibold';
          }

          return (
            <button
              key={formatDateISO(date)}
              className={`aspect-square rounded-lg p-1 text-sm font-semibold transition hover:shadow-lg ${bgClass} ${textClass} border border-purple-200 dark:border-purple-700/30`}
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
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-purple-200 dark:border-purple-700/50">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-pink-200 to-pink-300 border-2 border-pink-500" />
          <span className="text-purple-600 dark:text-purple-400 font-medium">Libur</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-orange-100 to-orange-200" />
          <span className="text-purple-600 dark:text-purple-400 font-medium">Akhir Pekan</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-400 to-blue-500" />
          <span className="text-purple-600 dark:text-purple-400 font-medium">Hari Ini</span>
        </div>
      </div>
    </div>
  );
}
