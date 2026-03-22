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
<<<<<<< HEAD
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
=======
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
>>>>>>> main
  };

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
<<<<<<< HEAD
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
=======
    <header className="bg-cream dark:bg-darkblue border-b-4 border-burgundy dark:border-darkred shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-burgundy dark:text-cream">
            🇮🇩 Hari Libur Indo
          </h1>
          <p className="text-sm text-darkred dark:text-lightblue hidden sm:block font-semibold">
>>>>>>> main
            Papua Barat Daya
          </p>
        </div>

        <div className="flex items-center gap-2">
<<<<<<< HEAD
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-[#669bbc]/20 dark:hover:bg-slate-800 transition"
=======
          <LanguageSwitcher />

          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-cream dark:text-cream bg-burgundy dark:bg-darkred hover:opacity-80 transition">
            <LogIn size={18} />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-burgundy/20 dark:hover:bg-lightblue/20 transition text-burgundy dark:text-lightblue"
>>>>>>> main
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={20} />
            ) : (
<<<<<<< HEAD
              <Moon size={20} className="text-[#003049]" />
=======
              <Moon size={20} />
>>>>>>> main
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
