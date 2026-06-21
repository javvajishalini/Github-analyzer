import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [username, setUsername] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(''); // Stores the logged-in username
  
  // Theme state: 'dark' or 'light'
  const [theme, setTheme] = useState('dark');

  // Load history, theme, and authentication session
  useEffect(() => {
    const savedHistory = localStorage.getItem('git_analyzer_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    const savedTheme = localStorage.getItem('git_analyzer_theme');
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }

    const sessionUser = localStorage.getItem('git_analyzer_session');
    if (sessionUser) {
      setIsLoggedIn(true);
      setCurrentUser(sessionUser);
      // Pre-fetch their profile
      handleSearch(sessionUser, true);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('git_analyzer_theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const saveToHistory = (name) => {
    const cleanName = name.trim().toLowerCase();
    if (!cleanName) return;
    let updated = [cleanName, ...history.filter(h => h !== cleanName)];
    if (updated.length > 8) updated = updated.slice(0, 8);
    setHistory(updated);
    localStorage.setItem('git_analyzer_history', JSON.stringify(updated));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8080/api/analyze?username=${encodeURIComponent(username.trim())}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'User not found. Please enter a valid GitHub username.');
      }

      // Log in success
      setIsLoggedIn(true);
      setCurrentUser(username.trim());
      setData(result);
      localStorage.setItem('git_analyzer_session', username.trim());
      saveToHistory(username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setData(null);
    setUsername('');
    localStorage.removeItem('git_analyzer_session');
  };

  const handleSearch = async (searchName, isInitialLogin = false) => {
    const target = searchName || username;
    if (!target.trim()) return;

    setLoading(true);
    setError('');
    if (!isInitialLogin) setData(null);

    try {
      const response = await fetch(`http://localhost:8080/api/analyze?username=${encodeURIComponent(target.trim())}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch user data');
      }

      setData(result);
      saveToHistory(target);
      if (!isInitialLogin) setUsername(target);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('git_analyzer_history');
  };

  // SVG Chart Calculations for Donut Chart
  const renderLanguageDonut = () => {
    if (!data || !data.languageDistribution || Object.keys(data.languageDistribution).length === 0) {
      return <div style={{ color: 'var(--text-secondary)' }}>No language data available.</div>;
    }

    const dist = data.languageDistribution;
    const totalRepos = Object.values(dist).reduce((a, b) => a + b, 0);
    const sortedLangs = Object.entries(dist).sort((a, b) => b[1] - a[1]);

    const colors = [
      '#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', 
      '#ef4444', '#ec4899', '#3b82f6', '#14b8a6', '#84cc16'
    ];

    let accumulatedPercentage = 0;
    const radius = 50;
    const circ = 2 * Math.PI * radius;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '32px', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
          <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            {sortedLangs.map(([lang, count], index) => {
              const pct = count / totalRepos;
              const strokeOffset = circ - (pct * circ);
              const strokeRotation = accumulatedPercentage * 360;
              accumulatedPercentage += pct;

              return (
                <circle
                  key={lang}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="12"
                  strokeDasharray={circ}
                  strokeDashoffset={strokeOffset}
                  style={{
                    transform: `rotate(${strokeRotation}deg)`,
                    transformOrigin: '60px 60px',
                    transition: 'stroke-dashoffset 0.5s ease',
                  }}
                />
              );
            })}
          </svg>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>{totalRepos}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Repos</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
          {sortedLangs.slice(0, 6).map(([lang, count], index) => (
            <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <span style={{
                width: '12px', height: '12px', borderRadius: '50%',
                backgroundColor: colors[index % colors.length]
              }} />
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{lang}</span>
              <span style={{ color: 'var(--text-secondary)' }}>({count})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Sort and Filter Repositories in Table
  const [sortKey, setSortKey] = useState('stars');
  const [sortDesc, setSortDesc] = useState(true);
  const [tableSearch, setTableSearch] = useState('');

  const sortedRepos = data?.repositories
    ? data.repositories
        .filter(r => r.name.toLowerCase().includes(tableSearch.toLowerCase()))
        .sort((a, b) => {
          let valA = a[sortKey];
          let valB = b[sortKey];

          if (typeof valA === 'string') {
            return sortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
          }
          return sortDesc ? valB - valA : valA - valB;
        })
    : [];

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return dateStr.substring(0, 10);
  };

  // RENDER LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '20px',
        boxSizing: 'border-box'
      }}>
        {/* Theme toggle on login screen */}
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          style={{ position: 'absolute', top: '24px', right: '24px' }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', textAlign: 'center', padding: '40px 30px' }}>
          
          {/* GitHub SVG Icon */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px auto', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
          }}>
            <svg height="40" viewBox="0 0 16 16" width="40" style={{ fill: 'white' }}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </div>

          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: '800' }}>
            <span className="text-gradient">GitHub Analyzer</span>
          </h2>
          <p style={{ margin: '0 0 32px 0', color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.45' }}>
            Analyze any GitHub user's repositories, stars, forks, languages, and more with interactive visual analytics.
          </p>

<button onClick={() => window.location.href='http://localhost:8080/oauth2/authorization/github'} className="btn-primary" style={{ width: '100%', padding: '12px 20px', marginTop: '8px', display: 'inline-block', textAlign: 'center' }}>Sign in with GitHub</button>

          {error && (
            <div style={{
              marginTop: '20px', padding: '12px', borderRadius: '8px',
              backgroundColor: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)',
              color: '#f43f5e', fontSize: '0.85rem', textAlign: 'left', fontWeight: '600'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER AUTHENTICATED DASHBOARD
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header / Brand */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.05em' }}>
            <span className="text-gradient">GitHub User Analyzer</span>
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Logged in as <strong style={{ color: 'var(--text-primary)' }}>@{currentUser}</strong>
          </p>
        </div>

        {/* Action Controls (Search box & Logout) */}
        <div style={{ display: 'flex', gap: '12px', minWidth: '320px', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Search Box */}
          <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '340px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Analyze other user..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
            </div>
            <button onClick={() => handleSearch()} className="btn-primary" style={{ padding: '0 16px' }}>
              Search
            </button>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="theme-toggle-btn" 
            title="Sign Out" 
            style={{ fontSize: '1.1rem', backgroundColor: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.15)' }}
            onMouseEnter={(e) => { e.target.style.borderColor = '#f43f5e'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(244, 63, 94, 0.15)'; }}
          >
            🚪
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Sidebar (History) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>Search History</h3>
              {history.length > 0 && (
                <button onClick={clearHistory} style={{
                  background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
                }}>
                  Clear
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent searches</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map((h) => (
                  <button
                    key={h}
                    onClick={() => handleSearch(h)}
                    className="history-btn"
                  >
                    🔍 {h}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {error && (
            <div className="glass-card" style={{ borderColor: 'rgba(244, 63, 94, 0.3)', backgroundColor: 'rgba(244, 63, 94, 0.05)' }}>
              <h4 style={{ margin: 0, color: '#f43f5e', fontWeight: '700' }}>Analysis Failed</h4>
              <p style={{ margin: '8px 0 0 0', color: 'var(--text-primary)' }}>{error}</p>
            </div>
          )}

          {loading && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '300px', gap: '16px'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: 'var(--text-secondary)' }}>Loading diagnostics...</p>
            </div>
          )}

          {data && !loading && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Profile Card & Basic Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', flexWrap: 'wrap' }}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                  <img
                    src={data.profile.avatarUrl}
                    alt={data.profile.username}
                    style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #6366f1', boxShadow: '0 0 20px rgba(99,102,241,0.15)' }}
                  />
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>{data.profile.name}</h2>
                    <a
                      href={`https://github.com/${data.profile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600' }}
                    >
                      @{data.profile.username}
                    </a>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    {data.profile.bio || 'No bio provided'}
                  </p>
                  
                  <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--divider)' }} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', gap: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Followers</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{data.profile.followers}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Following</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{data.profile.following}</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', borderBottom: '1px solid var(--divider)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
                    Profile Details
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Location</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>{data.profile.location || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Account Created</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>{formatDate(data.profile.createdAt)}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Public Repositories</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>{data.profile.publicRepos}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>GitHub ID</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>{data.profile.username}</span>
                    </div>
                  </div>

                  {data.mostStarredRepository && (
                    <div style={{
                      marginTop: '10px', padding: '14px', borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                        ★ Most Starred Repository
                      </div>
                      <a
                        href={data.mostStarredRepository.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', textDecoration: 'none' }}
                      >
                        {data.mostStarredRepository.name}
                      </a>
                      <p style={{ margin: '4px 0 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {data.mostStarredRepository.description}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <span style={{ color: '#f59e0b' }}>⭐ {data.mostStarredRepository.stars} stars</span>
                        <span style={{ color: '#06b6d4' }}>🍴 {data.mostStarredRepository.forks} forks</span>
                        <span style={{ color: 'var(--text-secondary)' }}>💻 {data.mostStarredRepository.language}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Analytics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Repos</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-primary)' }}>{data.totalRepos}</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Stars</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: '#f59e0b' }}>{data.totalStars}</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Forks</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: '#06b6d4' }}>{data.totalForks}</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Avg Stars/Repo</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-primary)' }}>{data.avgStars}</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Avg Forks/Repo</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-primary)' }}>{data.avgForks}</div>
                </div>
              </div>

              {/* Charts Panel: Language Distribution & Stars Analytics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flexWrap: 'wrap' }}>
                
                {/* Language Distribution SVG */}
                <div className="glass-card">
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>Language Distribution</h3>
                  {renderLanguageDonut()}
                </div>

                {/* Top Repositories by Stars Chart */}
                <div className="glass-card">
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>Stars Analytics</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {data.top5Repositories.map((repo) => {
                      const maxStars = data.top5Repositories[0]?.stars || 1;
                      const percentage = (repo.stars / maxStars) * 100;
                      return (
                        <div key={repo.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <a
                              href={repo.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontWeight: '600', color: 'var(--text-primary)', textDecoration: 'none' }}
                            >
                              {repo.name}
                            </a>
                            <span style={{ color: '#f59e0b', fontWeight: '700' }}>★ {repo.stars}</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--table-border-header)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${percentage}%`, height: '100%',
                              background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                              borderRadius: '4px',
                              transition: 'width 1s ease'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Repositories Distribution (Forked vs Original) & Repository Activity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                
                {/* Repository Distribution Card */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>Repository Distribution</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Original Repositories</span>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{data.originalReposCount}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--table-border-header)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${data.totalRepos > 0 ? (data.originalReposCount / data.totalRepos) * 100 : 0}%`,
                          height: '100%', backgroundColor: '#10b981', borderRadius: '3px'
                        }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Forked Repositories</span>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{data.forkedReposCount}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--table-border-header)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${data.totalRepos > 0 ? (data.forkedReposCount / data.totalRepos) * 100 : 0}%`,
                          height: '100%', backgroundColor: '#38bdf8', borderRadius: '3px'
                        }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px', padding: '12px', background: 'var(--sidebar-item-bg)', border: '1px solid var(--sidebar-item-border)', borderRadius: '8px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Original %</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>
                        {data.totalRepos > 0 ? Math.round((data.originalReposCount / data.totalRepos) * 100) : 0}%
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Forked %</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#38bdf8' }}>
                        {data.totalRepos > 0 ? Math.round((data.forkedReposCount / data.totalRepos) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Repository Activity Analytics */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>Repository Activity</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    
                    <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--sidebar-item-bg)', border: '1px solid var(--sidebar-item-border)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Newest
                      </div>
                      {data.newestRepository ? (
                        <>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {data.newestRepository.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {formatDate(data.newestRepository.createdAt)}
                          </div>
                        </>
                      ) : 'N/A'}
                    </div>

                    <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--sidebar-item-bg)', border: '1px solid var(--sidebar-item-border)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Oldest
                      </div>
                      {data.oldestRepository ? (
                        <>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {data.oldestRepository.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {formatDate(data.oldestRepository.createdAt)}
                          </div>
                        </>
                      ) : 'N/A'}
                    </div>

                    <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--sidebar-item-bg)', border: '1px solid var(--sidebar-item-border)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Recently Updated
                      </div>
                      {data.recentlyUpdatedRepository ? (
                        <>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {data.recentlyUpdatedRepository.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {formatDate(data.recentlyUpdatedRepository.updatedAt)}
                          </div>
                        </>
                      ) : 'N/A'}
                    </div>

                  </div>
                </div>

              </div>

              {/* Complete Repository Table */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>All Repositories</h3>
                  
                  <input
                    type="text"
                    placeholder="Filter repositories..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="search-input"
                    style={{ minWidth: '220px', maxWidth: '300px' }}
                  />
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('name')}>
                          Name {sortKey === 'name' ? (sortDesc ? '▼' : '▲') : ''}
                        </th>
                        <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('language')}>
                          Language {sortKey === 'language' ? (sortDesc ? '▼' : '▲') : ''}
                        </th>
                        <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('stars')}>
                          Stars {sortKey === 'stars' ? (sortDesc ? '▼' : '▲') : ''}
                        </th>
                        <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('forks')}>
                          Forks {sortKey === 'forks' ? (sortDesc ? '▼' : '▲') : ''}
                        </th>
                        <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('createdAt')}>
                          Created Date {sortKey === 'createdAt' ? (sortDesc ? '▼' : '▲') : ''}
                        </th>
                        <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('updatedAt')}>
                          Updated Date {sortKey === 'updatedAt' ? (sortDesc ? '▼' : '▲') : ''}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRepos.map((repo) => (
                        <tr key={repo.name}>
                          <td>
                            <a
                              href={repo.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600' }}
                            >
                              {repo.name}
                            </a>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {repo.description}
                            </div>
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                              backgroundColor: 'var(--sidebar-item-border)', color: 'var(--text-primary)'
                            }}>
                              {repo.language}
                            </span>
                          </td>
                          <td style={{ color: '#f59e0b', fontWeight: '700' }}>★ {repo.stars}</td>
                          <td style={{ color: '#06b6d4', fontWeight: '600' }}>🍴 {repo.forks}</td>
                          <td>{formatDate(repo.createdAt)}</td>
                          <td>{formatDate(repo.updatedAt)}</td>
                        </tr>
                      ))}
                      {sortedRepos.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                            No repositories found matching search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
