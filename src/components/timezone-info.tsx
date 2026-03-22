'use client';

import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentTimezone, formatTimeWithTimezone } from '@/lib/timezone';

export function TimezoneInfo() {
  const [time, setTime] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateTime = () => {
      const now = new Date();
      const tz = getCurrentTimezone();
      setTimezone(tz.code);
      setTime(formatTimeWithTimezone(now, tz));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Clock size={16} className="text-[#669bbc]" />
        <p className="text-xs font-medium text-[#003049] dark:text-gray-400">Zona Waktu Anda</p>
      </div>
      <p className="text-sm font-mono font-semibold text-[#003049] dark:text-gray-100">
        {time}
      </p>
      <p className="text-xs text-[#003049]/70 dark:text-gray-400 mt-1">
        {timezone === 'WIB' && 'Waktu Indonesia Barat'}
        {timezone === 'WITA' && 'Waktu Indonesia Tengah'}
        {timezone === 'WIT' && 'Waktu Indonesia Timur'}
      </p>
    </div>
  );
}
