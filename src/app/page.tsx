'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { SummaryCard } from '@/components/summary-card';
import { Calendar } from '@/components/calendar';
import { ToggleRegion } from '@/components/toggle-region';
import { LongWeekendList } from '@/components/long-weekend-list';
import { CutiPlanner } from '@/components/cuti-planner';
import { ExportControls } from '@/components/export-controls';
import { TimezoneInfo } from '@/components/timezone-info';
import { mockHolidays } from '@/lib/mock-data';
import { Holiday } from '@/lib/date-utils';

export default function Home() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [regionFilter, setRegionFilter] = useState<string | undefined>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Parse holiday dates
    const parsedHolidays = mockHolidays.map(h => ({
      ...h,
      date: new Date(h.date),
    }));
    setHolidays(parsedHolidays);
  }, []);

  if (!mounted) {
    return null;
  }

  // Filter holidays based on region
  const filteredHolidays = holidays.filter(h => {
    if (!regionFilter) return true;
    if (regionFilter === 'national') return h.type === 'national';
    return h.type === 'national' || (h.type === 'regional' && h.region === regionFilter);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <SummaryCard holidays={filteredHolidays} regionFilter={regionFilter} />
            <Calendar holidays={filteredHolidays} regionFilter={regionFilter} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <ToggleRegion regionFilter={regionFilter} onToggle={setRegionFilter} />
            <TimezoneInfo />
            <ExportControls />
            <LongWeekendList holidays={filteredHolidays} regionFilter={regionFilter} />
            <CutiPlanner holidays={filteredHolidays} regionFilter={regionFilter} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>🇮🇩 Hari Libur Indonesia - Papua Barat Daya</p>
          <p className="mt-1">Data libur diperbarui untuk tahun 2026</p>
        </div>
      </main>
    </div>
  );
}
