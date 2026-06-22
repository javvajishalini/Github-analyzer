import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './Compare.css';

export default function Compare() {
  const location = useLocation();
  const sessionUser = localStorage.getItem('git_analyzer_session');
  
  // Default first user to logged in user, allow them to set the second user
  const [user1Input, setUser1Input] = useState(sessionUser || '');
  const [user2Input, setUser2Input] = useState('');
  
  const [user1Data, setUser1Data] = useState(null);
  const [user2Data, setUser2Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserAnalytics = async (username) => {
    const res = await fetch(`/api/github/analytics/${encodeURIComponent(username.trim())}`);
    if (!res.ok) throw new Error(`User ${username} not found or rate limit exceeded.`);
    return await res.json();
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!user1Input.trim() || !user2Input.trim()) return;
    
    setLoading(true);
    setError(null);
    setUser1Data(null);
    setUser2Data(null);

    try {
      const [data1, data2] = await Promise.all([
        fetchUserAnalytics(user1Input),
        fetchUserAnalytics(user2Input)
      ]);
      setUser1Data(data1);
      setUser2Data(data2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--tooltip-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 10,
          padding: '10px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          fontSize: '0.875rem',
        }}>
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '4px 0 0', color: entry.color, fontWeight: 600 }}>
              @{entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Helper to construct comparison chart data
  const createChartData = (label, value1, value2) => [
    { name: label, [user1Data?.profile?.username || 'User 1']: value1, [user2Data?.profile?.username || 'User 2']: value2 }
  ];

  return (
    <div className="compare-page">
      <div className="compare-header">
        <h2>Compare Users</h2>
        <p className="page-subtitle">Analyze metrics side-by-side</p>
      </div>

      <form className="compare-search-form" onSubmit={handleCompare}>
        <div className="compare-input-wrap">
          <span style={{color:'var(--text-muted)'}}>User 1:</span>
          <input
            type="text"
            className="compare-input"
            placeholder="Username"
            value={user1Input}
            onChange={(e) => setUser1Input(e.target.value)}
            required
          />
        </div>
        <div className="compare-input-wrap">
          <span style={{color:'var(--text-muted)'}}>User 2:</span>
          <input
            type="text"
            className="compare-input"
            placeholder="Username"
            value={user2Input}
            onChange={(e) => setUser2Input(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="compare-btn" disabled={loading}>
          {loading ? 'Comparing...' : 'Compare Users'}
        </button>
      </form>

      {error && <div className="page-error"><p className="error-text">⚠️ {error}</p></div>}

      {user1Data && user2Data && (
        <div className="animate-fade-in">
          
          <div className="compare-grid">
            {/* User 1 Profile */}
            <div className={`compare-profile-card ${user1Data.totalStars > user2Data.totalStars ? 'winner' : ''}`}>
              <img src={user1Data.profile.avatarUrl} alt="Avatar" className="compare-avatar" />
              <div className="compare-info">
                <h3>{user1Data.profile.name || user1Data.profile.username}</h3>
                <p>@{user1Data.profile.username}</p>
                {user1Data.totalStars > user2Data.totalStars && <span className="badge badge-green" style={{marginTop: 8}}>👑 Most Stars</span>}
              </div>
            </div>

            {/* User 2 Profile */}
            <div className={`compare-profile-card ${user2Data.totalStars > user1Data.totalStars ? 'winner' : ''}`}>
              <img src={user2Data.profile.avatarUrl} alt="Avatar" className="compare-avatar" />
              <div className="compare-info">
                <h3>{user2Data.profile.name || user2Data.profile.username}</h3>
                <p>@{user2Data.profile.username}</p>
                {user2Data.totalStars > user1Data.totalStars && <span className="badge badge-green" style={{marginTop: 8}}>👑 Most Stars</span>}
              </div>
            </div>
          </div>

          <div className="compare-charts-grid">
            
            {/* Stars Chart */}
            <div className="compare-chart-card">
              <div className="compare-chart-title">⭐ Total Stars</div>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={createChartData('Stars', user1Data.totalStars, user2Data.totalStars)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey={user1Data.profile.username} fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={user2Data.profile.username} fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Forks Chart */}
            <div className="compare-chart-card">
              <div className="compare-chart-title">🍴 Total Forks</div>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={createChartData('Forks', user1Data.totalForks, user2Data.totalForks)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey={user1Data.profile.username} fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={user2Data.profile.username} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Followers Chart */}
            <div className="compare-chart-card">
              <div className="compare-chart-title">👥 Followers</div>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={createChartData('Followers', user1Data.profile.followers, user2Data.profile.followers)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey={user1Data.profile.username} fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={user2Data.profile.username} fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Public Repos Chart */}
            <div className="compare-chart-card">
              <div className="compare-chart-title">📦 Public Repositories</div>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={createChartData('Repos', user1Data.profile.publicRepos, user2Data.profile.publicRepos)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey={user1Data.profile.username} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={user2Data.profile.username} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
