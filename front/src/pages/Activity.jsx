import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Activity.css';

export default function Activity() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || '';

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) {
      setError('Username not provided. Please search first.');
      setLoading(false);
      return;
    }
    const fetchActivity = async () => {
      try {
        const res = await fetch(`/api/github/activity/${username}`);
        if (!res.ok) throw new Error('Failed to fetch activity');
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

  if (loading) return <div className="activity-page"><p>Loading activity...</p></div>;
  if (error)
    return (
      <div className="activity-page">
        <p className="error">{error}</p>
        <button onClick={() => navigate('/search')}>Search another user</button>
      </div>
    );

  const { newestRepository, recentlyUpdatedRepository, oldestRepository } = activity || {};

  return (
    <div className="activity-page">
      <h2>{username}'s Activity</h2>
      <section className="repo-section">
        <h3>Newest Repository</h3>
        {newestRepository ? (
          <div className="repo-card">
            <a href={newestRepository.html_url} target="_blank" rel="noopener noreferrer">
              {newestRepository.name}
            </a>
            <p>{newestRepository.description}</p>
          </div>
        ) : (
          <p>No newest repo data.</p>
        )}
      </section>
      <section className="repo-section">
        <h3>Recently Updated Repository</h3>
        {recentlyUpdatedRepository ? (
          <div className="repo-card">
            <a href={recentlyUpdatedRepository.html_url} target="_blank" rel="noopener noreferrer">
              {recentlyUpdatedRepository.name}
            </a>
            <p>{recentlyUpdatedRepository.description}</p>
          </div>
        ) : (
          <p>No recent update data.</p>
        )}
      </section>
      <section className="repo-section">
        <h3>Oldest Repository</h3>
        {oldestRepository ? (
          <div className="repo-card">
            <a href={oldestRepository.html_url} target="_blank" rel="noopener noreferrer">
              {oldestRepository.name}
            </a>
            <p>{oldestRepository.description}</p>
          </div>
        ) : (
          <p>No oldest repo data.</p>
        )}
      </section>
    </div>
  );
}
