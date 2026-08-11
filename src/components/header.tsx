import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-[#003049]/10 dark:border-slate-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl">📅</span>
            <span className="text-2xl font-bold text-[#c1121f] dark:text-[#8ecae6]">
              Hari Libur Indonesia
            </span>
          </Link>
          <p className="text-sm text-[#003049] dark:text-gray-400 hidden sm:block">
            Papua Barat Daya
          </p>
        </div>

        <div className="flex items-center gap-2">
        <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
