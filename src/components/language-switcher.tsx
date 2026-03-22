'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: string) => {
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    setIsOpen(false);
  };

  return (
<<<<<<< HEAD
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#003049] dark:text-gray-300 hover:bg-[#669bbc]/20 dark:hover:bg-slate-800 transition"
      title={`Switch to ${language === 'id' ? 'English' : 'Indonesian'}`}
    >
      <Globe size={18} />
      <span className="hidden sm:inline">{language.toUpperCase()}</span>
    </button>
=======
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-lg border-2 border-burgundy dark:border-darkred bg-cream dark:bg-darkblue text-burgundy dark:text-cream font-bold hover:bg-burgundy/10 dark:hover:bg-darkred/10 transition flex items-center gap-2"
      >
        <Globe size={18} />
        <span className="hidden sm:inline">Bahasa</span>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 z-50 bg-cream dark:bg-darkblue border-2 border-burgundy dark:border-darkred rounded-lg shadow-xl p-2 space-y-1 min-w-max">
          <button
            onClick={() => handleLanguageChange('id')}
            className="block w-full text-left px-3 py-2 rounded-lg font-bold text-burgundy dark:text-cream hover:bg-lightblue/30 dark:hover:bg-lightblue/20 transition"
          >
            🇮🇩 Bahasa Indonesia
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className="block w-full text-left px-3 py-2 rounded-lg font-bold text-burgundy dark:text-cream hover:bg-lightblue/30 dark:hover:bg-lightblue/20 transition"
          >
            🇬🇧 English
          </button>
        </div>
      )}
    </div>
>>>>>>> main
  );
}
