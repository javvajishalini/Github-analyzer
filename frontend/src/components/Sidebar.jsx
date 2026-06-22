import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Sidebar.css';

/* ── Custom SVG Logo ────────────────────────────── */
const AnalyzerLogo = () => (
  <svg
    className="sidebar-logo"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="GitHub Analyzer logo"
  >
    {/* Octocat-inspired head shape */}
    <circle cx="18" cy="13" r="9" fill="url(#logoGrad)" />
    {/* Cat ears */}
    <polygon points="11,7 8,3 14,6" fill="url(#logoGrad)" />
    <polygon points="25,7 28,3 22,6" fill="url(#logoGrad)" />
    {/* Eyes */}
    <circle cx="15" cy="12" r="1.4" fill="white" fillOpacity="0.9" />
    <circle cx="21" cy="12" r="1.4" fill="white" fillOpacity="0.9" />
    {/* Tentacles / body */}
    <path d="M12 20 Q10 26 9 32" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M18 22 Q18 27 18 33" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M24 20 Q26 26 27 32" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Analytics bar chart overlay */}
    <rect x="13" y="17" width="3" height="5" rx="1" fill="white" fillOpacity="0.75"/>
    <rect x="17" y="14" width="3" height="8" rx="1" fill="white" fillOpacity="0.95"/>
    <rect x="21" y="19" width="3" height="3" rx="1" fill="white" fillOpacity="0.6"/>
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB"/>
        <stop offset="100%" stopColor="#7C3AED"/>
      </linearGradient>
    </defs>
  </svg>
);

/* ── Nav Icon components ────────────────────────── */
const IconOverview = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconRepos = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h18v18H3z" rx="2"/><path d="M3 9h18M9 21V9"/>
  </svg>
);
const IconLanguages = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    <path d="M2 12h20"/>
  </svg>
);
const IconActivity = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ── Nav links config ───────────────────────────── */
const links = [
  { to: '/overview',     label: 'Overview',      Icon: IconOverview },
  { to: '/repositories', label: 'Repositories',  Icon: IconRepos },
  { to: '/languages',    label: 'Languages',      Icon: IconLanguages },
  { to: '/activity',     label: 'Activity',       Icon: IconActivity },
  { to: '/search',       label: 'Search',         Icon: IconSearch },
];

/* ── Sidebar Component ──────────────────────────── */
const Sidebar = () => {
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('git_analyzer_session');
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    const close = () => setIsOpen(false);
    window.addEventListener('popstate', close);
    return () => window.removeEventListener('popstate', close);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('git_analyzer_session');
    localStorage.removeItem('git_analyzer_history');
    navigate('/login');
  };

  const closeSidebar = () => setIsOpen(false);

  // Get initials for avatar
  const initials = currentUser
    ? currentUser.slice(0, 2).toUpperCase()
    : 'GA';

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <IconClose /> : <IconMenu />}
      </button>

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay${isOpen ? ' visible' : ''}`}
        onClick={closeSidebar}
      />

      {/* Main sidebar */}
      <nav className={`sidebar${isOpen ? ' open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <AnalyzerLogo />
          <div>
            <div className="sidebar-brand-name">GitHub Analyzer</div>
            <div className="sidebar-brand-sub">Developer Insights</div>
          </div>
        </div>

        {/* Current user chip */}
        {currentUser && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-label">Signed in as</div>
              <div className="sidebar-user-name">@{currentUser}</div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <div className="sidebar-section">
          <div className="sidebar-section-label">Navigation</div>
          <ul className="sidebar-list">
            {links.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-link active' : 'sidebar-link'
                  }
                >
                  <span className="sidebar-link-icon">
                    <Icon />
                  </span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
          >
            <IconLogout />
            Sign Out
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
