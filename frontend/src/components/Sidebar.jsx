import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('git_analyzer_session');

  const links = [
    { to: '/overview', label: 'Overview' },
    { to: '/repositories', label: 'Repositories' },
    { to: '/languages', label: 'Languages' },
    { to: '/activity', label: 'Activity' },
    { to: '/search', label: 'Search' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('git_analyzer_session');
    localStorage.removeItem('git_analyzer_history');
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      <h2 className="sidebar-title">GitHub Analyzer</h2>
      {currentUser && (
        <div className="sidebar-user" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', opacity: 0.8, color: 'var(--text-h)' }}>
          Logged in as <strong>@{currentUser}</strong>
        </div>
      )}
      <ul className="sidebar-list">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <button onClick={handleLogout} className="sidebar-logout-btn" style={{
        marginTop: 'auto',
        background: 'rgba(244, 63, 94, 0.1)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        borderRadius: '8px',
        color: '#f43f5e',
        padding: '0.8rem 1rem',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background 0.3s'
      }}
      onMouseEnter={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.2)'}
      onMouseLeave={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.1)'}
      >
        Logout 🚪
      </button>
    </nav>
  );
};

export default Sidebar;
