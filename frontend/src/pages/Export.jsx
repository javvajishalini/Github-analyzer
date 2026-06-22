import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './Export.css';

/* ── helpers ── */
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

const accountAge = (createdAt) => {
  if (!createdAt) return 'N/A';
  const ms = Date.now() - new Date(createdAt);
  const yrs = Math.floor(ms / (1000 * 60 * 60 * 24 * 365));
  const days = Math.floor((ms % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24));
  return yrs > 0 ? `${yrs} yrs ${days} days` : `${days} days`;
};

/* ── CSV builder ── */
function arrayToCSV(rows) {
  return rows.map(r =>
    r.map(cell => {
      const s = String(cell ?? '').replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(',')
  ).join('\n');
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ── Report Preview Card ── */
function PreviewCard({ title, icon, children }) {
  return (
    <div className="export-preview-card">
      <div className="export-preview-card-title">
        <span>{icon}</span> {title}
      </div>
      {children}
    </div>
  );
}

/* ── Stat Row ── */
function StatRow({ label, value, accent }) {
  return (
    <div className="export-stat-row">
      <span className="export-stat-label">{label}</span>
      <span className="export-stat-value" style={accent ? { color: accent } : {}}>{value}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════ */
export default function Export() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username 
    || localStorage.getItem('git_analyzer_current_user') 
    || localStorage.getItem('git_analyzer_session');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState('');   // 'pdf' | 'csv-repos' | 'csv-lang' | 'json' | ''
  const [toast, setToast] = useState('');
  const previewRef = useRef(null);

  useEffect(() => {
    if (!username) { setError('No user session found.'); setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/github/analytics/${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error('Failed to fetch analytics.');
        setData(await res.json());
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [username]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  /* ── Export: JSON ── */
  const exportJSON = () => {
    setExporting('json');
    try {
      const payload = JSON.stringify(data, null, 2);
      downloadFile(payload, `${username}_github_report.json`, 'application/json');
      showToast('✅ JSON exported successfully!');
    } finally { setExporting(''); }
  };

  /* ── Export: CSV – Repositories ── */
  const exportCSVRepos = () => {
    setExporting('csv-repos');
    try {
      const headers = ['Name', 'Stars', 'Forks', 'Language', 'Description', 'Created At', 'Updated At', 'URL'];
      const rows = (data.repositories || []).map(r => [
        r.name, r.stars, r.forks, r.language || '', r.description || '',
        fmtDate(r.createdAt), fmtDate(r.updatedAt), r.htmlUrl || '',
      ]);
      downloadFile(arrayToCSV([headers, ...rows]), `${username}_repositories.csv`, 'text/csv');
      showToast('✅ Repository CSV exported!');
    } finally { setExporting(''); }
  };

  /* ── Export: CSV – Language Distribution ── */
  const exportCSVLanguages = () => {
    setExporting('csv-lang');
    try {
      const headers = ['Language', 'Bytes', '% Share'];
      const langs = Object.entries(data.languageDistribution || {}).sort((a, b) => b[1] - a[1]);
      const total = langs.reduce((s, [, v]) => s + v, 0);
      const rows = langs.map(([lang, bytes]) => [
        lang, bytes, total > 0 ? ((bytes / total) * 100).toFixed(2) + '%' : '0%',
      ]);
      downloadFile(arrayToCSV([headers, ...rows]), `${username}_languages.csv`, 'text/csv');
      showToast('✅ Language CSV exported!');
    } finally { setExporting(''); }
  };

  /* ── Export: PDF (screenshot of preview panel) ── */
  const exportPDF = async () => {
    if (!previewRef.current) return;
    setExporting('pdf');
    try {
      const el = previewRef.current;
      const canvas = await html2canvas(el, {
        useCORS: true, scale: 2,
        backgroundColor: '#0f172a',
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const iw = canvas.width;
      const ih = canvas.height;
      const ratio = pw / (iw / 2 * 0.264583);   // px → mm at 96dpi
      const scaledH = (ih / 2) * 0.264583 * (pw / ((iw / 2) * 0.264583));

      // multi-page if tall
      let y = 0;
      while (y < scaledH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(img, 'PNG', 0, -y, pw, scaledH);
        y += ph;
      }
      pdf.save(`${username}_github_report.pdf`);
      showToast('✅ PDF exported successfully!');
    } catch (e) {
      showToast('❌ PDF export failed: ' + e.message);
    } finally { setExporting(''); }
  };

  /* ── States ── */
  if (loading) return (
    <div className="export-center">
      <div className="spinner" />
      <p>Loading report for @{username}…</p>
    </div>
  );
  if (error || !username) return (
    <div className="export-center">
      <p className="export-error">⚠️ {error || 'No user session.'}</p>
      <button className="export-go-search" onClick={() => navigate('/search')}>Go to Search</button>
    </div>
  );

  const { profile, totalRepos, totalStars, totalForks, avgStars, avgForks,
    mostStarredRepository, mostForkedRepository, languageDistribution, repositories } = data;

  const topLangs = Object.entries(languageDistribution || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topByStars = [...(repositories || [])].sort((a, b) => b.stars - a.stars).slice(0, 5);
  const topByForks = [...(repositories || [])].sort((a, b) => b.forks - a.forks).slice(0, 5);

  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="export-page">
      {/* Toast */}
      {toast && <div className="export-toast">{toast}</div>}

      {/* Page Header */}
      <div className="export-page-header">
        <div>
          <h2>Export Reports</h2>
          <p className="export-page-sub">Download full GitHub analytics for <strong>@{username}</strong></p>
        </div>
      </div>

      {/* Export Action Cards */}
      <div className="export-actions-grid">

        {/* PDF */}
        <div className="export-action-card export-action-pdf">
          <div className="export-action-icon">📄</div>
          <div className="export-action-body">
            <div className="export-action-title">Full PDF Report</div>
            <div className="export-action-desc">
              A beautifully formatted multi-section PDF including profile stats, top repositories, language breakdown, and key insights.
            </div>
            <div className="export-action-tags">
              <span>Profile</span><span>Repos</span><span>Languages</span><span>Insights</span>
            </div>
          </div>
          <button
            className="export-btn export-btn-pdf"
            onClick={exportPDF}
            disabled={!!exporting}
            id="export-pdf-report-btn"
          >
            {exporting === 'pdf' ? <span className="spinner-sm" /> : '⬇'}
            {exporting === 'pdf' ? 'Generating…' : 'Download PDF'}
          </button>
        </div>

        {/* CSV Repos */}
        <div className="export-action-card export-action-csv">
          <div className="export-action-icon">📊</div>
          <div className="export-action-body">
            <div className="export-action-title">Repositories CSV</div>
            <div className="export-action-desc">
              Spreadsheet-ready CSV of all public repositories with stars, forks, language, dates and links.
            </div>
            <div className="export-action-tags">
              <span>{repositories?.length || 0} repos</span><span>Stars</span><span>Forks</span><span>Dates</span>
            </div>
          </div>
          <button
            className="export-btn export-btn-csv"
            onClick={exportCSVRepos}
            disabled={!!exporting}
            id="export-repos-csv-btn"
          >
            {exporting === 'csv-repos' ? <span className="spinner-sm" /> : '⬇'}
            {exporting === 'csv-repos' ? 'Exporting…' : 'Download CSV'}
          </button>
        </div>

        {/* CSV Languages */}
        <div className="export-action-card export-action-csv">
          <div className="export-action-icon">🌐</div>
          <div className="export-action-body">
            <div className="export-action-title">Language Stats CSV</div>
            <div className="export-action-desc">
              Language distribution by bytes and percentage share across all repositories.
            </div>
            <div className="export-action-tags">
              <span>{Object.keys(languageDistribution || {}).length} languages</span><span>Bytes</span><span>% Share</span>
            </div>
          </div>
          <button
            className="export-btn export-btn-csv"
            onClick={exportCSVLanguages}
            disabled={!!exporting}
            id="export-lang-csv-btn"
          >
            {exporting === 'csv-lang' ? <span className="spinner-sm" /> : '⬇'}
            {exporting === 'csv-lang' ? 'Exporting…' : 'Download CSV'}
          </button>
        </div>

        {/* JSON */}
        <div className="export-action-card export-action-json">
          <div className="export-action-icon">🗂️</div>
          <div className="export-action-body">
            <div className="export-action-title">Raw JSON Data</div>
            <div className="export-action-desc">
              Complete raw analytics payload as structured JSON — ideal for custom processing or archiving.
            </div>
            <div className="export-action-tags">
              <span>All fields</span><span>Raw data</span><span>Structured</span>
            </div>
          </div>
          <button
            className="export-btn export-btn-json"
            onClick={exportJSON}
            disabled={!!exporting}
            id="export-json-btn"
          >
            {exporting === 'json' ? <span className="spinner-sm" /> : '⬇'}
            {exporting === 'json' ? 'Exporting…' : 'Download JSON'}
          </button>
        </div>
      </div>

      {/* ── PDF Preview Panel ── */}
      <div className="export-preview-label">
        <span>📋</span> Report Preview <span className="export-preview-note">(captured in PDF export)</span>
      </div>

      <div className="export-preview-wrap" ref={previewRef}>
        {/* Report header */}
        <div className="report-header">
          <div className="report-header-left">
            <img src={profile.avatarUrl} alt="avatar" className="report-avatar" />
            <div>
              <div className="report-name">{profile.name || profile.username}</div>
              <div className="report-handle">@{profile.username}</div>
              {profile.bio && <div className="report-bio">{profile.bio}</div>}
              <div className="report-meta">
                {profile.location && <span>📍 {profile.location}</span>}
                <span>📅 Joined {fmtDate(profile.createdAt)}</span>
                <span>⏱ {accountAge(profile.createdAt)} old</span>
              </div>
            </div>
          </div>
          <div className="report-generated">
            <div className="report-generated-label">Generated on</div>
            <div className="report-generated-date">{now}</div>
            <div className="report-generated-by">GitHub Analyzer</div>
          </div>
        </div>

        <div className="report-grid-2">
          {/* Profile summary */}
          <PreviewCard title="Profile Summary" icon="👤">
            <StatRow label="Public Repos" value={totalRepos} accent="#60a5fa" />
            <StatRow label="Total Stars" value={totalStars} accent="#fbbf24" />
            <StatRow label="Total Forks" value={totalForks} accent="#22d3ee" />
            <StatRow label="Avg Stars / Repo" value={avgStars} accent="#a78bfa" />
            <StatRow label="Avg Forks / Repo" value={avgForks} />
            <StatRow label="Followers" value={profile.followers} />
            <StatRow label="Following" value={profile.following} />
            <StatRow label="Account Age" value={accountAge(profile.createdAt)} />
          </PreviewCard>

          {/* Top languages */}
          <PreviewCard title="Top Languages" icon="💻">
            {topLangs.length === 0
              ? <p className="report-empty">No language data.</p>
              : topLangs.map(([lang, bytes], i) => {
                  const total = topLangs.reduce((s, [, v]) => s + v, 0);
                  const pct = total > 0 ? ((bytes / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={lang} className="report-lang-row">
                      <span className="report-lang-rank">#{i + 1}</span>
                      <span className="report-lang-name">{lang}</span>
                      <div className="report-lang-bar-wrap">
                        <div className="report-lang-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="report-lang-pct">{pct}%</span>
                    </div>
                  );
                })}
          </PreviewCard>

          {/* Top repos by stars */}
          <PreviewCard title="Top Repos by Stars" icon="⭐">
            {topByStars.map((r, i) => (
              <div key={r.name} className="report-repo-row">
                <span className="report-repo-rank">#{i + 1}</span>
                <span className="report-repo-name">{r.name}</span>
                <span className="report-repo-stat">⭐ {r.stars}</span>
              </div>
            ))}
          </PreviewCard>

          {/* Top repos by forks */}
          <PreviewCard title="Top Repos by Forks" icon="🍴">
            {topByForks.map((r, i) => (
              <div key={r.name} className="report-repo-row">
                <span className="report-repo-rank">#{i + 1}</span>
                <span className="report-repo-name">{r.name}</span>
                <span className="report-repo-stat">🍴 {r.forks}</span>
              </div>
            ))}
          </PreviewCard>
        </div>

        {/* Standout repos */}
        {(mostStarredRepository || mostForkedRepository) && (
          <PreviewCard title="Standout Repositories" icon="🏆">
            <div className="report-standout-row">
              {mostStarredRepository && (
                <div className="report-standout-item">
                  <div className="report-standout-tag">★ Most Starred</div>
                  <div className="report-standout-name">{mostStarredRepository.name}</div>
                  <div className="report-standout-meta">
                    ⭐ {mostStarredRepository.stars} stars · 🍴 {mostStarredRepository.forks} forks
                    {mostStarredRepository.language && ` · 💻 ${mostStarredRepository.language}`}
                  </div>
                </div>
              )}
              {mostForkedRepository && (
                <div className="report-standout-item">
                  <div className="report-standout-tag" style={{ background: 'rgba(6,182,212,0.12)', color: '#22d3ee', borderColor: 'rgba(6,182,212,0.25)' }}>⎇ Most Forked</div>
                  <div className="report-standout-name">{mostForkedRepository.name}</div>
                  <div className="report-standout-meta">
                    ⭐ {mostForkedRepository.stars} stars · 🍴 {mostForkedRepository.forks} forks
                    {mostForkedRepository.language && ` · 💻 ${mostForkedRepository.language}`}
                  </div>
                </div>
              )}
            </div>
          </PreviewCard>
        )}

        {/* Footer */}
        <div className="report-footer">
          Generated by GitHub Analyzer · github.com · {now}
        </div>
      </div>
    </div>
  );
}
