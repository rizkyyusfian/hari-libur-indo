'use client';

import { Holiday, formatDateIndonesian, getDaysUntilNextOffDay, getNextOffPeriod } from '@/lib/date-utils';
import { getRoastMessage } from '@/lib/mock-data';
import { Calendar, AlertCircle, Smile, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentTimezone, formatTimeWithTimezone } from '@/lib/timezone';

interface SummaryCardProps {
  holidays: Holiday[];
  regionFilter?: string;
}

export function SummaryCard({ holidays, regionFilter }: SummaryCardProps) {
  const today = new Date();
  const todayHoliday = holidays.find(h => h.date.toDateString() === today.toDateString());
  const daysUntil = getDaysUntilNextOffDay(today, holidays, regionFilter);
  const nextOffPeriod = getNextOffPeriod(today, holidays, regionFilter);
  const roastMessage = getRoastMessage(daysUntil, !!todayHoliday);

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
    <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-blue-900/40 rounded-lg border-2 border-purple-200 dark:border-purple-700/50 p-6 shadow-lg backdrop-blur-sm">
      <div className="space-y-4">
        {/* Today Status */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Status Hari Ini</p>
            {todayHoliday ? (
              <p className="text-lg font-bold text-pink-600 dark:text-pink-300">
                🎉 {todayHoliday.name}
              </p>
            ) : (
              <p className="text-lg font-bold text-purple-600 dark:text-purple-300">
                📅 Hari Kerja Biasa
              </p>
            )}
          </div>
          <Calendar className="text-purple-500 dark:text-purple-400" size={24} />
        </div>

        {/* Timezone Info */}
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 border border-purple-200 dark:border-purple-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-500 dark:text-blue-400" />
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Zona Waktu Anda</p>
          </div>
          <p className="text-sm font-mono font-semibold text-purple-900 dark:text-purple-100">
            {time}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            {timezone === 'WIB' && '🏛️ Waktu Indonesia Bagian Barat (Pulau Jawa)'}
            {timezone === 'WITA' && '🏝️ Waktu Indonesia Bagian Tengah (Sulawesi, Bali)'}
            {timezone === 'WIT' && '🗻 Waktu Indonesia Bagian Timur (Papua, Maluku)'}
          </p>
        </div>

        {/* Next Off Period */}
        {nextOffPeriod && (
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 border-2 border-pink-200 dark:border-pink-700/50">
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              {nextOffPeriod.type === 'long-weekend' ? '📅 Long Weekend Terdekat' : '🏖️ Hari Libur Terdekat'}
            </p>
            <p className="text-base font-bold text-pink-600 dark:text-pink-300 mt-1">
              {nextOffPeriod.type === 'long-weekend'
                ? `${formatDateIndonesian((nextOffPeriod.details as any).start)} - ${(nextOffPeriod.details as any).length} hari`
                : formatDateIndonesian((nextOffPeriod.details as Holiday).date)}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Tinggal {nextOffPeriod.daysUntil} hari lagi
            </p>
          </div>
        )}

        {/* Roast Message */}
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 border-2 border-blue-200 dark:border-blue-700/50 flex items-start gap-3">
          <Smile className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1" size={20} />
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{roastMessage}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 border border-blue-200 dark:border-blue-700/50">
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Hari Kerja Tersisa</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-300 mt-1">
              {Math.max(0, 365 - daysUntil)} hari
            </p>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 border border-pink-200 dark:border-pink-700/50">
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Total Libur</p>
            <p className="text-lg font-bold text-pink-600 dark:text-pink-300 mt-1">
              {holidays.length} hari
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
