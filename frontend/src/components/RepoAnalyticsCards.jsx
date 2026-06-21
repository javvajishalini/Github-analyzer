import React, { useEffect, useState } from 'react';

// Props: username (string) – the GitHub username to fetch analytics for
export default function RepoAnalyticsCards({ username }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/github/analytics/${username}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch analytics');
        }
        const data = await res.json();
        setAnalytics(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [username]);

  if (!username) return null;
  if (loading) return <div className="card loading">Loading analytics…</div>;
  if (error) return <div className="card error">Error: {error}</div>;
  if (!analytics) return null;

  const cards = [
    { label: 'Total Repositories', value: analytics.totalRepos },
    { label: 'Total Stars', value: analytics.totalStars },
    { label: 'Total Forks', value: analytics.totalForks },
    { label: 'Average Stars per Repo', value: analytics.avgStars },
    { label: 'Average Forks per Repo', value: analytics.avgForks },
  ];

  return (
    <div className="analytics-grid">
      {cards.map((c) => (
        <div key={c.label} className="analytics-card">
          <div className="analytics-label">{c.label}</div>
          <div className="analytics-value">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
