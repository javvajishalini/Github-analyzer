import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

/* Page title map */
const PAGE_TITLES = {
  '/overview':      { label: 'Overview',      icon: '▦' },
  '/repositories':  { label: 'Repositories',  icon: '⊞' },
  '/languages':     { label: 'Languages',     icon: '◎' },
  '/activity':      { label: 'Activity',      icon: '〜' },
  '/compare':       { label: 'Compare',       icon: '⇌' },
  '/achievements':  { label: 'Achievements',  icon: '🏅' },
  '/export':        { label: 'Export',        icon: '⬇' },
  '/search':        { label: 'Search',        icon: '🔍' },
};

export default function Header() {
  const currentUser = localStorage.getItem('git_analyzer_session');
  const location = useLocation();
  const navigate = useNavigate();
  const pageInfo = PAGE_TITLES[location.pathname] || { label: 'Dashboard', icon: '▦' };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2rem',
      height: '64px',
      background: 'var(--header-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxSizing: 'border-box',
      gap: '1rem',
    }}>

      {/* Left: breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {/* Page breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(37, 99, 235, 0.08)',
          border: '1px solid rgba(37, 99, 235, 0.15)',
          borderRadius: '10px',
          padding: '5px 12px',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.9rem' }}>{pageInfo.icon}</span>
          <span className="hide-mobile">{pageInfo.label}</span>
        </div>

        {currentUser && (
          <>
            <span style={{ color: 'var(--border-color)', fontSize: '1.1rem' }}>›</span>
            <span
              style={{
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#60a5fa',
                background: 'rgba(37,99,235,0.07)',
                border: '1px solid rgba(37,99,235,0.15)',
                padding: '3px 10px',
                borderRadius: '20px',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '160px',
                transition: 'background 0.2s',
              }}
              onClick={() => navigate('/search')}
              title={`@${currentUser} — click to search another user`}
            >
              @{currentUser}
            </span>
          </>
        )}
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Live badge */}
        <div
          className="hide-mobile"
          style={{
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
            width: 6, height: 6,
            borderRadius: '50%',
            background: '#10b981',
            display: 'inline-block',
            boxShadow: '0 0 6px #10b981',
            animation: 'pulse-glow 2s infinite',
          }} />
          Live
        </div>

        {/* Quick search button */}
        <button
          onClick={() => navigate('/search')}
          title="Search user"
          style={{
            background: 'rgba(148,163,184,0.07)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(37,99,235,0.1)';
            e.currentTarget.style.color = '#60a5fa';
            e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(148,163,184,0.07)';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          🔍
        </button>

        <DarkModeToggle />
      </div>
    </header>
  );
}
