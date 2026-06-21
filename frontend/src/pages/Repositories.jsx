import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Repositories.css';

export default function Repositories() {
  const location = useLocation();
  const navigate = useNavigate();

  // Resolve target username: state, then logged-in session, then null
  const username = location.state?.username || localStorage.getItem('git_analyzer_session');

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'stars', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!username) {
      setError('Please search for a GitHub user first.');
      setLoading(false);
      return;
    }
    const fetchRepos = async () => {
      try {
        setLoading(true);
        setError(null);
        // Correct endpoint matching GitHubController.java (@GetMapping("/repos/{username}"))
        const res = await fetch(`/api/github/repos/${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error('Failed to fetch repositories');
        const json = await res.json();
        setRepos(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
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

      // Support fallback fields from DTO (e.g. stars maps to stargazers_count if not present)
      if (key === 'stars' && a.stars === undefined) aVal = a.stargazers_count ?? 0;
      if (key === 'stars' && b.stars === undefined) bVal = b.stargazers_count ?? 0;
      if (key === 'forks' && a.forks === undefined) aVal = a.forks_count ?? 0;
      if (key === 'forks' && b.forks === undefined) bVal = b.forks_count ?? 0;

      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * (direction === 'asc' ? 1 : -1);
      }
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
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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
        <h2>@{username}'s Repositories</h2>
        <span className="repo-count-badge">{repos.length} Repositories found</span>
      </div>

      <div className="table-container animate-fade-in">
        <table className="repo-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} className="sortable-header">
                Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => requestSort('language')} className="sortable-header">
                Language {sortConfig.key === 'language' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => requestSort('stars')} className="sortable-header">
                Stars {sortConfig.key === 'stars' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => requestSort('forks')} className="sortable-header">
                Forks {sortConfig.key === 'forks' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th>Link</th>
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
                  <span className="repo-lang-badge">{repo.language || 'Plain Text'}</span>
                </td>
                <td className="star-cell">★ {repo.stars}</td>
                <td className="fork-cell">⎇ {repo.forks}</td>
                <td>
                  <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" className="view-link">
                    View on GitHub ↗
                  </a>
                </td>
              </tr>
            ))}
            {paginatedRepos.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-p)' }}>
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
