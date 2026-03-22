'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function Header() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-[#003049]/10 dark:border-slate-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl">📅</span>
            <h1 className="text-2xl font-bold text-[#c1121f] dark:text-[#669bbc]">
              Hari Libur Indonesia
            </h1>
          </Link>
          <p className="text-sm text-[#003049] dark:text-gray-400 hidden sm:block">
            Papua Barat Daya
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-[#669bbc]/20 dark:hover:bg-slate-800 transition"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-[#003049]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
