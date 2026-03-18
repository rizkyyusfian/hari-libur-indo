'use client';

import { Moon, Sun, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LanguageSwitcher } from './language-switcher';
import { setTheme, getTheme } from '@/lib/theme';

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const theme = getTheme();
    setIsDark(theme === 'dark');
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    setTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <header className="bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-800 border-b border-purple-200 dark:border-purple-900/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            🇮🇩 Hari Libur Indo
          </h1>
          <p className="text-sm text-purple-600 dark:text-purple-300 hidden sm:block">
            Papua Barat Daya
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition">
            <LogIn size={18} />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={20} className="text-amber-400" />
            ) : (
              <Moon size={20} className="text-purple-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
