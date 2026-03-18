'use client';

import { Holiday } from '@/lib/date-utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CalendarProps {
  holidays: Holiday[];
  regionFilter?: string;
  year?: number;
  month?: number;
}

export function Calendar({ holidays, regionFilter, year: initialYear, month: initialMonth }: CalendarProps) {
  const today = new Date();
  const [displayYear, setDisplayYear] = useState(initialYear || today.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(initialMonth || today.getMonth());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const firstDay = new Date(displayYear, displayMonth, 1).getDay();
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const days = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const isHoliday = (day: number) => {
    const date = new Date(displayYear, displayMonth, day);
    return holidays.some(h => h.date.toDateString() === date.toDateString());
  };

  const isWeekend = (day: number) => {
    const date = new Date(displayYear, displayMonth, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const isToday = (day: number) => {
    const date = new Date(displayYear, displayMonth, day);
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-cream dark:bg-darkblue/30 rounded-lg border-4 border-burgundy dark:border-darkred p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-burgundy/20 dark:hover:bg-lightblue/20 rounded-lg transition text-burgundy dark:text-lightblue"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-burgundy dark:text-cream">
          {monthNames[displayMonth]} {displayYear}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-burgundy/20 dark:hover:bg-lightblue/20 rounded-lg transition text-burgundy dark:text-lightblue"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(name => (
          <div key={name} className="text-center text-sm font-bold text-burgundy dark:text-lightblue py-2">
            {name}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const holiday = isHoliday(day);
          const weekend = isWeekend(day);
          const today_ = isToday(day);

          let bgColor = 'bg-cream dark:bg-darkblue/50 text-burgundy dark:text-cream';
          let borderColor = 'border-cream dark:border-darkblue/50';

          if (today_) {
            bgColor = 'bg-lightblue dark:bg-lightblue text-darkblue dark:text-darkblue font-bold';
            borderColor = 'border-lightblue dark:border-lightblue';
          } else if (holiday) {
            bgColor = 'bg-darkred dark:bg-darkred/40 text-cream dark:text-cream font-bold';
            borderColor = 'border-darkred dark:border-darkred';
          } else if (weekend) {
            bgColor = 'bg-burgundy/30 dark:bg-burgundy/20 text-burgundy dark:text-lightblue font-semibold';
            borderColor = 'border-burgundy dark:border-burgundy/50';
          }

          return (
            <div
              key={day}
              className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-bold transition hover:scale-105 ${bgColor} ${borderColor}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t-2 border-burgundy dark:border-darkred space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-lightblue dark:bg-lightblue border-2 border-lightblue" />
          <span className="text-xs font-bold text-burgundy dark:text-cream">Hari Ini</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-darkred dark:bg-darkred/40 border-2 border-darkred" />
          <span className="text-xs font-bold text-burgundy dark:text-cream">Hari Libur</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-burgundy/30 dark:bg-burgundy/20 border-2 border-burgundy" />
          <span className="text-xs font-bold text-burgundy dark:text-cream">Hari Libur (Weekend)</span>
        </div>
      </div>
    </div>
  );
}
