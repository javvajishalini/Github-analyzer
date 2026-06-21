import React, { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const classList = document.documentElement.classList;
    if (dark) {
      classList.add('dark');
    } else {
      classList.remove('dark');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      style={{
        background: 'none',
        border: '1px solid var(--text)',
        borderRadius: '4px',
        color: 'var(--text)',
        padding: '0.3rem 0.6rem',
        cursor: 'pointer',
      }}
      aria-label="Toggle dark mode"
    >
      {dark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
