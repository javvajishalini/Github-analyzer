import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import Repositories from './pages/Repositories';
import Languages from './pages/Languages';
import Activity from './pages/Activity';
import Search from './pages/Search';
import DarkModeToggle from './components/DarkModeToggle';
import './App.css';

/* ── Inline Logo (same as sidebar but larger) ── */
const LoginLogo = () => (
  <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="13" r="9" fill="url(#loginLogoGrad)" />
    <polygon points="11,7 8,3 14,6" fill="url(#loginLogoGrad)" />
    <polygon points="25,7 28,3 22,6" fill="url(#loginLogoGrad)" />
    <circle cx="15" cy="12" r="1.4" fill="white" fillOpacity="0.9" />
    <circle cx="21" cy="12" r="1.4" fill="white" fillOpacity="0.9" />
    <path d="M12 20 Q10 26 9 32" stroke="url(#loginLogoGrad)" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M18 22 Q18 27 18 33" stroke="url(#loginLogoGrad)" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M24 20 Q26 26 27 32" stroke="url(#loginLogoGrad)" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="13" y="17" width="3" height="5" rx="1" fill="white" fillOpacity="0.75"/>
    <rect x="17" y="14" width="3" height="8" rx="1" fill="white" fillOpacity="0.95"/>
    <rect x="21" y="19" width="3" height="3" rx="1" fill="white" fillOpacity="0.6"/>
    <defs>
      <linearGradient id="loginLogoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB"/>
        <stop offset="100%" stopColor="#7C3AED"/>
      </linearGradient>
    </defs>
  </svg>
);

const GitHubIcon = () => (
  <svg height="20" viewBox="0 0 16 16" width="20" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

/* ── Layout (authenticated pages) ── */
function Layout() {
  const sessionUser = localStorage.getItem('git_analyzer_session');
  if (!sessionUser) return <Navigate to="/login" replace />;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="content-container">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ── OAuth success redirect ── */
function LoginSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  if (username) {
    localStorage.setItem('git_analyzer_session', username);
    return <Navigate to="/overview" replace state={{ username }} />;
  }
  return <Navigate to="/login" replace />;
}

/* ── Login page ── */
function Login() {
  const navigate = useNavigate();
  const sessionUser = localStorage.getItem('git_analyzer_session');
  if (sessionUser) return <Navigate to="/overview" replace />;

  const handleOAuthLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/github';
  };

  const features = ['Repository Analytics', 'Language Insights', 'Activity Timeline', 'Star Distributions'];

  return (
    <div className="login-page">
      {/* Theme toggle top-right */}
      <div className="login-header">
        <DarkModeToggle />
      </div>

      <div className="login-card animate-fade-in">
        {/* Logo + brand name */}
        <div className="login-logo-wrap">
          <div className="github-icon-shield">
            <LoginLogo />
          </div>
        </div>

        <h1 className="login-title">
          GitHub{' '}
          <span className="login-gradient-text">Analyzer</span>
        </h1>
        <p className="login-subtitle">
          Dive deep into any GitHub profile. Explore repositories, language distributions, star trends and activity milestones — all in one premium dashboard.
        </p>

        {/* Feature chips */}
        <div className="login-features">
          {features.map(f => (
            <span key={f} className="login-feature-chip">✦ {f}</span>
          ))}
        </div>

        <button onClick={handleOAuthLogin} className="login-button" id="login-github-btn">
          <GitHubIcon />
          Continue with GitHub
        </button>

        <p className="login-footer-note">
          Secure OAuth 2.0 · No password required · Read-only access
        </p>
      </div>
    </div>
  );
}

/* ── Root ── */
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login-success" element={<LoginSuccess />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/languages" element={<Languages />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/search" element={<Search />} />
        </Route>

        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </Router>
  );
}
