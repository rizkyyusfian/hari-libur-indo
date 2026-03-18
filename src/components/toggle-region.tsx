'use client';

import { Zap } from 'lucide-react';

interface ToggleRegionProps {
  regionFilter?: string;
  onToggle: (region?: string) => void;
}

export function ToggleRegion({ regionFilter, onToggle }: ToggleRegionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={18} className="text-amber-500" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filter Libur</h3>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => onToggle(undefined)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            !regionFilter
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          🇮🇩 Nasional + Regional
        </button>

        <button
          onClick={() => onToggle('national')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            regionFilter === 'national'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          🏛️ Nasional Saja
        </button>

        <button
          onClick={() => onToggle('papua_barat_daya')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            regionFilter === 'papua_barat_daya'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          🏝️ Papua Barat Daya
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        💡 Pilih filter untuk melihat hari libur sesuai kebutuhan
      </p>
    </div>
  );
}
