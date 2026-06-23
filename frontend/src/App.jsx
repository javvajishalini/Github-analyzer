import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import Repositories from './pages/Repositories';
import Languages from './pages/Languages';
import Activity from './pages/Activity';
import Search from './pages/Search';
import Compare from './pages/Compare';
import Achievements from './pages/Achievements';
import Export from './pages/Export';
import DarkModeToggle from './components/DarkModeToggle';
import Logo from './components/Logo';
import './App.css';



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
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Sidebar />
      <div className="content-container">
        <Header />
        <main id="main-content" className="main-content">
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
    localStorage.removeItem('git_analyzer_current_user');
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
          <Logo style={{ width: '80px', height: '80px', flexShrink: 0, boxShadow: '0 8px 28px rgba(37, 99, 235, 0.38), 0 0 0 1px rgba(255,255,255,0.08) inset', borderRadius: '20px' }} />
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
          <Route path="/compare" element={<Compare />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/export" element={<Export />} />
        </Route>

        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </Router>
  );
}
