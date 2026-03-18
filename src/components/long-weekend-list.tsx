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
      <div className="bg-cream dark:bg-darkblue/30 rounded-lg border-4 border-burgundy dark:border-darkred p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-darkred dark:text-lightblue" />
          <h3 className="font-bold text-burgundy dark:text-cream text-lg">Long Weekend</h3>
        </div>
        <p className="text-sm text-burgundy dark:text-cream text-center py-8 font-semibold">
          Tidak ada long weekend di tahun ini 😢
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cream dark:bg-darkblue/30 rounded-lg border-4 border-burgundy dark:border-darkred p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-darkred dark:text-lightblue" />
        <h3 className="font-bold text-burgundy dark:text-cream text-lg">
          Long Weekend ({longWeekends.length})
        </h3>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedByMonth).map(([month, weekends]) => (
          <div key={month}>
            <h4 className="text-sm font-bold text-darkred dark:text-lightblue mb-2 capitalize">
              {month}
            </h4>
            <div className="space-y-2">
              {weekends.map((lw, idx) => (
                <div
                  key={idx}
                  className="bg-lightblue/30 dark:bg-lightblue/20 rounded-lg p-3 border-2 border-lightblue"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-darkblue dark:text-lightblue">
                      {lw.length} hari libur
                    </span>
                    <span className="text-xs bg-darkblue dark:bg-lightblue text-cream dark:text-darkblue px-2 py-1 rounded font-bold">
                      {lw.start.toLocaleDateString('id-ID', { weekday: 'short' })} - {lw.end.toLocaleDateString('id-ID', { weekday: 'short' })}
                    </span>
                  </div>
                  <div className="text-xs text-darkblue dark:text-lightblue font-semibold space-y-1">
                    <p>📍 Mulai: {formatDateIndonesian(lw.start)}</p>
                    <p>📍 Berakhir: {formatDateIndonesian(lw.end)}</p>
                  </div>
                  {lw.reason.length > 0 && (
                    <p className="text-xs text-darkblue dark:text-lightblue mt-2 font-bold">
                      Terdiri dari: {lw.reason.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-burgundy dark:text-lightblue mt-4 pt-4 border-t-2 border-burgundy dark:border-darkred font-semibold">
        💡 Tip: Gunakan cuti untuk menjembatani gap antar long weekend!
      </p>
    </div>
  );
}
