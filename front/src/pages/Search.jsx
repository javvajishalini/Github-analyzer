import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';

export default function Search() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Simple validation by checking the profile endpoint
      const res = await fetch(`/api/github/user/${username}`);
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'User not found');
      }
      // If successful, navigate to overview passing username
      navigate('/overview', { state: { username } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <h1>GitHub User Search</h1>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          className="search-input"
        />
        <button type="submit" disabled={loading} className="search-button">
          {loading ? 'Loading…' : 'Search'}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
