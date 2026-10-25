import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="border-b border-line bg-background/95 backdrop-blur-sm">
      <a
        href="#main-content"
        className="focus-ring fixed left-3 top-3 z-50 -translate-y-20 rounded-lg bg-surface-strong px-4 py-2 text-sm font-bold text-background focus:translate-y-0"
      >
        Lewati ke konten utama
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="focus-ring group flex min-w-0 items-center gap-3 rounded-xl">
          <span className="surface-transition grid size-11 shrink-0 -rotate-3 place-items-center rounded-xl bg-primary text-sm font-black tabular-nums text-white shadow-[3px_3px_0_var(--ink)] group-hover:rotate-0 dark:shadow-[3px_3px_0_var(--accent)]">
            17
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-extrabold tracking-[-0.035em] text-foreground sm:text-lg">
              Hari Libur Indonesia
            </span>
            <span className="block text-xs font-semibold text-muted">Papua Barat Daya</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
