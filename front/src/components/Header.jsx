import React from 'react';
import DarkModeToggle from './DarkModeToggle';

export default function Header() {
  return (
    <header className="app-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'var(--accent-bg)', color: 'var(--text-h)'}}>
      <h1 style={{margin: 0, fontSize: '1.5rem'}}>GitHub Analyzer</h1>
      <DarkModeToggle />
    </header>
  );
}
