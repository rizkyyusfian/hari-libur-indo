'use client';

import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Language, detectUserLanguage } from '@/lib/i18n';

interface LanguageSwitcherProps {
  onLanguageChange?: (lang: Language) => void;
}

export function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
  const [language, setLanguage] = useState<Language>('id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = (localStorage.getItem('language') as Language) || detectUserLanguage();
    setLanguage(savedLang);
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLang: Language = language === 'id' ? 'en' : 'id';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    onLanguageChange?.(newLang);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }));
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
      title={`Switch to ${language === 'id' ? 'English' : 'Indonesian'}`}
    >
      <Globe size={18} />
      <span className="hidden sm:inline">{language.toUpperCase()}</span>
    </button>
  );
}
