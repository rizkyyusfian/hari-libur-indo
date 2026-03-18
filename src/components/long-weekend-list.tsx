'use client';

import { Holiday, detectLongWeekends, formatDateIndonesian } from '@/lib/date-utils';
import { Calendar } from 'lucide-react';

interface LongWeekendListProps {
  holidays: Holiday[];
  regionFilter?: string;
  year?: number;
}

export function LongWeekendList({ holidays, regionFilter, year }: LongWeekendListProps) {
  const currentYear = year || new Date().getFullYear();
  const longWeekends = detectLongWeekends(holidays, currentYear, regionFilter);

  // Group by month
  const groupedByMonth = longWeekends.reduce((acc, lw) => {
    const month = lw.start.toLocaleDateString('id-ID', { month: 'long' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(lw);
    return acc;
  }, {} as Record<string, typeof longWeekends>);

  if (longWeekends.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/50 rounded-lg border-2 border-purple-200 dark:border-purple-700/50 p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-purple-500 dark:text-purple-400" />
          <h3 className="font-bold text-purple-700 dark:text-purple-300">Long Weekend</h3>
        </div>
        <p className="text-sm text-purple-600 dark:text-purple-400 text-center py-8 font-medium">
          Tidak ada long weekend di tahun ini 😢
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-lg border-2 border-purple-200 dark:border-purple-700/50 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-purple-500 dark:text-purple-400" />
        <h3 className="font-bold text-purple-700 dark:text-purple-300">
          Long Weekend ({longWeekends.length})
        </h3>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedByMonth).map(([month, weekends]) => (
          <div key={month}>
            <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2 capitalize">
              {month}
            </h4>
            <div className="space-y-2">
              {weekends.map((lw, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg p-3 border-2 border-blue-300 dark:border-blue-700/50"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                      {lw.length} hari
                    </span>
                    <span className="text-xs bg-blue-200 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-semibold">
                      {lw.start.toLocaleDateString('id-ID', { weekday: 'short' })} - {lw.end.toLocaleDateString('id-ID', { weekday: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {formatDateIndonesian(lw.start)} s/d {formatDateIndonesian(lw.end)}
                  </p>
                  {lw.reason.length > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                      {lw.reason.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-purple-600 dark:text-purple-400 mt-4 pt-4 border-t border-purple-200 dark:border-purple-700/50 font-medium">
        💡 Tip: Gunakan cuti untuk menjembatani gap antar long weekend!
      </p>
    </div>
  );
}
