import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Overview.css';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/* ── PDF Export ── */
const exportPDF = async (username) => {
  const element = document.querySelector('.overview-page');
  if (!element) return;
  const canvas = await html2canvas(element, {
    useCORS: true, scale: 2, backgroundColor: '#0f172a'
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${username}_overview.pdf`);
};

/* ── Chart Colors ── */
const CHART_COLORS = [
  '#2563EB', '#7C3AED', '#06B6D4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
  '#14b8a6', '#f97316'
];

/* ── Custom Pie Tooltip ── */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--tooltip-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        fontSize: '0.875rem',
      }}>
        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
          {payload[0].name}
        </p>
        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>
          {payload[0].value} repos
        </p>
      </div>
    );
  }
  return null;
};

/* ── Export icon ── */
const ExportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

/* ── Stat Card ── */
const StatCard = ({ label, value, icon, colorClass, delay = 0 }) => (
  <div
    className="stat-card animate-fade-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`stat-card-icon ${colorClass}`}>{icon}</div>
    <div>
      <div className="stat-card-label">{label}</div>
      <div className={`stat-card-value ${colorClass}`}>{value}</div>
    </div>
  </div>
);

/* ── Main Component ── */
export default function Overview() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || localStorage.getItem('git_analyzer_session');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!username) { setError('Please search for a GitHub user first.'); setLoading(false); return; }
    
    const savedProfiles = JSON.parse(localStorage.getItem('git_analyzer_bookmarks_users') || '[]');
    setIsBookmarked(savedProfiles.some(p => p.username.toLowerCase() === username.toLowerCase()));

    const fetchData = async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(`/api/github/analytics/${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error('Failed to fetch analytics from server.');
        setData(await res.json());
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [username]);

  const toggleBookmark = () => {
    let savedProfiles = JSON.parse(localStorage.getItem('git_analyzer_bookmarks_users') || '[]');
    if (isBookmarked) {
      savedProfiles = savedProfiles.filter(p => p.username.toLowerCase() !== username.toLowerCase());
    } else {
      savedProfiles.push({
        username: data.profile.username,
        avatarUrl: data.profile.avatarUrl
      });
    }
    localStorage.setItem('git_analyzer_bookmarks_users', JSON.stringify(savedProfiles));
    setIsBookmarked(!isBookmarked);
    window.dispatchEvent(new Event('bookmarksUpdated'));
  };

  if (loading) {
    return (
      <div className="overview-page-loading">
        <div className="spinner" />
        <p>Analyzing GitHub profile…</p>
      </div>
    );
  }

  if (error || !username) {
    return (
      <div className="overview-page-error">
        <p className="error">⚠️ {error}</p>
        <button className="search-redirect-btn" onClick={() => navigate('/search')}>
          Go to Search
        </button>
      </div>
    );
  }

  const computeMostUsedLanguage = () => {
    if (!data || !data.languageDistribution) return 'N/A';
    const langs = Object.entries(data.languageDistribution).sort((a, b) => b[1] - a[1]);
    return langs.length > 0 ? langs[0][0] : 'N/A';
  };

  const computeAccountAge = () => {
    if (!data || !data.profile.createdAt) return 'N/A';
    const created = new Date(data.profile.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;
    if (diffYears > 0) return `${diffYears} yrs ${remainingDays} days`;
    return `${diffDays} days`;
  };

  const computeMostActiveYear = () => {
    if (!data || !data.repositories) return 'N/A';
    const yearCounts = {};
    data.repositories.forEach(r => {
      if (r.updatedAt) {
        const yr = new Date(r.updatedAt).getFullYear();
        yearCounts[yr] = (yearCounts[yr] || 0) + 1;
      }
    });
    const sortedYears = Object.entries(yearCounts).sort((a, b) => b[1] - a[1]);
    return sortedYears.length > 0 ? sortedYears[0][0] : 'N/A';
  };

  const {
    profile, totalRepos, totalStars, totalForks,
    avgStars, avgForks, mostStarredRepository,
    mostForkedRepository, languageDistribution
  } = data;

  const mostUsedLang = computeMostUsedLanguage();
  const accountAge = computeAccountAge();
  const mostActiveYear = computeMostActiveYear();

  const languageData = Object.entries(languageDistribution || {})
    .map(([lang, count]) => ({ name: lang || 'Unknown', value: count }))
    .sort((a, b) => b.value - a.value);

  const statCards = [
    { label: 'Total Repos',   value: totalRepos,  icon: '📦', colorClass: 'blue'   },
    { label: 'Total Stars',   value: totalStars,  icon: '⭐', colorClass: 'amber'  },
    { label: 'Total Forks',   value: totalForks,  icon: '🍴', colorClass: 'cyan'   },
    { label: 'Avg Stars',     value: avgStars,    icon: '✨', colorClass: 'purple' },
    { label: 'Avg Forks',     value: avgForks,    icon: '📊', colorClass: 'green'  },
  ];

  return (
    <div className="overview-page">
      {/* Header Row */}
      <div className="overview-header-row">
        <div>
          <h2>Developer Diagnostics</h2>
          <p className="overview-header-sub">
            Showing insights for <strong>@{username}</strong>
          </p>
        </div>
        <button
          className="export-button"
          onClick={() => exportPDF(username)}
          id="export-pdf-btn"
        >
          <ExportIcon /> Export PDF
        </button>
      </div>

      {/* Profile Card */}
      <section className="profile-card animate-fade-in">
        <div className="profile-avatar-wrap">
          <img src={profile.avatarUrl} alt="Avatar" className="avatar" />
        </div>
        <div className="info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h2>{profile.name || profile.username}</h2>
            <button 
              onClick={toggleBookmark}
              style={{
                background: isBookmarked ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: isBookmarked ? '#60a5fa' : 'var(--text-secondary)',
                border: `1px solid ${isBookmarked ? 'rgba(37, 99, 235, 0.3)' : 'var(--border-color)'}`,
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              {isBookmarked ? 'Bookmarked' : 'Bookmark User'}
            </button>
          </div>
          <p className="username">@{profile.username}</p>
          {profile.bio && <p className="bio">{profile.bio}</p>}
          <p className="details">
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.location && profile.createdAt && <span>·</span>}
            {profile.createdAt && (
              <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            )}
          </p>
          <div className="stats-row">
            <div className="stat-pill"><strong>{profile.followers}</strong> followers</div>
            <div className="stat-pill"><strong>{profile.following}</strong> following</div>
            <div className="stat-pill"><strong>{profile.publicRepos}</strong> public repos</div>
          </div>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="analytics-cards">
        {statCards.map((c, i) => (
          <StatCard key={c.label} {...c} delay={i * 60} />
        ))}
      </section>

      {/* Grid: chart + standouts */}
      <div className="overview-stats-grid animate-fade-in" style={{ animationDelay: '100ms' }}>
        
        {/* Profile Insights Card */}
        <div className="glass-card insights-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Profile Insights</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Account Age</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{accountAge}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Most Active Year</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{mostActiveYear}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Most Used Language</div>
              <div style={{ fontWeight: 700, color: '#a78bfa' }}>{mostUsedLang}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Most Starred Repo</div>
              <div style={{ fontWeight: 700, color: '#fbbf24', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={data.mostStarredRepository?.name || 'N/A'}>
                {data.mostStarredRepository?.name || 'N/A'}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Followers / Following Ratio</div>
              <div style={{ fontWeight: 700, color: '#60a5fa' }}>
                {profile.following > 0 ? (profile.followers / profile.following).toFixed(2) : profile.followers}
              </div>
            </div>
          </div>
        </div>

        {/* Existing Donut Chart */}
        <div className="grid-card">
          <div className="grid-card-title">
            <span style={{ fontSize: '1.1rem' }}>🌐</span>
            Language Distribution
          </div>
          {languageData.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={38}
                    paddingAngle={2}
                    animationBegin={0}
                    animationDuration={800}
                    label={({ name, percent }) =>
                      percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    labelLine={false}
                  >
                    {languageData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>{v}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No language data available.
            </p>
          )}
        </div>

        {/* Standout Repos */}
        <div className="grid-card">
          <div className="grid-card-title">
            <span style={{ fontSize: '1.1rem' }}>🏆</span>
            Standout Repositories
          </div>
          <div className="standout-list">
            {mostStarredRepository && (
              <div className="standout-item">
                <div className="tag starred">★ Most Starred</div>
                <a
                  href={mostStarredRepository.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-name"
                >
                  {mostStarredRepository.name}
                </a>
                <p className="repo-desc">
                  {mostStarredRepository.description || 'No description available'}
                </p>
                <div className="repo-meta">
                  <span>⭐ {mostStarredRepository.stars} stars</span>
                  <span>💻 {mostStarredRepository.language || 'Plain Text'}</span>
                </div>
              </div>
            )}
            {mostForkedRepository && (
              <div className="standout-item">
                <div className="tag forked">⎇ Most Forked</div>
                <a
                  href={mostForkedRepository.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-name"
                >
                  {mostForkedRepository.name}
                </a>
                <p className="repo-desc">
                  {mostForkedRepository.description || 'No description available'}
                </p>
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
