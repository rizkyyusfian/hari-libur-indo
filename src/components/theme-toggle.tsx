'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/lib/use-mounted';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      disabled={!mounted}
      className={`focus-ring surface-transition inline-flex size-11 items-center justify-center rounded-xl border border-line bg-surface text-foreground hover:-translate-y-0.5 hover:border-info hover:bg-info-soft disabled:cursor-wait disabled:opacity-60 ${className}`}
      aria-label={isDark ? 'Gunakan tema terang' : 'Gunakan tema gelap'}
    >
      {!mounted ? (
        <span className="size-5" aria-hidden="true" />
      ) : isDark ? (
        <Sun size={20} className="text-accent" aria-hidden="true" />
      ) : (
        <Moon size={20} className="text-foreground" aria-hidden="true" />
      )}
    </button>
  );
}
