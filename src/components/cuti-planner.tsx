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
    <div className="bg-white dark:bg-slate-800/50 rounded-lg border-2 border-purple-200 dark:border-purple-700/50 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-purple-500 dark:text-purple-400" />
        <h3 className="font-bold text-purple-700 dark:text-purple-300">Cuti Planner</h3>
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-bold text-purple-700 dark:text-purple-300 mb-2">
            Berapa hari cuti yang kamu punya?
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={cutiDays}
            onChange={e => setCutiDays(parseInt(e.target.value))}
            className="w-full accent-purple-600 dark:accent-pink-500"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">Cuti: {cutiDays} hari</span>
            <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
              📅 Potensi: {totalEstimate} hari off
            </span>
          </div>
        </div>

        {/* Estimate Card */}
        {totalEstimate > 0 && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 border-2 border-green-300 dark:border-green-700/50 flex items-center gap-3">
            <TrendingUp className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-green-700 dark:text-green-300">
                Maksimalkan liburan! 🎉
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                {cutiDays} hari cuti bisa menjadi {totalEstimate} hari off jika direncanakan dengan baik
              </p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-bold text-purple-700 dark:text-purple-300">💡 Rekomendasi Cuti:</p>
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-2 border-2 border-purple-200 dark:border-purple-700/50">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">
                  Opsi {idx + 1}: {rec.totalDaysOff} hari off
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                  {rec.reason}
                </p>
                <p className="text-xs text-pink-600 dark:text-pink-400 font-bold">
                  {rec.dates.map(d => formatDateIndonesian(d)).join(', ')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-purple-600 dark:text-purple-400 text-center py-4 font-medium">
            Tidak ada rekomendasi untuk saat ini
          </p>
        )}

        <p className="text-xs text-purple-600 dark:text-purple-400 pt-2 border-t border-purple-200 dark:border-purple-700/50 font-medium">
          🎯 Tip: Ambil cuti sebelum atau sesudah hari libur untuk memaksimalkan waktu istirahat!
        </p>
      </div>
    </div>
  );
}
