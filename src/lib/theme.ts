export type Theme = 'light' | 'dark' | 'system';

export const setTheme = (theme: Theme): void => {
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
    localStorage.removeItem('theme');
  } else {
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }
};

export const getTheme = (): Theme => {
  const saved = localStorage.getItem('theme') as Theme | null;
  if (saved) return saved;

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const initTheme = (): void => {
  const theme = getTheme();
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};
