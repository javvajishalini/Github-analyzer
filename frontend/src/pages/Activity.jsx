import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Activity.css';

export default function Activity() {
  const location = useLocation();
  const navigate = useNavigate();

  // Resolve target username: state, then logged-in session, then null
  const username = location.state?.username || localStorage.getItem('git_analyzer_session');

  const [activity, setActivity] = useState(null);
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
        const res = await fetch(`/api/github/activity/${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error('Failed to fetch activity logs');
        const json = await res.json();
        setActivity(json);
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
        <p>Analyzing developer activity metadata...</p>
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

  return (
    <div className="activity-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>@{username}'s Activity Milestones</h2>
      </div>

      <div className="activity-grid animate-fade-in">
        
        {/* Newest Repository */}
        <section className="activity-card-section">
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
                  <span>⭐ {newestRepository.stars}</span>
                </div>
              </>
            ) : (
              <p className="no-activity-data">No data available</p>
            )}
          </div>
        </section>

        {/* Recently Updated Repository */}
        <section className="activity-card-section">
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
                  <span>⭐ {recentlyUpdatedRepository.stars}</span>
                </div>
              </>
            ) : (
              <p className="no-activity-data">No data available</p>
            )}
          </div>
        </section>

        {/* Oldest Repository */}
        <section className="activity-card-section">
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
                  <span>⭐ {oldestRepository.stars}</span>
                </div>
              </>
            ) : (
              <p className="no-activity-data">No data available</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
