'use client';

import { Zap } from 'lucide-react';

interface ToggleRegionProps {
  regionFilter?: string;
  onToggle: (region?: string) => void;
}

export function ToggleRegion({ regionFilter, onToggle }: ToggleRegionProps) {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-lg border-2 border-purple-200 dark:border-purple-700/50 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={18} className="text-purple-500 dark:text-purple-400" />
        <h3 className="font-bold text-purple-700 dark:text-purple-300">Filter Libur</h3>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => onToggle(undefined)}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            !regionFilter
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
          }`}
        >
          🇮🇩 Nasional + Regional
        </button>

        <button
          onClick={() => onToggle('national')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            regionFilter === 'national'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
          }`}
        >
          🏛️ Nasional Saja
        </button>

        <button
          onClick={() => onToggle('papua_barat_daya')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            regionFilter === 'papua_barat_daya'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
          }`}
        >
          🏝️ Papua Barat Daya
        </button>
      </div>

      <p className="text-xs text-purple-600 dark:text-purple-400 mt-3 font-medium">
        💡 Pilih filter untuk melihat hari libur sesuai kebutuhan
      </p>
    </div>
  );
}
