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
        </div>
      </div>
    </div>
  );
}
