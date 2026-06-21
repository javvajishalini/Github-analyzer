import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Overview.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const exportPDF = async (username) => {
  const element = document.querySelector('.overview-page');
  if (!element) return;
  const canvas = await html2canvas(element, {
    useCORS: true,
    scale: 2,
    backgroundColor: '#0f172a' // match slate-900 background for pdf
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${username}_overview.pdf`);
};

export default function Overview() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Resolve target username: state, then logged-in session, then null
  const username = location.state?.username || localStorage.getItem('git_analyzer_session');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) {
      setError('Please search for a GitHub user first.');
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/github/analytics/${encodeURIComponent(username)}`);
        if (!res.ok) {
          throw new Error('Failed to fetch analytics from server.');
        }
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
    return (
      <div className="overview-page-loading">
        <div className="spinner" />
        <p>Analyzing GitHub Profile Diagnostics...</p>
      </div>
    );
  }

  if (error || !username) {
    return (
      <div className="overview-page-error">
        <p className="error">⚠️ {error}</p>
        <button className="search-redirect-btn" onClick={() => navigate('/search')}>
          Go to Search Page
        </button>
      </div>
    );
  }

  const { 
    profile, 
    totalRepos, 
    totalStars, 
    totalForks, 
    avgStars, 
    avgForks, 
    mostStarredRepository, 
    mostForkedRepository, 
    languageDistribution 
  } = data;

  const languageData = Object.entries(languageDistribution || {})
    .map(([lang, count]) => ({ name: lang || 'Unknown', value: count }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#14b8a6', '#84cc16'];

  return (
    <div className="overview-page">
      <div className="overview-header-row">
        <h2>Developer Diagnostics Overview</h2>
        <button className="export-button" onClick={() => exportPDF(username)}>
          Export PDF Report 📄
        </button>
      </div>

      <section className="profile-card animate-fade-in">
        <img src={profile.avatarUrl} alt="Avatar" className="avatar" />
        <div className="info">
          <h2>{profile.name || profile.username}</h2>
          <p className="username">@{profile.username}</p>
          {profile.bio && <p className="bio">{profile.bio}</p>}
          <p className="details">
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.location && profile.createdAt ? ' • ' : ''}
            {profile.createdAt && <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>}
          </p>
          <div className="stats-row">
            <div className="stat-pill"><strong>{profile.followers}</strong> followers</div>
            <div className="stat-pill"><strong>{profile.following}</strong> following</div>
            <div className="stat-pill"><strong>{profile.publicRepos}</strong> public repos</div>
          </div>
        </div>
      </section>

      <section className="analytics-cards animate-fade-in">
        <div className="card">
          <h3>Total Repos</h3>
          <p className="card-value">{totalRepos}</p>
        </div>
        <div className="card">
          <h3>Total Stars</h3>
          <p className="card-value stars">{totalStars} ★</p>
        </div>
        <div className="card">
          <h3>Total Forks</h3>
          <p className="card-value forks">{totalForks} ⎇</p>
        </div>
        <div className="card">
          <h3>Avg Stars/Repo</h3>
          <p className="card-value">{avgStars}</p>
        </div>
        <div className="card">
          <h3>Avg Forks/Repo</h3>
          <p className="card-value">{avgForks}</p>
        </div>
      </section>

      <div className="overview-grid animate-fade-in">
        <div className="grid-card language-chart">
          <h3>Language Distribution</h3>
          {languageData.length > 0 ? (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={languageData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border-color)', color: 'var(--text-h)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="no-data">No language data available.</p>
          )}
        </div>

        <div className="grid-card standout-repos">
          <h3>Standout Repositories</h3>
          <div className="standout-list">
            {mostStarredRepository && (
              <div className="standout-item">
                <div className="tag starred">★ Most Starred</div>
                <a href={mostStarredRepository.htmlUrl} target="_blank" rel="noopener noreferrer" className="repo-name">
                  {mostStarredRepository.name}
                </a>
                <p className="repo-desc">{mostStarredRepository.description || 'No description available'}</p>
                <div className="repo-meta">
                  <span>⭐ {mostStarredRepository.stars} stars</span>
                  <span>💻 {mostStarredRepository.language || 'Plain Text'}</span>
                </div>
              </div>
            )}
            {mostForkedRepository && (
              <div className="standout-item">
                <div className="tag forked">⎇ Most Forked</div>
                <a href={mostForkedRepository.htmlUrl} target="_blank" rel="noopener noreferrer" className="repo-name">
                  {mostForkedRepository.name}
                </a>
                <p className="repo-desc">{mostForkedRepository.description || 'No description available'}</p>
                <div className="repo-meta">
                  <span>🍴 {mostForkedRepository.forks} forks</span>
                  <span>💻 {mostForkedRepository.language || 'Plain Text'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
