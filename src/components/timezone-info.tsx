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
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Clock size={16} className="text-purple-500" />
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Zona Waktu Anda</p>
      </div>
      <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
        {time}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {timezone === 'WIB' && '🏛️ Waktu Indonesia Bagian Barat (Pulau Jawa)'}
        {timezone === 'WITA' && '🏝️ Waktu Indonesia Bagian Tengah (Sulawesi, Bali)'}
        {timezone === 'WIT' && '🗻 Waktu Indonesia Bagian Timur (Papua, Maluku)'}
      </p>
    </div>
  );
}
