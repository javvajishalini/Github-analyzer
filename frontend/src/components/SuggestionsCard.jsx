import React, { useEffect, useState } from 'react';
import './SuggestionsCard.css';

const SuggestionIcon = ({ type }) => {
  switch (type) {
    case 'PROFILE': return '👤';
    case 'REPOSITORY': return '📦';
    case 'ACTIVITY': return '🔥';
    default: return '💡';
  }
};

const SuggestionsCard = ({ username }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/github/suggestions/${encodeURIComponent(username)}`);
        if (!res.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [username]);

  if (loading) {
    return (
      <div className="glass-card suggestions-card">
        <h3 className="suggestions-title">💡 Recommendations</h3>
        <div className="suggestions-loading">Analyzing profile for suggestions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card suggestions-card">
        <h3 className="suggestions-title">💡 Recommendations</h3>
        <div className="suggestions-error">Could not load suggestions.</div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="glass-card suggestions-card">
        <h3 className="suggestions-title">💡 Recommendations</h3>
        <div className="suggestions-empty">
          <span className="empty-icon">🌟</span>
          <p>Your profile is looking great! No suggestions right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card suggestions-card">
      <h3 className="suggestions-title">💡 Recommendations</h3>
      <div className="suggestions-list">
        {suggestions.map((sug, idx) => (
          <div key={idx} className={`suggestion-item type-${sug.type.toLowerCase()}`}>
            <div className="suggestion-icon">{SuggestionIcon({ type: sug.type })}</div>
            <div className="suggestion-content">
              <div className="suggestion-target">{sug.target}</div>
              <div className="suggestion-message">{sug.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionsCard;
