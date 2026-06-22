import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const SearchShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <circle cx="12" cy="11" r="3"/>
  </svg>
);

export default function Search() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('git_analyzer_history')) || []);
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
      let newHistory = [...history];
      const cleanName = username.trim().toLowerCase();
      newHistory = [cleanName, ...newHistory.filter(h => h !== cleanName)].slice(0, 8);
      localStorage.setItem('git_analyzer_history', JSON.stringify(newHistory));
      setHistory(newHistory);

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

  const clearHistory = () => {
    localStorage.removeItem('git_analyzer_history');
    setHistory([]);
  };

  return (
    <div className="search-page-container">
      <div className="search-card">
        
        <div className="search-icon-shield">
          <SearchShieldIcon />
        </div>

        <h1 className="search-heading">Developer Search</h1>
        <p className="search-subheading">Analyze public repositories, language distribution, and activity diagnostics.</p>
        
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-input-wrapper">
            <div className="search-input-icon">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Enter GitHub username (e.g., torvalds)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="search-input"
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="search-button">
            {loading ? 'Analyzing Profile...' : 'Analyze Profile'}
          </button>
        </form>

        {error && <div className="error-message">⚠️ {error}</div>}

        {history.length > 0 && (
          <div className="search-history">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Recent Searches</h3>
              <button 
                onClick={clearHistory}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Clear History
              </button>
            </div>
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
