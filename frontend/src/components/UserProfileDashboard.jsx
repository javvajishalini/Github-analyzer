import React, { useState } from 'react';

// Re‑use the same API call as UserSearch but expose a richer UI.
// Props: none – the component manages its own search input.

const UserProfileDashboard = () => {
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    setLoading(true);
    setError('');
    setProfile(null);
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/github/user/${encodeURIComponent(username.trim())}`);
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'User not found');
      }
      const data = await resp.json();
      setProfile(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">GitHub User Profile</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="GitHub username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button" disabled={loading}>
          {loading ? 'Loading…' : 'Search'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {profile && (
        <div className="profile-card">
          <img src={profile.avatarUrl} alt="avatar" className="avatar" />
          <div className="info">
            <h3>{profile.name || profile.login}</h3>
            <p className="login">@{profile.login}</p>
            {profile.bio && <p className="bio">{profile.bio}</p>}
            {profile.location && <p className="location">📍 {profile.location}</p>}
            <p className="join-date">Joined: {new Date(profile.createdAt).toLocaleDateString()}</p>
            <div className="stats">
              <span>Followers: {profile.followers}</span>
              <span>Following: {profile.following}</span>
              <span>Repos: {profile.publicRepos}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDashboard;
