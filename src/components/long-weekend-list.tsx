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
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Long Weekend</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
          Tidak ada long weekend di tahun ini 😢
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-blue-500" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Long Weekend ({longWeekends.length})
        </h3>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedByMonth).map(([month, weekends]) => (
          <div key={month}>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
              {month}
            </h4>
            <div className="space-y-2">
              {weekends.map((lw, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-3 border border-blue-200 dark:border-slate-600"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {lw.length} hari
                    </span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {lw.start.toLocaleDateString('id-ID', { weekday: 'short' })} - {lw.end.toLocaleDateString('id-ID', { weekday: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDateIndonesian(lw.start)} s/d {formatDateIndonesian(lw.end)}
                  </p>
                  {lw.reason.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {lw.reason.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        💡 Tip: Gunakan cuti untuk menjembatani gap antar long weekend!
      </p>
    </div>
  );
}
