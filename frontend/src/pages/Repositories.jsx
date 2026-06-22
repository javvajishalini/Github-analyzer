import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Repositories.css';

const ChevronUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function Repositories() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || localStorage.getItem('git_analyzer_session');

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'stars', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedRepos, setBookmarkedRepos] = useState([]);
  const pageSize = 10;

  useEffect(() => {
    setBookmarkedRepos(JSON.parse(localStorage.getItem('git_analyzer_bookmarks_repos') || '[]'));
  }, []);

  const toggleBookmarkRepo = (repo) => {
    let saved = [...bookmarkedRepos];
    const isBookmarked = saved.some(r => r.name === repo.name);
    if (isBookmarked) {
      saved = saved.filter(r => r.name !== repo.name);
    } else {
      saved.push({ name: repo.name, owner: username, url: repo.htmlUrl });
    }
    localStorage.setItem('git_analyzer_bookmarks_repos', JSON.stringify(saved));
    setBookmarkedRepos(saved);
    window.dispatchEvent(new Event('bookmarksUpdated'));
  };

  useEffect(() => {
    if (!username) { setError('Please search for a GitHub user first.'); setLoading(false); return; }
    const fetchRepos = async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(`/api/github/repos/${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error('Failed to fetch repositories');
        setRepos(await res.json());
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchRepos();
  }, [username]);

  const sortedRepos = React.useMemo(() => {
    if (!repos) return [];
    const sortable = [...repos];
    const { key, direction } = sortConfig;
    sortable.sort((a, b) => {
      let aVal = a[key] ?? '';
      let bVal = b[key] ?? '';
      if (key === 'stars') { aVal = a.stars ?? a.stargazers_count ?? 0; bVal = b.stars ?? b.stargazers_count ?? 0; }
      if (key === 'forks') { aVal = a.forks ?? a.forks_count ?? 0; bVal = b.forks ?? b.forks_count ?? 0; }
      
      if (typeof aVal === 'string') return aVal.localeCompare(bVal) * (direction === 'asc' ? 1 : -1);
      return (aVal - bVal) * (direction === 'asc' ? 1 : -1);
    });
    return sortable;
  }, [repos, sortConfig]);

  const paginatedRepos = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRepos.slice(start, start + pageSize);
  }, [sortedRepos, currentPage]);

  const totalPages = Math.max(1, Math.ceil(sortedRepos.length / pageSize));

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />;
  };

  if (loading) {
    return (
      <div className="repositories-page-loading">
        <div className="spinner" />
        <p>Loading developer repositories...</p>
      </div>
    );
  }

  if (error || !username) {
    return (
      <div className="repositories-page-error">
        <p className="error">⚠️ {error}</p>
        <button className="search-redirect-btn" onClick={() => navigate('/search')}>
          Go to Search Page
        </button>
      </div>
    );
  }

  return (
    <div className="repositories-page">
      <div className="repositories-header">
        <div>
          <h2>@{username}'s Repositories</h2>
        </div>
        <span className="repo-count-badge">{repos.length} Repositories found</span>
      </div>

      <div className="table-container animate-fade-in">
        <table className="repo-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} className="sortable-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>Name {getSortIcon('name')}</div>
              </th>
              <th onClick={() => requestSort('language')} className="sortable-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>Language {getSortIcon('language')}</div>
              </th>
              <th onClick={() => requestSort('stars')} className="sortable-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>Stars {getSortIcon('stars')}</div>
              </th>
              <th onClick={() => requestSort('forks')} className="sortable-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>Forks {getSortIcon('forks')}</div>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRepos.map((repo) => (
              <tr key={repo.name}>
                <td>
                  <span className="repo-table-name">{repo.name}</span>
                  {repo.description && <p className="repo-table-desc">{repo.description}</p>}
                </td>
                <td>
                  <span className="repo-lang-badge">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', opacity: 0.5 }}></span>
                    {repo.language || 'Plain Text'}
                  </span>
                </td>
                <td className="star-cell">★ {repo.stars}</td>
                <td className="fork-cell">⎇ {repo.forks}</td>
                <td style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" className="view-link">
                    View ↗
                  </a>
                  <button 
                    onClick={() => toggleBookmarkRepo(repo)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: bookmarkedRepos.some(r => r.name === repo.name) ? '#fbbf24' : 'var(--text-muted)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s ease',
                    }}
                    title="Bookmark Repository"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarkedRepos.some(r => r.name === repo.name) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {paginatedRepos.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No repositories available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination animate-fade-in">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="pagination-btn"
          >
            ‹ Prev
          </button>
          <span className="pagination-info">
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="pagination-btn"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
