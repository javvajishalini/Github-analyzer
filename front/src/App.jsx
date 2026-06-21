import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import Repositories from './pages/Repositories';
import Languages from './pages/Languages';
import Activity from './pages/Activity';
import Search from './pages/Search';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/repositories" element={<Repositories />} />
            <Route path="/languages" element={<Languages />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/search" element={<Search />} />
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
