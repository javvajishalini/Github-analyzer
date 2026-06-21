import React from 'react';
import DarkModeToggle from './DarkModeToggle';

export default function Header() {
  const currentUser = localStorage.getItem('git_analyzer_session');

  return (
    <header className="app-header" style={{
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1.2rem 2.5rem', 
      background: 'var(--header-bg, rgba(255, 255, 255, 0.01))', 
      borderBottom: '1px solid var(--border-color)',
      color: 'var(--text-h)',
      marginLeft: '240px',
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      backdropFilter: 'blur(12px)',
      zIndex: 10
    }}>
      <div>
        {currentUser ? (
          <span style={{ fontSize: '0.95rem', color: 'var(--text-p)' }}>
            Welcome back, <strong style={{ color: 'var(--text-h)' }}>@{currentUser}</strong>!
          </span>
        ) : (
          <span style={{ fontSize: '0.95rem', color: 'var(--text-p)' }}>GitHub Analyzer Dashboard</span>
        )}
      </div>
      <DarkModeToggle />
    </header>
  );
}
