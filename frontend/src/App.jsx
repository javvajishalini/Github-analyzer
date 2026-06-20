import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [username, setUsername] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('git_analyzer_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (name) => {
    const cleanName = name.trim().toLowerCase();
    if (!cleanName) return;
    let updated = [cleanName, ...history.filter(h => h !== cleanName)];
    if (updated.length > 8) updated = updated.slice(0, 8); // Keep last 8 searches
    setHistory(updated);
    localStorage.setItem('git_analyzer_history', JSON.stringify(updated));
  };

  const handleSearch = async (searchName) => {
    const target = searchName || username;
    if (!target.trim()) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await fetch(`http://localhost:8080/api/analyze?username=${encodeURIComponent(target.trim())}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch user data');
      }

      setData(result);
      saveToHistory(target);
      if (!searchName) setUsername(target);
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
      return <div className="text-gray-400">No language data available.</div>;
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
    const circ = 2 * Math.PI * radius; // ~314.16

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
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalRepos}</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Repos</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
          {sortedLangs.slice(0, 6).map(([lang, count], index) => (
            <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <span style={{
                width: '12px', height: '12px', borderRadius: '50%',
                backgroundColor: colors[index % colors.length]
              }} />
              <span style={{ fontWeight: '500' }}>{lang}</span>
              <span style={{ color: '#94a3b8' }}>({count})</span>
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header / Brand */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}>
            <span className="text-gradient">GitHub User Analyzer</span>
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8' }}>Advanced real-time analytics & visualization for GitHub Profiles</p>
        </div>

        {/* Search box */}
        <div style={{ display: 'flex', gap: '8px', minWidth: '320px', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Enter GitHub username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button onClick={() => handleSearch()} className="btn-primary" style={{ padding: '0 24px', fontSize: '1rem' }}>
            Analyze
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Sidebar (History & Quick Tips) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Search History</h3>
              {history.length > 0 && (
                <button onClick={clearHistory} style={{
                  background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.8rem'
                }}>
                  Clear
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No recent searches</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map((h) => (
                  <button
                    key={h}
                    onClick={() => handleSearch(h)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(99, 102, 241, 0.1)';
                      e.target.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    }}
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
              <h4 style={{ margin: 0, color: '#f43f5e' }}>Analysis Failed</h4>
              <p style={{ margin: '8px 0 0 0', color: '#fda4af' }}>{error}</p>
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
              <p style={{ color: '#94a3b8' }}>Fetching live GitHub data and running diagnostics...</p>
            </div>
          )}

          {!data && !loading && !error && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
              <h2 style={{ margin: 0 }}>Ready for Diagnostics</h2>
              <p style={{ margin: '8px 0 0 0', color: '#94a3b8', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
                Enter a GitHub username in the top right to analyze repository count, star counts, fork statistics, language breakdown, and development patterns.
              </p>
            </div>
          )}

          {data && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Profile Card & Basic Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', flexWrap: 'wrap' }}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                  <img
                    src={data.profile.avatarUrl}
                    alt={data.profile.username}
                    style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #6366f1', boxShadow: '0 0 20px rgba(99,102,241,0.2)' }}
                  />
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{data.profile.name}</h2>
                    <a
                      href={`https://github.com/${data.profile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#a5b4fc', textDecoration: 'none', fontSize: '0.95rem' }}
                    >
                      @{data.profile.username}
                    </a>
                  </div>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    {data.profile.bio || 'No bio provided'}
                  </p>
                  
                  <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', gap: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ color: '#64748b' }}>Followers</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>{data.profile.followers}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b' }}>Following</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>{data.profile.following}</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                    Profile Details
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Location</span>
                      <span style={{ fontSize: '1rem', fontWeight: '500' }}>{data.profile.location || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Account Created</span>
                      <span style={{ fontSize: '1rem', fontWeight: '500' }}>{formatDate(data.profile.createdAt)}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Public Repositories</span>
                      <span style={{ fontSize: '1rem', fontWeight: '500' }}>{data.profile.publicRepos}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>GitHub ID</span>
                      <span style={{ fontSize: '1rem', fontWeight: '500' }}>{data.profile.username}</span>
                    </div>
                  </div>

                  {data.mostStarredRepository && (
                    <div style={{
                      marginTop: '10px', padding: '14px', borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
                        ★ Most Starred Repository
                      </div>
                      <a
                        href={data.mostStarredRepository.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}
                      >
                        {data.mostStarredRepository.name}
                      </a>
                      <p style={{ margin: '4px 0 8px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                        {data.mostStarredRepository.description}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                        <span>⭐ {data.mostStarredRepository.stars} stars</span>
                        <span>🍴 {data.mostStarredRepository.forks} forks</span>
                        <span>💻 {data.mostStarredRepository.language}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Analytics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Total Repos</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '4px 0' }}>{data.totalRepos}</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Total Stars</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '4px 0', color: '#fbbf24' }}>{data.totalStars}</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Total Forks</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '4px 0', color: '#38bdf8' }}>{data.totalForks}</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Avg Stars/Repo</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '4px 0' }}>{data.avgStars}</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Avg Forks/Repo</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '4px 0' }}>{data.avgForks}</div>
                </div>
              </div>

              {/* Charts Panel: Language Distribution & Stars Analytics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flexWrap: 'wrap' }}>
                
                {/* Language Distribution SVG */}
                <div className="glass-card">
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>Language Distribution</h3>
                  {renderLanguageDonut()}
                </div>

                {/* Top Repositories by Stars Chart */}
                <div className="glass-card">
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>Stars Analytics</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {data.top5Repositories.map((repo) => {
                      const maxStars = data.top5Repositories[0]?.stars || 1;
                      const percentage = (repo.stars / maxStars) * 100;
                      return (
                        <div key={repo.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <a
                              href={repo.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontWeight: '600', color: '#cbd5e1', textDecoration: 'none' }}
                            >
                              {repo.name}
                            </a>
                            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>★ {repo.stars}</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
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
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>Repository Distribution</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <span>Original Repositories</span>
                        <span style={{ fontWeight: 'bold' }}>{data.originalReposCount}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${data.totalRepos > 0 ? (data.originalReposCount / data.totalRepos) * 100 : 0}%`,
                          height: '100%', backgroundColor: '#10b981', borderRadius: '3px'
                        }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <span>Forked Repositories</span>
                        <span style={{ fontWeight: 'bold' }}>{data.forkedReposCount}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${data.totalRepos > 0 ? (data.forkedReposCount / data.totalRepos) * 100 : 0}%`,
                          height: '100%', backgroundColor: '#38bdf8', borderRadius: '3px'
                        }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Original %</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>
                        {data.totalRepos > 0 ? Math.round((data.originalReposCount / data.totalRepos) * 100) : 0}%
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Forked %</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#38bdf8' }}>
                        {data.totalRepos > 0 ? Math.round((data.forkedReposCount / data.totalRepos) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Repository Activity Analytics */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Repository Activity</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    
                    <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Newest
                      </div>
                      {data.newestRepository ? (
                        <>
                          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {data.newestRepository.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                            {formatDate(data.newestRepository.createdAt)}
                          </div>
                        </>
                      ) : 'N/A'}
                    </div>

                    <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Oldest
                      </div>
                      {data.oldestRepository ? (
                        <>
                          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {data.oldestRepository.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                            {formatDate(data.oldestRepository.createdAt)}
                          </div>
                        </>
                      ) : 'N/A'}
                    </div>

                    <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Recently Updated
                      </div>
                      {data.recentlyUpdatedRepository ? (
                        <>
                          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {data.recentlyUpdatedRepository.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
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
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>All Repositories</h3>
                  
                  <input
                    type="text"
                    placeholder="Filter repositories..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'rgba(15, 23, 42, 0.4)',
                      color: 'white',
                      fontSize: '0.875rem',
                      outline: 'none',
                      minWidth: '220px'
                    }}
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
                              style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: '500' }}
                            >
                              {repo.name}
                            </a>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {repo.description}
                            </div>
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem',
                              backgroundColor: 'rgba(255,255,255,0.05)', color: '#cbd5e1'
                            }}>
                              {repo.language}
                            </span>
                          </td>
                          <td style={{ color: '#fbbf24', fontWeight: '600' }}>★ {repo.stars}</td>
                          <td style={{ color: '#38bdf8' }}>🍴 {repo.forks}</td>
                          <td>{formatDate(repo.createdAt)}</td>
                          <td>{formatDate(repo.updatedAt)}</td>
                        </tr>
                      ))}
                      {sortedRepos.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
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
