import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';

export default function Search() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Validate the user exists by calling the profile endpoint
      const res = await fetch(`/api/github/user/${encodeURIComponent(username.trim())}`);
      if (!res.ok) {
        throw new Error('GitHub user not found. Please enter a valid username.');
      }
      
      // Save search history
      let history = JSON.parse(localStorage.getItem('git_analyzer_history')) || [];
      const cleanName = username.trim().toLowerCase();
      history = [cleanName, ...history.filter(h => h !== cleanName)].slice(0, 8);
      localStorage.setItem('git_analyzer_history', JSON.stringify(history));

      // Navigate to overview page with selected user
      navigate('/overview', { state: { username: username.trim() } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (name) => {
    setUsername(name);
    navigate('/overview', { state: { username: name } });
  };

  const history = JSON.parse(localStorage.getItem('git_analyzer_history')) || [];

  return (
    <div className="search-page-container">
      <div className="search-card">
        <h1 className="search-heading">GitHub User Search</h1>
        <p className="search-subheading">Analyze public repositories, languages, stars, and activity diagnostics.</p>
        
        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter GitHub username (e.g., octocat)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="search-input"
            required
          />
          <button type="submit" disabled={loading} className="search-button">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <div className="error-message">⚠️ {error}</div>}

        {history.length > 0 && (
          <div className="search-history">
            <h3>Recent Searches</h3>
            <div className="history-tags">
              {history.map((name) => (
                <button
                  key={name}
                  onClick={() => handleHistoryClick(name)}
                  className="history-tag-btn"
                >
                  @{name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
