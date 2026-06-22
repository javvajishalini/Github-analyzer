import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import './Sidebar.css';



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
const IconBookmark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);
const IconCompare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h5v5M4 21h5v-5M16 21h5v-5M4 3h5v5M9 8l6 8M9 16l6-8"/>
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
  { to: '/compare',      label: 'Compare',        Icon: IconCompare },
  { to: '/search',       label: 'Search',         Icon: IconSearch },
];

/* ── Sidebar Component ──────────────────────────── */
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bookmarkedUsers, setBookmarkedUsers] = useState([]);
  const [bookmarkedRepos, setBookmarkedRepos] = useState([]);
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('git_analyzer_session');

  const loadBookmarks = () => {
    setBookmarkedUsers(JSON.parse(localStorage.getItem('git_analyzer_bookmarks_users') || '[]'));
    setBookmarkedRepos(JSON.parse(localStorage.getItem('git_analyzer_bookmarks_repos') || '[]'));
  };

  useEffect(() => {
    loadBookmarks();
    window.addEventListener('bookmarksUpdated', loadBookmarks);
    const close = () => setIsOpen(false);
    window.addEventListener('popstate', close);
    return () => {
      window.removeEventListener('bookmarksUpdated', loadBookmarks);
      window.removeEventListener('popstate', close);
    };
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
          <Logo className="sidebar-logo" />
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

        {/* Main Links */}
        <div className="sidebar-links" style={{ padding: '0', margin: '0' }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeSidebar}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-link-icon">
                <link.Icon />
              </span>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Bookmarks Section */}
        {(bookmarkedUsers.length > 0 || bookmarkedRepos.length > 0) && (
          <div className="sidebar-bookmarks" style={{ padding: '0 1.5rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Bookmarks</h4>
            
            {bookmarkedUsers.length > 0 && (
              <div className="bookmark-group" style={{ marginBottom: '1rem' }}>
                {bookmarkedUsers.map((u, i) => (
                  <div key={i} onClick={() => {
                    navigate('/overview', { state: { username: u.username } });
                    setIsOpen(false);
                  }} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <img src={u.avatarUrl} alt="av" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{u.username}</span>
                  </div>
                ))}
              </div>
            )}

            {bookmarkedRepos.length > 0 && (
              <div className="bookmark-group">
                {bookmarkedRepos.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '6px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <IconBookmark />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="sidebar-spacer" style={{ flexGrow: 1 }} />
        
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
