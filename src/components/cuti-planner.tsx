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
  const [cutiDays, setCutiDays] = useState('5');
  const cutiDaysNum = Math.max(1, Math.min(30, parseInt(cutiDays) || 0));
  const recommendations = planCuti(cutiDaysNum, holidays, undefined, regionFilter);
  const totalEstimate = estimateTotalDaysOff(cutiDaysNum, holidays, undefined, regionFilter);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setCutiDays(value === '' ? '0' : value);
    }
  };

  return (
    <div className="bg-cream dark:bg-darkblue/30 rounded-lg border-4 border-burgundy dark:border-darkred p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-darkred dark:text-lightblue" />
        <h3 className="font-bold text-burgundy dark:text-cream text-lg">Cuti Planner</h3>
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-bold text-burgundy dark:text-cream mb-2">
            Berapa hari cuti yang kamu punya?
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="1"
              max="30"
              value={cutiDays}
              onChange={handleChange}
              className="flex-1 px-3 py-2 rounded-lg border-2 border-burgundy dark:border-darkred bg-cream dark:bg-darkblue text-burgundy dark:text-cream font-bold text-center"
              placeholder="Masukkan jumlah hari"
            />
            <span className="text-sm font-bold text-burgundy dark:text-cream">hari</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-burgundy dark:text-lightblue font-semibold">Cuti: {cutiDaysNum} hari</span>
            <span className="text-sm font-bold text-darkred dark:text-lightblue">
              📅 Potensi: {totalEstimate} hari off
            </span>
          </div>
        </div>

        {/* Estimate Card */}
        {totalEstimate > 0 && cutiDaysNum > 0 && (
          <div className="bg-darkred dark:bg-darkred/40 rounded-lg p-3 border-2 border-darkred flex items-center gap-3">
            <TrendingUp className="text-cream dark:text-cream flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-cream dark:text-cream">
                Maksimalkan liburan! 🎉
              </p>
              <p className="text-xs text-cream/90 dark:text-cream/80 font-medium">
                {cutiDaysNum} hari cuti bisa menjadi {totalEstimate} hari off jika direncanakan dengan baik
              </p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {cutiDaysNum > 0 && recommendations.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-bold text-burgundy dark:text-cream">💡 Rekomendasi Cuti:</p>
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-lightblue/30 dark:bg-lightblue/20 rounded-lg p-3 border-2 border-lightblue">
                <p className="text-xs font-bold text-darkblue dark:text-lightblue mb-1">
                  Opsi {idx + 1}: {rec.totalDaysOff} hari off
                </p>
                <p className="text-xs text-darkblue dark:text-lightblue font-semibold mb-1">
                  {rec.reason}
                </p>
                <p className="text-xs text-darkblue dark:text-lightblue font-bold">
                  {rec.dates.map(d => formatDateIndonesian(d)).join(', ')}
                </p>
              </div>
            ))}
          </div>
        ) : cutiDaysNum > 0 ? (
          <p className="text-sm text-burgundy dark:text-cream text-center py-4 font-semibold">
            Tidak ada rekomendasi untuk saat ini
          </p>
        ) : null}

        <p className="text-xs text-burgundy dark:text-lightblue pt-2 border-t-2 border-burgundy dark:border-darkred font-semibold">
          🎯 Tip: Ambil cuti sebelum atau sesudah hari libur untuk memaksimalkan waktu istirahat!
        </p>
      </div>
    </div>
  );
}
