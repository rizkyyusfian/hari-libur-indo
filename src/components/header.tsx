'use client';

import { Moon, Sun, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    root.classList.toggle('dark');
    setIsDark(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  if (!mounted) return null;

  return (
    <header className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            🇮🇩 Hari Libur Indo
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
            Papua Barat Daya
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
            <LogIn size={18} />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
