import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import Repositories from './pages/Repositories';
import Languages from './pages/Languages';
import Activity from './pages/Activity';
import Search from './pages/Search';
import DarkModeToggle from './components/DarkModeToggle';
import './App.css';

// Layout wrapper for authenticated dashboard pages
function Layout() {
  const sessionUser = localStorage.getItem('git_analyzer_session');

  if (!sessionUser) {
    return <Navigate to="/login" replace />;
  }

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

// Success Redirect Handler for GitHub OAuth
function LoginSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');

  useEffect(() => {
    if (username) {
      localStorage.setItem('git_analyzer_session', username);
    }
  }, [username]);

  if (username) {
    return <Navigate to="/overview" replace />;
  }

  return <Navigate to="/login" replace />;
}

// Sign-In Screen
function Login() {
  const navigate = useNavigateHelper();
  const sessionUser = localStorage.getItem('git_analyzer_session');

  if (sessionUser) {
    return <Navigate to="/overview" replace />;
  }

  const handleOAuthLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/github';
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <DarkModeToggle />
      </header>

      <div className="login-card animate-fade-in">
        <div className="github-icon-shield">
          <svg height="42" viewBox="0 0 16 16" width="42" style={{ fill: 'white' }}>
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </div>

        <h2 className="login-title">GitHub User Analyzer</h2>
        <p className="login-subtitle">
          Analyze public repositories, developer languages, star distributions, and activity timelines with premium diagnostics.
        </p>

        <button onClick={handleOAuthLogin} className="login-button">
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}

// Temporary internal helper to allow Navigation elements within components
import { useNavigate } from 'react-router-dom';
function useNavigateHelper() {
  try {
    return useNavigate();
  } catch (e) {
    return null;
  }
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        
        {/* Protected Dashboard Routes */}
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
