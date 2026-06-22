import React, { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('git_analyzer_theme') || localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const classList = document.documentElement.classList;
    if (dark) {
      classList.remove('light');
      classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      classList.remove('dark');
      classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
    localStorage.setItem('git_analyzer_theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      className="theme-toggle-btn"
      onClick={() => setDark(!dark)}
      aria-label="Toggle dark mode"
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
