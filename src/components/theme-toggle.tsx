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
      className={`inline-flex size-11 items-center justify-center rounded-lg transition hover:bg-[#669bbc]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#669bbc] focus-visible:ring-offset-2 disabled:cursor-wait dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900 ${className}`}
      aria-label={isDark ? 'Gunakan tema terang' : 'Gunakan tema gelap'}
    >
      {!mounted ? (
        <span className="size-5" aria-hidden="true" />
      ) : isDark ? (
        <Sun size={20} className="text-yellow-400" aria-hidden="true" />
      ) : (
        <Moon size={20} className="text-[#003049]" aria-hidden="true" />
      )}
    </button>
  );
}
