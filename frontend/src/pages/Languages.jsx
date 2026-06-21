import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', gap: '1.5rem', color: 'var(--text-h)' }}>
        <div className="spinner" />
        <p>Loading developer language distribution...</p>
      </div>
    );
  }

  if (error || !username) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', gap: '1.5rem', color: 'var(--text-h)' }}>
        <p style={{ color: '#e74c3c' }}>⚠️ {error}</p>
        <button className="search-redirect-btn" onClick={() => navigate('/search')}>
          Go to Search Page
        </button>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#14b8a6', '#84cc16'];

  return (
    <div className="languages-page" style={{ padding: '2.5rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-h)', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>@{username}'s Language Distribution</h2>
        <span className="repo-count-badge">{languageData.length} Languages</span>
      </div>

      <div className="animate-fade-in" style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {languageData.length > 0 ? (
          <div style={{ width: '100%', height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={languageData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={140} 
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border-color)', color: 'var(--text-h)' }} />
                <Legend formatter={(value) => <span style={{ color: 'var(--text-h)', fontWeight: '600' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ color: 'var(--text-p)' }}>No language data available.</p>
        )}
      </div>
    </div>
  );
}
