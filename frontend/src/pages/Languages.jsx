import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

/* ── Custom Pie Tooltip ── */
const CustomTooltip = ({ active, payload }) => {
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
        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
          {payload[0].name}
        </p>
        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>
          {payload[0].value} bytes
        </p>
      </div>
    );
  }
  return null;
};

export default function Languages() {
  const location = useLocation();
  const navigate = useNavigate();

  // Resolve target username: state, then logged-in session, then null
  const username = location.state?.username 
    || localStorage.getItem('git_analyzer_current_user') 
    || localStorage.getItem('git_analyzer_session');

  const [languageData, setLanguageData] = useState([]);
  const [repoLangData, setRepoLangData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) {
      setError('Please search for a GitHub user first.');
      setLoading(false);
      return;
    }
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch languages bytes
        const resLang = await fetch(`/api/github/languages/${encodeURIComponent(username)}`);
        if (!resLang.ok) throw new Error('Failed to fetch language distribution');
        const jsonLang = await resLang.json();
        
        // Fetch repos for counts
        const resRepos = await fetch(`/api/github/repos/${encodeURIComponent(username)}`);
        if (!resRepos.ok) throw new Error('Failed to fetch repositories');
        const repos = await resRepos.json();

        // Process bytes
        const dataArray = Object.entries(jsonLang || {})
          .map(([name, value]) => ({ name: name || 'Unknown', value }))
          .sort((a, b) => b.value - a.value);
        setLanguageData(dataArray);

        // Process repos
        const langCounts = {};
        repos.forEach(r => {
          const l = r.language || 'Unknown';
          langCounts[l] = (langCounts[l] || 0) + 1;
        });
        const repoArray = Object.entries(langCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setRepoLangData(repoArray);

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, [username]);

  const mostUsedByteLang = languageData.length > 0 ? languageData[0].name : 'N/A';
  const mostUsedRepoLang = repoLangData.length > 0 ? repoLangData[0].name : 'N/A';

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Loading developer language distribution...</p>
      </div>
    );
  }

  if (error || !username) {
    return (
      <div className="page-error">
        <p className="error-text">⚠️ {error}</p>
        <button className="search-redirect-btn" onClick={() => navigate('/search')}>
          Go to Search Page
        </button>
      </div>
    );
  }

  const CHART_COLORS = [
    '#2563EB', '#7C3AED', '#06B6D4', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
    '#14b8a6', '#f97316'
  ];

  return (
    <div style={{ padding: '2rem 0', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
      
      <div className="page-header">
        <div>
          <h2 className="page-title">Language Analytics</h2>
          <p className="page-subtitle">Showing languages across public repos for <strong>@{username}</strong></p>
        </div>
        <div className="badge badge-blue">
          {languageData.length} Languages Detected
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }} className="animate-fade-in">
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Most Used (By Bytes)</h4>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>{mostUsedByteLang}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Most Used (By Repos)</h4>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa' }}>{mostUsedRepoLang}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Pie Chart: Bytes */}
        <div className="glass-card animate-fade-in" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem 1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', alignSelf: 'flex-start' }}>Codebase Distribution (Bytes)</h3>
          {languageData.length > 0 ? (
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={languageData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={130}
                    innerRadius={60}
                    paddingAngle={2}
                    animationBegin={0}
                    animationDuration={800}
                    label={({ name, percent }) => percent > 0.03 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                    labelLine={false}
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend 
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ paddingTop: '1rem' }}
                    formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontWeight: '600', marginLeft: '6px', fontSize: '0.85rem' }}>{value}</span>} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No language data available.</p>
          )}
        </div>

        {/* Bar Chart: Repos */}
        <div className="glass-card animate-fade-in" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem 1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', alignSelf: 'flex-start' }}>Repository Count by Language</h3>
          {repoLangData.length > 0 ? (
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={repoLangData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--tooltip-bg)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                    {repoLangData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No repository data available.</p>
          )}
        </div>

      </div>
    </div>
  );
}
