'use client';

import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentTimezone, formatTimeWithTimezone } from '@/lib/timezone';
import { useMounted } from '@/lib/use-mounted';

export function TimezoneInfo() {
  const [time, setTime] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const mounted = useMounted();

  useEffect(() => {
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
    <section className="rounded-2xl border border-line bg-surface p-4 pop-shadow" aria-labelledby="timezone-title">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-info text-white">
          <Clock size={16} aria-hidden="true" />
        </span>
        <p id="timezone-title" className="text-xs font-extrabold uppercase tracking-[0.12em] text-info">Zona Waktu Anda</p>
      </div>
      <p className="font-mono text-sm font-bold tabular-nums text-foreground">
        {time}
      </p>
      <p className="mt-1 text-xs font-medium text-muted">
        {timezone === 'WIB' && 'Waktu Indonesia Barat'}
        {timezone === 'WITA' && 'Waktu Indonesia Tengah'}
        {timezone === 'WIT' && 'Waktu Indonesia Timur'}
      </p>
    </section>
  );
}
