'use client';

import { Holiday, formatDateIndonesian, getNextOffPeriod } from '@/lib/date-utils';
import { CalendarDays, Clock } from 'lucide-react';

interface SummaryCardProps {
  holidays: Holiday[];
}

export function SummaryCard({ holidays }: SummaryCardProps) {
  const today = new Date();
  const todayHoliday = holidays.find(h => h.date.toDateString() === today.toDateString());
  const nextOffPeriod = getNextOffPeriod(today, holidays);
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;

  // Count remaining holidays this year
  const remainingHolidays = holidays.filter(h => h.date > today).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/10 dark:border-slate-700 p-5 shadow-sm">
      {/* Today's Status - Clean and prominent */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-[#003049]/60 dark:text-gray-500 uppercase tracking-wide">
            Hari Ini
          </p>
          <p className="text-xl font-bold text-[#003049] dark:text-white mt-1">
            {todayHoliday 
              ? todayHoliday.name 
              : isWeekend 
                ? 'Akhir Pekan' 
                : 'Hari Kerja'}
          </p>
          {todayHoliday && (
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
              todayHoliday.isCutiBersama 
                ? 'bg-[#c1121f]/20 text-[#c1121f]' 
                : 'bg-[#003049]/10 text-[#003049] dark:bg-[#669bbc]/20 dark:text-[#669bbc]'
            }`}>
              {todayHoliday.isCutiBersama ? 'Cuti Bersama' : todayHoliday.type === 'national' ? 'Libur Nasional' : 'Libur Regional'}
            </span>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          todayHoliday || isWeekend 
            ? 'bg-[#c1121f]/10 dark:bg-[#c1121f]/20' 
            : 'bg-[#669bbc]/10 dark:bg-[#669bbc]/20'
        }`}>
          <CalendarDays size={24} className={
            todayHoliday || isWeekend 
              ? 'text-[#c1121f]' 
              : 'text-[#669bbc]'
          } />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#003049]/10 dark:border-slate-700 my-4" />

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Next Holiday/Long Weekend */}
        <div>
          <p className="text-xs text-[#003049]/60 dark:text-gray-500">
            {nextOffPeriod?.type === 'long-weekend' ? 'Long Weekend' : 'Libur Berikutnya'}
          </p>
          {nextOffPeriod ? (
            <>
              <p className="font-semibold text-[#003049] dark:text-white mt-1">
                {nextOffPeriod.type === 'long-weekend'
                  ? `${(nextOffPeriod.details as any).length} hari`
                  : (nextOffPeriod.details as Holiday).name.substring(0, 20)}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-[#003049]/60 dark:text-gray-400">
                <Clock size={12} />
                <span>{nextOffPeriod.daysUntil} hari lagi</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#003049]/50 dark:text-gray-500 mt-1">-</p>
          )}
        </div>

        {/* Remaining Holidays */}
        <div>
          <p className="text-xs text-[#003049]/60 dark:text-gray-500">Sisa Libur Tahun Ini</p>
          <p className="text-2xl font-bold text-[#c1121f] dark:text-[#669bbc] mt-1">
            {remainingHolidays}
          </p>
          <p className="text-xs text-[#003049]/60 dark:text-gray-500">hari libur</p>
        </div>
      </div>
    </div>
  );
}
