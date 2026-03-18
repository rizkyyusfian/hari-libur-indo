'use client';

import { Holiday, formatDateIndonesian, getDaysUntilNextOffDay, getNextOffPeriod } from '@/lib/date-utils';
import { getRoastMessage } from '@/lib/mock-data';
import { Calendar, AlertCircle, Smile } from 'lucide-react';

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

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-indigo-200 dark:border-slate-700 p-6 shadow-lg">
      <div className="space-y-4">
        {/* Today Status */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status Hari Ini</p>
            {todayHoliday ? (
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                🎉 {todayHoliday.name}
              </p>
            ) : (
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                📅 Hari Kerja Biasa
              </p>
            )}
          </div>
          <Calendar className="text-indigo-500" size={24} />
        </div>

        {/* Next Off Period */}
        {nextOffPeriod && (
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-indigo-100 dark:border-slate-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {nextOffPeriod.type === 'long-weekend' ? '📅 Long Weekend Terdekat' : '🏖️ Hari Libur Terdekat'}
            </p>
            <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              {nextOffPeriod.type === 'long-weekend'
                ? `${formatDateIndonesian((nextOffPeriod.details as any).start)} - ${(nextOffPeriod.details as any).length} hari`
                : formatDateIndonesian((nextOffPeriod.details as Holiday).date)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Tinggal {nextOffPeriod.daysUntil} hari lagi
            </p>
          </div>
        )}

        {/* Roast Message */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-yellow-100 dark:border-yellow-900/30 flex items-start gap-3">
          <Smile className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{roastMessage}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-white/50 dark:bg-slate-800/50 rounded p-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">Hari Kerja Tersisa</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {Math.max(0, 365 - daysUntil)} hari
            </p>
          </div>
          <div className="bg-white/50 dark:bg-slate-800/50 rounded p-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Libur</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {holidays.length} hari
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
