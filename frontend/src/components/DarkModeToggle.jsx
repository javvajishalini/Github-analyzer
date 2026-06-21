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
      onClick={() => setDark(!dark)}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid var(--border-color)',
        borderRadius: '50%',
        color: 'var(--text-h)',
        width: '38px',
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '1.1rem',
        transition: 'background 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
        e.target.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
        e.target.style.transform = 'scale(1)';
      }}
      aria-label="Toggle dark mode"
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
