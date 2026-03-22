'use client';

import { Github, Globe, Heart, MapPin, Code, Moon, Sun, Copyright, Info, User2 } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { LanguageSwitcher } from '@/components/language-switcher';

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
            <LanguageSwitcher />
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
                <strong>Hari Libur Indo</strong> adalah project web app yang menampilkan kalender hari libur 
                nasional dan regional Indonesia, khususnya untuk wilayah Papua Barat Daya.
              </p>
              <p className="text-[#003049]/80 dark:text-gray-300 leading-relaxed mt-4">
                Beberapa fitur meliputi:
              </p>
              <ul className="text-[#003049]/80 dark:text-gray-300 mt-2 space-y-2">
                <li>- Kalender interaktif dengan tampilan bulanan dan tahunan</li>
                <li>- Daftar long weekend untuk perencanaan liburan</li>
                <li>- Download kalender dalam format PDF dan gambar</li>
              </ul>
            </div>
          </section>

          {/* Why This Website */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#003049] dark:text-[#669bbc] flex items-center gap-2 mb-4">
              <Heart size={20} />
              Kenapa Website Ini Dibuat ?
            </h2>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-[#003049]/10 dark:border-slate-700">
              <p className="text-[#003049]/80 dark:text-gray-300 leading-relaxed">
                Website ini dibuat karena saya gabut saat mudik lebaran Idul Fitri 2026 (1447H).
                Inspirasi terbesar dalam memulai project ini adalah karena saya pusing dalam memikirkan timing yang pas buat ambil cuti.
                Saya ingin membuat sebuah tool yang bisa membantu saya dan orang lain dalam merencanakan liburan dengan lebih baik, terutama untuk memanfaatkan long weekend.
              </p>
            </div>
          </section>

          {/* Why Papua Barat Daya */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#003049] dark:text-[#669bbc] flex items-center gap-2 mb-4">
              <MapPin size={20} />
              Kenapa Papua Barat Daya ?
            </h2>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-[#003049]/10 dark:border-slate-700">
              <p className="text-[#003049]/80 dark:text-gray-300 leading-relaxed">
                Ya, karena saat website ini dibuat (2026), saya berdomisili di provinsi Papua Barat Daya.
                dan juga karena banyaknya libur fakultatif yang hanya berlaku untuk wilayah Papua Barat Daya, 
                seperti Hari Ulang Tahun Provinsi Papua Barat Daya (22 Desember) dan beberapa hari libur keagamaan yang memiliki perayaan khusus di wilayah ini.
                hari libur fakultatif ini seringkali tidak dicatat di kalender nasional. sehingga sulit untuk di track.
              </p>
            </div>
          </section>

          {/* Source Code */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#003049] dark:text-[#669bbc] flex items-center gap-2 mb-4">
              <Code size={20} />
              Source Code
            </h2>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-[#003049]/10 dark:border-slate-700">
              <p className="text-[#003049]/80 dark:text-gray-300 leading-relaxed">
                Project Web app ini dibuat dengan 95% vibe coding sambil nunggu buka puasa. sementara 5% sisanya ya untuk ngerapihin dan finals touch doang.
                Tech stack yang dipakai:
              </p>
              <ul className="text-[#003049]/80 dark:text-gray-300 mt-2 space-y-1">
                <li>Copilot CLI</li>
                <li>Next.js</li>
                <li>Tailwind CSS</li>
                <li>Supabase</li>
              </ul>
              <div className="mt-6">
                <a
                  href="https://github.com/rizkyyusfian/hari-libur-indo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#003049] dark:bg-[#669bbc] text-white rounded-lg hover:opacity-90 transition"
                >
                  <Github size={18} />
                  Lihat di GitHub
                </a>
              </div>
            </div>
          </section>

          {/* Author */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#003049] dark:text-[#669bbc] flex items-center gap-2 mb-4">
              <User2 size={20} />
              Author
            </h2>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-[#003049]/10 dark:border-slate-700">
              <p className="text-[#003049]/80 dark:text-gray-300 leading-relaxed">
                Project ini dibuat oleh <strong>Rizky Yusfian</strong>. Software Engineer washed karena AI. jadi sekarang lagi ngulik dev-ops sama networking hehe.
              </p>
              <div className="mt-6">
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
