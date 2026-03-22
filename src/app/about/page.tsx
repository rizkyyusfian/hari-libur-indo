'use client';

import { Github, Globe, Heart, MapPin, Code, Moon, Sun, Copyright, Info } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function AboutPage() {
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
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-[#003049]/10 dark:border-slate-700 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl">📅</span>
            <h1 className="text-xl font-bold text-[#c1121f] dark:text-[#669bbc]">
              Hari Libur Indonesia
            </h1>
          </Link>
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

      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          {/* About Website */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#003049] dark:text-[#669bbc] flex items-center gap-2 mb-4">
              <Globe size={20} />
              Tentang Website Ini
            </h2>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-[#003049]/10 dark:border-slate-700">
              <p className="text-[#003049]/80 dark:text-gray-300 leading-relaxed">
                <strong>Hari Libur Indo</strong> adalah side project yang nunjukin kalender hari libur 
                nasional + regional Indonesia, fokus ke wilayah Papua Barat Daya. Simple tapi powerful.
              </p>
              <p className="text-[#003049]/80 dark:text-gray-300 leading-relaxed mt-4">
                Fitur-fitur yang ada:
              </p>
              <ul className="text-[#003049]/80 dark:text-gray-300 mt-2 space-y-2">
                <li>• Kalender interaktif (bulanan & tahunan view)</li>
                <li>• List long weekend buat planning liburan</li>
                <li>• Export kalender ke PDF/gambar</li>
              </ul>
            </div>
          </section>

          {/* Why This Website */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#003049] dark:text-[#669bbc] flex items-center gap-2 mb-4">
              <Heart size={20} />
              Kenapa Bikin Ini?
            </h2>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-[#003049]/10 dark:border-slate-700">
              <p className="text-[#003049]/80 dark:text-gray-300 leading-relaxed">
                Jadi gini, project ini lahir pas lagi gabut mudik lebaran Idul Fitri 2026 (1447H). 
                Trigger utamanya? Pusing mikirin kapan waktu yang pas buat ambil cuti biar dapet long weekend maksimal. 
                Jadinya ya bikin aja tool yang bisa bantu planning liburan dengan lebih proper.
              </p>
            </div>
          </section>

          {/* Why Papua Barat Daya */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#003049] dark:text-[#669bbc] flex items-center gap-2 mb-4">
              <MapPin size={20} />
              Kenapa Papua Barat Daya?
            </h2>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-[#003049]/10 dark:border-slate-700">
              <p className="text-[#003049]/80 dark:text-gray-300 leading-relaxed">
                Simple, karena pas bikin web ini (2026) gue lagi stay di Papua Barat Daya. 
                Plus, banyak libur fakultatif khusus daerah sini yang sering gak ke-track di kalender nasional — 
                kayak HUT Provinsi Papua Barat Daya (22 Desember) dan beberapa hari libur keagamaan. 
                Sayang kan kalau missed.
              </p>
            </div>
          </section>

          {/* Open Source & Author */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#003049] dark:text-[#669bbc] flex items-center gap-2 mb-4">
              <Code size={20} />
              Open Source & Author
            </h2>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-[#003049]/10 dark:border-slate-700">
              <p className="text-[#003049]/80 dark:text-gray-300 leading-relaxed">
                Project ini 95% vibe coding sambil nunggu buka puasa, 5% sisanya buat polishing doang. 
                Built with modern tech stack:
              </p>
              <ul className="text-[#003049]/80 dark:text-gray-300 mt-2 space-y-1">
                <li>• Copilot CLI (AI-assisted dev ftw)</li>
                <li>• Next.js 15</li>
                <li>• Tailwind CSS v4</li>
                <li>• Supabase</li>
              </ul>
              
              <div className="border-t border-[#003049]/10 dark:border-slate-700 mt-6 pt-6">
                <p className="text-[#003049]/80 dark:text-gray-300 leading-relaxed">
                  Made by <strong>Rizky Yusfian</strong> — Software Engineer yang lagi pivoting ke DevOps & networking 
                  karena AI makin jago ngoding. Adaptasi atau punah, kan?
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href="https://github.com/rizkyyusfian/hari-libur-indo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#003049] dark:bg-[#669bbc] text-white rounded-lg hover:opacity-90 transition"
                >
                  <Github size={18} />
                  GitHub Repo
                </a>
                <a
                  href="https://rizkyyusfian.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#003049]/20 dark:border-slate-600 text-[#003049] dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  <Globe size={18} />
                  rizkyyusfian.dev
                </a>
              </div>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#003049]/10 dark:border-slate-800 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[#003049]/70 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-1 hover:text-[#c1121f] dark:hover:text-[#669bbc] transition"
              >
                <Info size={14} />
                <span>Beranda</span>
              </Link>
            </div>
            <div className="text-center">
              <p>Hari Libur Indonesia - Papua Barat Daya</p>
            </div>
            <a
              href="https://rizkyyusfian.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#c1121f] dark:hover:text-[#669bbc] transition"
            >
              <Copyright size={14} />
              <span>MRYY 2026</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
