import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Languages.css';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function Languages() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || '';

  const [languageData, setLanguageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) {
      setError('Username not provided. Please search first.');
      setLoading(false);
      return;
    }
    const fetchLanguages = async () => {
      try {
        const res = await fetch(`/api/github/languages/${username}`);
        if (!res.ok) throw new Error('Failed to fetch language distribution');
        const json = await res.json();
        const dataArray = Object.entries(json || {}).map(([name, value]) => ({ name, value }));
        setLanguageData(dataArray);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, [username]);

  if (loading) return <div className="languages-page"><p>Loading languages...</p></div>;
  if (error)
    return (
      <div className="languages-page">
        <p className="error">{error}</p>
        <button onClick={() => navigate('/search')}>Search another user</button>
      </div>
    );

  const COLORS = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'];

  return (
    <div className="languages-page">
      <h2>{username}'s Language Distribution</h2>
      {languageData.length > 0 ? (
        <PieChart width={500} height={400}>
          <Pie data={languageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} label>
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
    </div>
  );
}
