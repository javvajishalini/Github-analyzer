import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Overview.css';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function Overview() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) {
      setError('Username not provided. Please search for a GitHub user first.');
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/github/analytics/${username}`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  if (loading) {
    return <div className="overview-page"><p>Loading analytics...</p></div>;
  }

  if (error) {
    return (
      <div className="overview-page">
        <p className="error">{error}</p>
        <button onClick={() => navigate('/search')}>Search another user</button>
      </div>
    );
  }

  const { profile, totalRepos, totalStars, totalForks, avgStars, avgForks, mostStarredRepository, mostForkedRepository, languageDistribution } = data;

  const languageData = Object.entries(languageDistribution || {}).map(([lang, count]) => ({ name: lang, value: count }));
  const COLORS = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'];

  return (
    <div className="overview-page">
      <section className="profile-card">
        <img src={profile.avatarUrl} alt="Avatar" className="avatar" />
        <div className="info">
          <h2>{profile.name || profile.username}</h2>
          <p className="username">@{profile.username}</p>
          {profile.bio && <p className="bio">{profile.bio}</p>}
          <p className="details">
            {profile.location && <span>{profile.location}</span>}{profile.location && profile.createdAt ? ' • ' : ''}
            {profile.createdAt && <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>}
          </p>
          <p className="stats">
            <span>{profile.followers} Followers</span> • <span>{profile.following} Following</span> • <span>{profile.publicRepos} Public Repos</span>
          </p>
        </div>
      </section>

      <section className="analytics-cards">
        <div className="card"><h3>Total Repos</h3><p>{totalRepos}</p></div>
        <div className="card"><h3>Total Stars</h3><p>{totalStars}</p></div>
        <div className="card"><h3>Total Forks</h3><p>{totalForks}</p></div>
        <div className="card"><h3>Avg Stars/Repo</h3><p>{avgStars}</p></div>
        <div className="card"><h3>Avg Forks/Repo</h3><p>{avgForks}</p></div>
        {mostStarredRepository && (
          <div className="card">
            <h3>Most Starred Repo</h3>
            <p>{mostStarredRepository.name} ({mostStarredRepository.stars} ★)</p>
          </div>
        )}
        {mostForkedRepository && (
          <div className="card">
            <h3>Most Forked Repo</h3>
            <p>{mostForkedRepository.name} ({mostForkedRepository.forks} ⎇)</p>
          </div>
        )}
      </section>

      <section className="language-chart">
        <h3>Language Distribution</h3>
        {languageData.length > 0 ? (
          <PieChart width={400} height={300}>
            <Pie data={languageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {languageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <p>No language data available.</p>
        )}
      </section>
    </div>
  );
}
