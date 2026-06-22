import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Activity.css';

const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, position: 'relative', top: 2 }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export default function Activity() {
  const location = useLocation();
  const navigate = useNavigate();

  // Resolve target username: state, then logged-in session, then null
  const username = location.state?.username || localStorage.getItem('git_analyzer_session');

  const [activity, setActivity] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) {
      setError('Please search for a GitHub user first.');
      setLoading(false);
      return;
    }
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch original activity milestones
        const resActivity = await fetch(`/api/github/activity/${encodeURIComponent(username)}`);
        if (!resActivity.ok) throw new Error('Failed to fetch activity logs');
        const actData = await resActivity.json();
        setActivity(actData);

        // Fetch new dashboard events
        const resDash = await fetch(`/api/github/dashboard/${encodeURIComponent(username)}`);
        if (resDash.ok) {
          const dashData = await resDash.json();
          setDashboard(dashData);
        }

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [username]);

  if (loading) {
    return (
      <div className="activity-page-loading">
        <div className="spinner" />
        <p>Analyzing developer activity milestones...</p>
      </div>
    );
  }

  if (error || !username) {
    return (
      <div className="activity-page-error">
        <p className="error">⚠️ {error}</p>
        <button className="search-redirect-btn" onClick={() => navigate('/search')}>
          Go to Search Page
        </button>
      </div>
    );
  }

  const { newestRepository, recentlyUpdatedRepository, oldestRepository } = activity || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate last 90 days for heatmap
  const generateHeatmapDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = dashboard?.heatmap ? (dashboard.heatmap[dateStr] || 0) : 0;
      days.push({ date: dateStr, count });
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays();

  const getHeatmapColor = (count) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.05)';
    if (count < 3) return '#0e4429';
    if (count < 6) return '#006d32';
    if (count < 10) return '#26a641';
    return '#39d353';
  };

  return (
    <div className="activity-page">
      <div className="activity-header">
        <h2>Activity Dashboard</h2>
        <p className="activity-header-sub">
          Key repository events and recent activity for <strong>@{username}</strong>
        </p>
      </div>

      {dashboard && (
        <div className="dashboard-stats-grid animate-fade-in">
          <div className="glass-card stat-box">
            <h4>🔥 Current Streak</h4>
            <div className="stat-value">{dashboard.currentStreak} days</div>
          </div>
          <div className="glass-card stat-box">
            <h4>🏆 Longest Streak</h4>
            <div className="stat-value">{dashboard.longestStreak} days</div>
          </div>
          <div className="glass-card stat-box">
            <h4>💻 Push Events (90d)</h4>
            <div className="stat-value">{dashboard.pushEventsCount}</div>
          </div>
          <div className="glass-card stat-box">
            <h4>🔄 Pull Requests (90d)</h4>
            <div className="stat-value">{dashboard.pullRequestsCount}</div>
          </div>
          <div className="glass-card stat-box">
            <h4>⚠️ Issues (90d)</h4>
            <div className="stat-value">{dashboard.issuesOpenedCount}</div>
          </div>
        </div>
      )}

      {dashboard && (
        <div className="glass-card heatmap-section animate-fade-in" style={{marginBottom: '2rem'}}>
          <h3 className="section-title">90-Day Contribution Heatmap</h3>
          <div className="heatmap-container">
            {heatmapDays.map((day, idx) => (
              <div 
                key={idx} 
                className="heatmap-cell"
                style={{ backgroundColor: getHeatmapColor(day.count) }}
                title={`${day.date}: ${day.count} events`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="activity-grid animate-fade-in">
        
        {/* Newest Repository */}
        <section className="activity-card-section" style={{ animationDelay: '0ms' }}>
          <div className="card-header-accent green" />
          <div className="activity-card-body">
            <span className="card-meta-tag green-tag">🌱 Newest Project</span>
            {newestRepository ? (
              <>
                <a 
                  href={newestRepository.htmlUrl || newestRepository.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="activity-repo-link"
                >
                  {newestRepository.name}
                </a>
                <p className="activity-repo-desc">{newestRepository.description || 'No description provided.'}</p>
                <div className="activity-repo-footer">
                  <span>Created: <strong>{formatDate(newestRepository.createdAt || newestRepository.created_at)}</strong></span>
                  <span><IconStar /> {newestRepository.stars}</span>
                </div>
              </>
            ) : (
              <p className="no-activity-data">No data available</p>
            )}
          </div>
        </section>

        {/* Recently Updated Repository */}
        <section className="activity-card-section" style={{ animationDelay: '80ms' }}>
          <div className="card-header-accent purple" />
          <div className="activity-card-body">
            <span className="card-meta-tag purple-tag">⚡ Recently Active</span>
            {recentlyUpdatedRepository ? (
              <>
                <a 
                  href={recentlyUpdatedRepository.htmlUrl || recentlyUpdatedRepository.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="activity-repo-link"
                >
                  {recentlyUpdatedRepository.name}
                </a>
                <p className="activity-repo-desc">{recentlyUpdatedRepository.description || 'No description provided.'}</p>
                <div className="activity-repo-footer">
                  <span>Updated: <strong>{formatDate(recentlyUpdatedRepository.updatedAt || recentlyUpdatedRepository.updated_at)}</strong></span>
                  <span><IconStar /> {recentlyUpdatedRepository.stars}</span>
                </div>
              </>
            ) : (
              <p className="no-activity-data">No data available</p>
            )}
          </div>
        </section>

        {/* Oldest Repository */}
        <section className="activity-card-section" style={{ animationDelay: '160ms' }}>
          <div className="card-header-accent orange" />
          <div className="activity-card-body">
            <span className="card-meta-tag orange-tag">🏛️ Oldest Project</span>
            {oldestRepository ? (
              <>
                <a 
                  href={oldestRepository.htmlUrl || oldestRepository.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="activity-repo-link"
                >
                  {oldestRepository.name}
                </a>
                <p className="activity-repo-desc">{oldestRepository.description || 'No description provided.'}</p>
                <div className="activity-repo-footer">
                  <span>Created: <strong>{formatDate(oldestRepository.createdAt || oldestRepository.created_at)}</strong></span>
                  <span><IconStar /> {oldestRepository.stars}</span>
                </div>
              </>
            ) : (
              <p className="no-activity-data">No data available</p>
            )}
          </div>
        </section>

      </div>

      {dashboard && dashboard.recentEvents && dashboard.recentEvents.length > 0 && (
        <div className="glass-card recent-events-section animate-fade-in">
          <h3 className="section-title">Recent Event Feed</h3>
          <ul className="recent-events-list">
            {dashboard.recentEvents.map(ev => (
              <li key={ev.id} className="event-item">
                <span className="event-type">{ev.type.replace('Event', '')}</span>
                <span className="event-repo"> on <strong>{ev.repoName}</strong></span>
                <span className="event-date"> {new Date(ev.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
