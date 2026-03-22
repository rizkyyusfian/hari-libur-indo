'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { getUser, signOut, onAuthStateChange } from '@/lib/auth';
import { Home, Calendar, FileText, LogOut, Menu, X, Moon, Sun, Shield, Loader2, Copyright, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ToastProvider } from '@/components/ui/toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    checkUser();

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/admin/login');
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, isLoginPage]);

  const checkUser = async () => {
    try {
      const currentUser = await getUser();
      if (!currentUser) {
        router.push('/admin/login');
        return;
      }
      setUser(currentUser);
    } catch {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const isDark = mounted && resolvedTheme === 'dark';

  // For login page, just render children without layout
  if (isLoginPage) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#003049] dark:text-[#669bbc] mx-auto mb-4" size={32} />
          <p className="text-[#003049] dark:text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/holidays', label: 'Hari Libur', icon: Calendar },
    { href: '/admin/documents', label: 'Dokumen', icon: FileText },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex">
        {/* Sidebar - Fixed on desktop, overlay on mobile */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-[#003049]/20 dark:border-slate-700
            transform transition-transform duration-300 ease-in-out flex flex-col
            lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[#003049]/10 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-[#003049] dark:text-[#669bbc]" />
              <div>
                <h1 className="text-lg font-bold text-[#003049] dark:text-[#669bbc]">
                  Admin Panel
                </h1>
                <p className="text-xs text-[#003049]/60 dark:text-gray-400">
                  Hari Libur Indo
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition
                    ${active
                      ? 'bg-[#003049] text-white dark:bg-[#669bbc] dark:text-white'
                      : 'text-[#003049] dark:text-gray-300 hover:bg-[#669bbc]/20 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#003049]/10 dark:border-slate-700">
            <a
              href="https://rizkyyusfian.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-xs text-[#003049]/60 dark:text-gray-500 hover:text-[#c1121f] dark:hover:text-[#669bbc] transition"
            >
              <Copyright size={12} />
              <span>MRYY 2026</span>
            </a>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Fixed Header - Only spans content area */}
          <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-[#003049]/20 dark:border-slate-700 px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Mobile menu */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#669bbc]/20 dark:hover:bg-slate-800"
              >
                {sidebarOpen ? (
                  <X size={24} className="text-[#003049] dark:text-gray-300" />
                ) : (
                  <Menu size={24} className="text-[#003049] dark:text-gray-300" />
                )}
              </button>

              {/* Left: View Site button (desktop) */}
              <Link
                href="/"
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#003049] dark:text-gray-300 hover:bg-[#669bbc]/20 dark:hover:bg-slate-800 transition"
              >
                <ExternalLink size={16} />
                <span>Lihat Situs</span>
              </Link>

              {/* Right: Theme toggle + User + Logout */}
              <div className="flex items-center gap-2">
                {/* View Site button (mobile) */}
                <Link
                  href="/"
                  className="lg:hidden p-2 rounded-lg hover:bg-[#669bbc]/20 dark:hover:bg-slate-800 transition"
                  title="Lihat Situs"
                >
                  <ExternalLink size={20} className="text-[#003049] dark:text-gray-300" />
                </Link>
                {mounted && (
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
                )}
                <div className="hidden sm:block text-sm text-[#003049]/70 dark:text-gray-400 px-2">
                  {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#c1121f]/10 text-[#c1121f] transition"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
