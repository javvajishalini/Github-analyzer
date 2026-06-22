import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const username = location.state?.username || localStorage.getItem('git_analyzer_session');

  const [languageData, setLanguageData] = useState([]);
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
        const res = await fetch(`/api/github/languages/${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error('Failed to fetch language distribution');
        const json = await res.json();
        const dataArray = Object.entries(json || {})
          .map(([name, value]) => ({ name: name || 'Unknown', value }))
          .sort((a, b) => b.value - a.value);
        setLanguageData(dataArray);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, [username]);

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
          <h2 className="page-title">Language Distribution</h2>
          <p className="page-subtitle">Showing languages across public repos for <strong>@{username}</strong></p>
        </div>
        <div className="badge badge-blue">
          {languageData.length} Languages
        </div>
      </div>

      <div className="glass-card animate-fade-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '3rem 2rem'
      }}>
        {languageData.length > 0 ? (
          <div style={{ width: '100%', height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={languageData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={180}
                  innerRadius={70}
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
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ paddingTop: '2rem' }}
                  formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontWeight: '600', marginLeft: '6px', fontSize: '0.9rem' }}>{value}</span>} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No language data available.</p>
        )}
      </div>
    </div>
  );
}
