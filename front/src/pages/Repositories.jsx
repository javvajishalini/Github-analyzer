import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Repositories.css';

export default function Repositories() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || '';

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'stargazers_count', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!username) {
      setError('Username not provided. Please search first.');
      setLoading(false);
      return;
    }
    const fetchRepos = async () => {
      try {
        const res = await fetch(`/api/github/user/${username}/repos`);
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
      const aVal = a[key] ?? '';
      const bVal = b[key] ?? '';
      if (typeof aVal === 'string') return aVal.localeCompare(bVal) * (direction === 'asc' ? 1 : -1);
      return (aVal - bVal) * (direction === 'asc' ? 1 : -1);
    });
    return sortable;
  }, [repos, sortConfig]);

  const paginatedRepos = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRepos.slice(start, start + pageSize);
  }, [sortedRepos, currentPage]);

  const totalPages = Math.ceil(sortedRepos.length / pageSize);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (loading) return <div className="repositories-page"><p>Loading repositories...</p></div>;
  if (error)
    return (
      <div className="repositories-page">
        <p className="error">{error}</p>
        <button onClick={() => navigate('/search')}>Search another user</button>
      </div>
    );

  return (
    <div className="repositories-page">
      <h2>{username}'s Repositories</h2>
      <table className="repo-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('name')}>Name</th>
            <th onClick={() => requestSort('stargazers_count')}>Stars</th>
            <th onClick={() => requestSort('forks_count')}>Forks</th>
            <th onClick={() => requestSort('size')}>Size (KB)</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRepos.map((repo) => (
            <tr key={repo.id}>
              <td>{repo.name}</td>
              <td>{repo.stargazers_count}</td>
              <td>{repo.forks_count}</td>
              <td>{repo.size}</td>
              <td>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
          ‹ Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
          Next ›
        </button>
      </div>
    </div>
  );
}
