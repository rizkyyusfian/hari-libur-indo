'use client';

import { Holiday, formatDateIndonesian } from '@/lib/date-utils';
import { planCuti, estimateTotalDaysOff } from '@/lib/cuti-planner';
import { Zap, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface CutiPlannerProps {
  holidays: Holiday[];
  regionFilter?: string;
}

export function CutiPlanner({ holidays, regionFilter }: CutiPlannerProps) {
  const [cutiDays, setCutiDays] = useState(5);
  const recommendations = planCuti(cutiDays, holidays, undefined, regionFilter);
  const totalEstimate = estimateTotalDaysOff(cutiDays, holidays, undefined, regionFilter);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-amber-500" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Cuti Planner</h3>
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Berapa hari cuti yang kamu punya?
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={cutiDays}
            onChange={e => setCutiDays(parseInt(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Cuti: {cutiDays} hari</span>
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              📅 Potensi: {totalEstimate} hari off
            </span>
          </div>
        </div>

        {/* Estimate Card */}
        {totalEstimate > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
            <TrendingUp className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Maksimalkan liburan! 🎉
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                {cutiDays} hari cuti bisa menjadi {totalEstimate} hari off jika direncanakan dengan baik
              </p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">💡 Rekomendasi Cuti:</p>
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-2 border border-gray-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Opsi {idx + 1}: {rec.totalDaysOff} hari off
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {rec.reason}
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  {rec.dates.map(d => formatDateIndonesian(d)).join(', ')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
            Tidak ada rekomendasi untuk saat ini
          </p>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-slate-700">
          🎯 Tip: Ambil cuti sebelum atau sesudah hari libur untuk memaksimalkan waktu istirahat!
        </p>
      </div>
    </div>
  );
}
