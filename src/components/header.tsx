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
    const newIsDark = !isDark;
    
    if (newIsDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    setIsDark(newIsDark);
  };

  if (!mounted) return null;

  return (
    <header className="bg-cream dark:bg-darkblue border-b-4 border-burgundy dark:border-darkred shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-burgundy dark:text-cream">
            🇮🇩 Hari Libur Indo
          </h1>
          <p className="text-sm text-darkred dark:text-lightblue hidden sm:block font-semibold">
            Papua Barat Daya
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-cream dark:text-cream bg-burgundy dark:bg-darkred hover:opacity-80 transition">
            <LogIn size={18} />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-burgundy/20 dark:hover:bg-lightblue/20 transition text-burgundy dark:text-lightblue"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
