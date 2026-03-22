'use client';

<<<<<<< HEAD
import { Holiday, formatDateIndonesian, getNextOffPeriod } from '@/lib/date-utils';
import { CalendarDays, Clock } from 'lucide-react';
=======
import { Holiday, formatDateIndonesian, getDaysUntilNextOffDay, getNextOffPeriod } from '@/lib/date-utils';
import { getRoastMessage } from '@/lib/mock-data';
import { Calendar, AlertCircle, Smile, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentTimezone, formatTimeWithTimezone } from '@/lib/timezone';
>>>>>>> main

interface SummaryCardProps {
  holidays: Holiday[];
}

export function SummaryCard({ holidays }: SummaryCardProps) {
  const today = new Date();
  const todayHoliday = holidays.find(h => h.date.toDateString() === today.toDateString());
<<<<<<< HEAD
  const nextOffPeriod = getNextOffPeriod(today, holidays);
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;

  // Count remaining holidays this year
  const remainingHolidays = holidays.filter(h => h.date > today).length;
=======
  const daysUntil = getDaysUntilNextOffDay(today, holidays, regionFilter);
  const nextOffPeriod = getNextOffPeriod(today, holidays, regionFilter);
  const roastMessage = getRoastMessage(daysUntil, !!todayHoliday);
>>>>>>> main

  const [time, setTime] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateTime = () => {
      const now = new Date();
      const tz = getCurrentTimezone();
      setTimezone(tz.code);
      setTime(formatTimeWithTimezone(now, tz));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
<<<<<<< HEAD
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
              <p className="font-semibold text-[#003049] dark:text-white mt-1 text-sm leading-tight">
                {nextOffPeriod.type === 'long-weekend'
                  ? `${(nextOffPeriod.details as any).length} hari`
                  : (nextOffPeriod.details as Holiday).name}
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
=======
    <div className="bg-cream dark:bg-darkblue/30 rounded-lg border-4 border-burgundy dark:border-darkred p-6 shadow-lg">
      <div className="space-y-4">
        {/* Today Status */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-burgundy dark:text-lightblue">Status Hari Ini</p>
            {todayHoliday ? (
              <p className="text-lg font-bold text-darkred dark:text-lightblue">
                🎉 {todayHoliday.name}
              </p>
            ) : (
              <p className="text-lg font-bold text-burgundy dark:text-cream">
                📅 Hari Kerja Biasa
              </p>
            )}
          </div>
          <Calendar className="text-burgundy dark:text-lightblue" size={24} />
        </div>

        {/* Timezone Info */}
        <div className="bg-lightblue/30 dark:bg-lightblue/20 rounded-lg p-3 border-2 border-lightblue">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-darkblue dark:text-lightblue" />
            <p className="text-xs font-bold text-darkblue dark:text-lightblue">Zona Waktu Anda</p>
          </div>
          <p className="text-sm font-mono font-bold text-darkblue dark:text-cream">
            {time}
          </p>
          <p className="text-xs text-darkblue dark:text-lightblue mt-1 font-semibold">
            {timezone === 'WIB' && '🏛️ Waktu Indonesia Bagian Barat (Pulau Jawa)'}
            {timezone === 'WITA' && '🏝️ Waktu Indonesia Bagian Tengah (Sulawesi, Bali)'}
            {timezone === 'WIT' && '🗻 Waktu Indonesia Bagian Timur (Papua, Maluku)'}
          </p>
        </div>

        {/* Next Off Period */}
        {nextOffPeriod && (
          <div className="bg-lightblue/30 dark:bg-lightblue/20 rounded-lg p-3 border-2 border-lightblue">
            <p className="text-sm font-bold text-darkblue dark:text-lightblue">
              {nextOffPeriod.type === 'long-weekend' ? '📅 Long Weekend Terdekat' : '🏖️ Hari Libur Terdekat'}
            </p>
            <p className="text-base font-bold text-darkred dark:text-lightblue mt-1">
              {nextOffPeriod.type === 'long-weekend'
                ? `${formatDateIndonesian((nextOffPeriod.details as any).start)} - ${(nextOffPeriod.details as any).length} hari`
                : formatDateIndonesian((nextOffPeriod.details as Holiday).date)}
            </p>
            <p className="text-xs text-darkblue dark:text-lightblue mt-1 font-semibold">
              Tinggal {nextOffPeriod.daysUntil} hari lagi
            </p>
          </div>
        )}

        {/* Roast Message */}
        <div className="bg-darkred dark:bg-darkred/40 rounded-lg p-3 border-2 border-darkred flex items-start gap-3">
          <Smile className="text-cream dark:text-cream flex-shrink-0 mt-1" size={20} />
          <p className="text-sm font-bold text-cream dark:text-cream">{roastMessage}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-lightblue/30 dark:bg-lightblue/20 rounded-lg p-3 border-2 border-lightblue">
            <p className="text-xs text-darkblue dark:text-lightblue font-bold">Hari Kerja Tersisa</p>
            <p className="text-lg font-bold text-darkblue dark:text-lightblue mt-1">
              {Math.max(0, 365 - daysUntil)} hari
            </p>
          </div>
          <div className="bg-darkred/30 dark:bg-darkred/20 rounded-lg p-3 border-2 border-darkred">
            <p className="text-xs text-darkred dark:text-lightblue font-bold">Total Libur</p>
            <p className="text-lg font-bold text-darkred dark:text-lightblue mt-1">
              {holidays.length} hari
            </p>
          </div>
>>>>>>> main
        </div>
      </div>
    </div>
  );
}
