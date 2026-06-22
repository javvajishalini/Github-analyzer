import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Achievements.css';

/* ─────────────────────────────────────────────────────────────
   Achievement definitions
   Each entry has:
     id, tier ('bronze'|'silver'|'gold'|'platinum'), icon, label,
     description, check(data) → boolean, stat(data) → string
   ───────────────────────────────────────────────────────────── */
const ACHIEVEMENT_DEFS = [
  /* ── Stars ── */
  {
    id: 'star_1',
    category: 'Stars',
    tier: 'bronze',
    icon: '⭐',
    label: 'Star Collector',
    description: 'Earned at least 10 total stars across all repositories.',
    check: (d) => d.totalStars >= 10,
    stat: (d) => `${d.totalStars} stars`,
  },
  {
    id: 'star_2',
    category: 'Stars',
    tier: 'silver',
    icon: '🌟',
    label: 'Rising Star',
    description: 'Earned at least 100 total stars.',
    check: (d) => d.totalStars >= 100,
    stat: (d) => `${d.totalStars} stars`,
  },
  {
    id: 'star_3',
    category: 'Stars',
    tier: 'gold',
    icon: '💫',
    label: 'Star Magnet',
    description: 'Earned at least 500 total stars.',
    check: (d) => d.totalStars >= 500,
    stat: (d) => `${d.totalStars} stars`,
  },
  {
    id: 'star_4',
    category: 'Stars',
    tier: 'platinum',
    icon: '🏅',
    label: 'Stargazer',
    description: 'Earned 1,000+ total stars. You\'re a legend!',
    check: (d) => d.totalStars >= 1000,
    stat: (d) => `${d.totalStars} stars`,
  },

  /* ── Repositories ── */
  {
    id: 'repo_1',
    category: 'Repositories',
    tier: 'bronze',
    icon: '📦',
    label: 'Repository Rookie',
    description: 'Created at least 5 public repositories.',
    check: (d) => d.totalRepos >= 5,
    stat: (d) => `${d.totalRepos} repos`,
  },
  {
    id: 'repo_2',
    category: 'Repositories',
    tier: 'silver',
    icon: '🗂️',
    label: 'Repo Builder',
    description: 'Created at least 20 public repositories.',
    check: (d) => d.totalRepos >= 20,
    stat: (d) => `${d.totalRepos} repos`,
  },
  {
    id: 'repo_3',
    category: 'Repositories',
    tier: 'gold',
    icon: '🏗️',
    label: 'Prolific Creator',
    description: 'Created at least 50 public repositories.',
    check: (d) => d.totalRepos >= 50,
    stat: (d) => `${d.totalRepos} repos`,
  },
  {
    id: 'repo_4',
    category: 'Repositories',
    tier: 'platinum',
    icon: '🏛️',
    label: 'Open Source Architect',
    description: '100+ public repositories. Truly prolific.',
    check: (d) => d.totalRepos >= 100,
    stat: (d) => `${d.totalRepos} repos`,
  },

  /* ── Forks ── */
  {
    id: 'fork_1',
    category: 'Forks',
    tier: 'bronze',
    icon: '🍴',
    label: 'Fork Starter',
    description: 'Your work has been forked at least 5 times.',
    check: (d) => d.totalForks >= 5,
    stat: (d) => `${d.totalForks} forks`,
  },
  {
    id: 'fork_2',
    category: 'Forks',
    tier: 'silver',
    icon: '🔱',
    label: 'Fork Champion',
    description: 'Your work has been forked at least 50 times.',
    check: (d) => d.totalForks >= 50,
    stat: (d) => `${d.totalForks} forks`,
  },
  {
    id: 'fork_3',
    category: 'Forks',
    tier: 'gold',
    icon: '⚜️',
    label: 'Community Catalyst',
    description: 'Your work has been forked 200+ times.',
    check: (d) => d.totalForks >= 200,
    stat: (d) => `${d.totalForks} forks`,
  },

  /* ── Followers ── */
  {
    id: 'follow_1',
    category: 'Social',
    tier: 'bronze',
    icon: '👥',
    label: 'Community Member',
    description: 'Gained at least 10 followers.',
    check: (d) => d.profile?.followers >= 10,
    stat: (d) => `${d.profile?.followers} followers`,
  },
  {
    id: 'follow_2',
    category: 'Social',
    tier: 'silver',
    icon: '📣',
    label: 'Influential Coder',
    description: 'Gained at least 100 followers.',
    check: (d) => d.profile?.followers >= 100,
    stat: (d) => `${d.profile?.followers} followers`,
  },
  {
    id: 'follow_3',
    category: 'Social',
    tier: 'gold',
    icon: '🎤',
    label: 'Open Source Celebrity',
    description: 'Gained 500+ followers.',
    check: (d) => d.profile?.followers >= 500,
    stat: (d) => `${d.profile?.followers} followers`,
  },
  {
    id: 'follow_4',
    category: 'Social',
    tier: 'platinum',
    icon: '👑',
    label: 'GitHub Royalty',
    description: '1,000+ followers. A true GitHub icon.',
    check: (d) => d.profile?.followers >= 1000,
    stat: (d) => `${d.profile?.followers} followers`,
  },

  /* ── Languages ── */
  {
    id: 'lang_1',
    category: 'Languages',
    tier: 'bronze',
    icon: '💻',
    label: 'Polyglot Beginner',
    description: 'Used at least 3 different programming languages.',
    check: (d) => Object.keys(d.languageDistribution || {}).length >= 3,
    stat: (d) => `${Object.keys(d.languageDistribution || {}).length} languages`,
  },
  {
    id: 'lang_2',
    category: 'Languages',
    tier: 'silver',
    icon: '🌐',
    label: 'Polyglot Developer',
    description: 'Used at least 6 different programming languages.',
    check: (d) => Object.keys(d.languageDistribution || {}).length >= 6,
    stat: (d) => `${Object.keys(d.languageDistribution || {}).length} languages`,
  },
  {
    id: 'lang_3',
    category: 'Languages',
    tier: 'gold',
    icon: '🗺️',
    label: 'Master Polyglot',
    description: 'Used 10+ different programming languages.',
    check: (d) => Object.keys(d.languageDistribution || {}).length >= 10,
    stat: (d) => `${Object.keys(d.languageDistribution || {}).length} languages`,
  },

  /* ── Veteran ── */
  {
    id: 'veteran_1',
    category: 'Veteran',
    tier: 'bronze',
    icon: '📅',
    label: 'Early Adopter',
    description: 'GitHub account is at least 1 year old.',
    check: (d) => {
      if (!d.profile?.createdAt) return false;
      const years = (Date.now() - new Date(d.profile.createdAt)) / (1000 * 60 * 60 * 24 * 365);
      return years >= 1;
    },
    stat: (d) => {
      if (!d.profile?.createdAt) return '';
      const years = ((Date.now() - new Date(d.profile.createdAt)) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
      return `${years} yrs old`;
    },
  },
  {
    id: 'veteran_2',
    category: 'Veteran',
    tier: 'silver',
    icon: '🏆',
    label: 'GitHub Veteran',
    description: 'GitHub account is at least 3 years old.',
    check: (d) => {
      if (!d.profile?.createdAt) return false;
      const years = (Date.now() - new Date(d.profile.createdAt)) / (1000 * 60 * 60 * 24 * 365);
      return years >= 3;
    },
    stat: (d) => {
      if (!d.profile?.createdAt) return '';
      const years = ((Date.now() - new Date(d.profile.createdAt)) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
      return `${years} yrs old`;
    },
  },
  {
    id: 'veteran_3',
    category: 'Veteran',
    tier: 'gold',
    icon: '🦅',
    label: 'GitHub Elder',
    description: 'GitHub account is at least 5 years old.',
    check: (d) => {
      if (!d.profile?.createdAt) return false;
      const years = (Date.now() - new Date(d.profile.createdAt)) / (1000 * 60 * 60 * 24 * 365);
      return years >= 5;
    },
    stat: (d) => {
      if (!d.profile?.createdAt) return '';
      const years = ((Date.now() - new Date(d.profile.createdAt)) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
      return `${years} yrs old`;
    },
  },

  /* ── Quality ── */
  {
    id: 'quality_1',
    category: 'Quality',
    tier: 'silver',
    icon: '✨',
    label: 'Avg Star Power',
    description: 'Average stars per repository is at least 5.',
    check: (d) => (d.avgStars || 0) >= 5,
    stat: (d) => `${d.avgStars} avg stars`,
  },
  {
    id: 'quality_2',
    category: 'Quality',
    tier: 'gold',
    icon: '💎',
    label: 'Quality Over Quantity',
    description: 'Average stars per repository is at least 20.',
    check: (d) => (d.avgStars || 0) >= 20,
    stat: (d) => `${d.avgStars} avg stars`,
  },
  {
    id: 'quality_3',
    category: 'Quality',
    tier: 'platinum',
    icon: '🔮',
    label: 'Viral Repo Master',
    description: 'Most starred repository has 1,000+ stars.',
    check: (d) => (d.mostStarredRepository?.stars || 0) >= 1000,
    stat: (d) => `${d.mostStarredRepository?.stars || 0} stars on top repo`,
  },

  /* ── Bio ── */
  {
    id: 'profile_1',
    category: 'Profile',
    tier: 'bronze',
    icon: '🪪',
    label: 'Profile Complete',
    description: 'Has a bio, location, and public repos configured.',
    check: (d) => !!(d.profile?.bio && d.profile?.location),
    stat: () => 'Bio + Location set',
  },
];

/* ─────────────────────────────────────────────────────────────
   Tier config
   ───────────────────────────────────────────────────────────── */
const TIER_CONFIG = {
  platinum: { label: 'Platinum', color: '#e2e8f0', glow: 'rgba(226,232,240,0.3)', bg: 'rgba(226,232,240,0.08)', border: 'rgba(226,232,240,0.25)' },
  gold:     { label: 'Gold',     color: '#fbbf24', glow: 'rgba(251,191,36,0.3)',  bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)' },
  silver:   { label: 'Silver',   color: '#94a3b8', glow: 'rgba(148,163,184,0.25)',bg: 'rgba(148,163,184,0.07)', border: 'rgba(148,163,184,0.2)' },
  bronze:   { label: 'Bronze',   color: '#f97316', glow: 'rgba(249,115,22,0.25)', bg: 'rgba(249,115,22,0.07)',  border: 'rgba(249,115,22,0.2)' },
};

const TIER_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

/* ─────────────────────────────────────────────────────────────
   Badge Card
   ───────────────────────────────────────────────────────────── */
function BadgeCard({ def, unlocked, delay }) {
  const tc = TIER_CONFIG[def.tier];
  return (
    <div
      className={`badge-card animate-fade-in ${unlocked ? 'unlocked' : 'locked'}`}
      style={{
        animationDelay: `${delay}ms`,
        '--badge-color': tc.color,
        '--badge-glow': tc.glow,
        '--badge-bg': tc.bg,
        '--badge-border': tc.border,
      }}
    >
      <div className="badge-icon-wrap">
        <span className="badge-icon">{def.icon}</span>
        {!unlocked && <div className="badge-lock-overlay">🔒</div>}
      </div>
      <div className="badge-body">
        <div className="badge-tier-pill" style={{ color: tc.color, borderColor: tc.border, background: tc.bg }}>
          {tc.label}
        </div>
        <div className="badge-label">{def.label}</div>
        <div className="badge-desc">{def.description}</div>
        {unlocked && <div className="badge-stat">✓ {def.stat ? def.stat({ totalStars: 0 }) : ''}</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────────── */
export default function Achievements() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username 
    || localStorage.getItem('git_analyzer_current_user') 
    || localStorage.getItem('git_analyzer_session');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTier, setFilterTier] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  useEffect(() => {
    if (!username) { setError('Please search for a GitHub user first.'); setLoading(false); return; }
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

  if (loading) {
    return (
      <div className="achievements-loading">
        <div className="spinner" />
        <p>Computing achievements for @{username}…</p>
      </div>
    );
  }
  if (error || !username) {
    return (
      <div className="achievements-error">
        <p className="error">⚠️ {error}</p>
        <button onClick={() => navigate('/search')}>Go to Search</button>
      </div>
    );
  }

  /* Evaluate all achievements */
  const evaluated = ACHIEVEMENT_DEFS.map(def => ({
    ...def,
    unlocked: (() => { try { return def.check(data); } catch { return false; } })(),
    statText: (() => { try { return def.stat ? def.stat(data) : ''; } catch { return ''; } })(),
  }));

  const unlockedCount = evaluated.filter(e => e.unlocked).length;
  const totalCount = evaluated.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);

  /* Filter */
  const categories = ['all', ...Array.from(new Set(ACHIEVEMENT_DEFS.map(d => d.category)))];
  const filtered = evaluated
    .filter(e => filterTier === 'all' || e.tier === filterTier)
    .filter(e => filterCategory === 'all' || e.category === filterCategory)
    .filter(e => !showUnlockedOnly || e.unlocked)
    .sort((a, b) => {
      if (a.unlocked !== b.unlocked) return b.unlocked ? 1 : -1;
      return TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
    });

  /* Tier summary */
  const tierSummary = TIER_ORDER.map(tier => ({
    tier,
    ...TIER_CONFIG[tier],
    earned: evaluated.filter(e => e.tier === tier && e.unlocked).length,
    total: evaluated.filter(e => e.tier === tier).length,
  }));

  return (
    <div className="achievements-page">
      {/* Header */}
      <div className="achievements-header">
        <div>
          <h2>Achievements</h2>
          <p className="achievements-sub">Badges earned by <strong>@{username}</strong> based on GitHub activity</p>
        </div>
        <div className="achievements-summary-badge">
          <span className="ach-count">{unlockedCount}</span>
          <span className="ach-total">/ {totalCount}</span>
          <span className="ach-label">Unlocked</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="achievements-progress-wrap">
        <div className="achievements-progress-bar">
          <div
            className="achievements-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="achievements-progress-pct">{progressPct}% complete</span>
      </div>

      {/* Tier summary row */}
      <div className="tier-summary-row">
        {tierSummary.map(t => (
          <div
            key={t.tier}
            className="tier-summary-card"
            style={{ '--tc': t.color, '--tb': t.border, '--tbg': t.bg }}
          >
            <div className="tier-summary-label" style={{ color: t.color }}>{t.label}</div>
            <div className="tier-summary-count">{t.earned}<span>/{t.total}</span></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="achievements-filters">
        {/* Tier filter */}
        <div className="filter-group">
          <span className="filter-label">Tier:</span>
          {['all', ...TIER_ORDER].map(t => (
            <button
              key={t}
              className={`filter-btn ${filterTier === t ? 'active' : ''}`}
              style={filterTier === t && t !== 'all' ? {
                color: TIER_CONFIG[t]?.color,
                borderColor: TIER_CONFIG[t]?.border,
                background: TIER_CONFIG[t]?.bg,
              } : {}}
              onClick={() => setFilterTier(t)}
            >
              {t === 'all' ? 'All' : TIER_CONFIG[t].label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="filter-group">
          <span className="filter-label">Category:</span>
          <select
            className="filter-select"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        {/* Unlocked toggle */}
        <button
          className={`filter-btn ${showUnlockedOnly ? 'active' : ''}`}
          onClick={() => setShowUnlockedOnly(v => !v)}
        >
          {showUnlockedOnly ? '✓ Unlocked Only' : 'Show All'}
        </button>
      </div>

      {/* Badge grid */}
      {filtered.length === 0 ? (
        <div className="achievements-empty">
          <span>🔍</span>
          <p>No badges match your current filters.</p>
        </div>
      ) : (
        <div className="badges-grid">
          {filtered.map((def, i) => (
            <div
              key={def.id}
              className={`badge-card animate-fade-in ${def.unlocked ? 'unlocked' : 'locked'}`}
              style={{
                animationDelay: `${i * 40}ms`,
                '--badge-color': TIER_CONFIG[def.tier].color,
                '--badge-glow': TIER_CONFIG[def.tier].glow,
                '--badge-bg': TIER_CONFIG[def.tier].bg,
                '--badge-border': TIER_CONFIG[def.tier].border,
              }}
            >
              <div className="badge-icon-wrap">
                <span className="badge-icon">{def.icon}</span>
                {!def.unlocked && <div className="badge-lock-overlay">🔒</div>}
              </div>
              <div className="badge-body">
                <div className="badge-tier-pill">
                  {TIER_CONFIG[def.tier].label}
                </div>
                <div className="badge-label">{def.label}</div>
                <div className="badge-desc">{def.description}</div>
                {def.unlocked && def.statText && (
                  <div className="badge-stat">✓ {def.statText}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
