import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const links = [
    { to: '/overview', label: 'Overview' },
    { to: '/repositories', label: 'Repositories' },
    { to: '/languages', label: 'Languages' },
    { to: '/activity', label: 'Activity' },
    { to: '/search', label: 'Search' },
  ];

  return (
    <nav className="sidebar">
      <h2 className="sidebar-title">GitHub Analyzer</h2>
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
    </nav>
  );
};

export default Sidebar;
