import React from 'react';
import DarkModeToggle from './DarkModeToggle';

export default function Header() {
  const currentUser = localStorage.getItem('git_analyzer_session');

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2.5rem',
      height: '64px',
      background: 'var(--header-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxSizing: 'border-box',
    }}>
      {/* Left: breadcrumb / greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {currentUser ? (
          <>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Welcome back,
            </span>
            <span style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              background: 'rgba(37,99,235,0.1)',
              border: '1px solid rgba(37,99,235,0.2)',
              padding: '3px 10px',
              borderRadius: '20px',
              letterSpacing: '0.01em',
            }}>
              @{currentUser}
            </span>
          </>
        ) : (
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            GitHub Analyzer Dashboard
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Live badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)',
          fontSize: '0.73rem',
          fontWeight: 600,
          color: '#34d399',
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#10b981',
            display: 'inline-block',
            boxShadow: '0 0 6px #10b981',
          }} />
          Live
        </div>
        <DarkModeToggle />
      </div>
    </header>
  );
}
