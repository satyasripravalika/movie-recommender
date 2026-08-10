import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(1);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all movies on load
  useEffect(() => {
    axios.get('http://localhost:5000/api/movies')
      .then(res => {
        setMovies(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not connect to server. Please make sure the backend is running.');
        setLoading(false);
      });
  }, []);

  // Fetch recommendations when user changes
  const getRecommendations = (userId) => {
    setSelectedUser(userId);
    setRecLoading(true);
    axios.get(`http://localhost:5000/api/movies/recommendations/${userId}`)
      .then(res => {
        setRecommendations(res.data);
        setRecLoading(false);
      })
      .catch(() => {
        setRecommendations([]);
        setRecLoading(false);
      });
  };

  useEffect(() => {
    getRecommendations(1);
  }, []);

  if (error) {
    return (
      <div className="app-container">
        <div className="error-box">
          <h2>⚠️ Connection Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>🎬 CineGraph</h1>
        <p>Movie recommendations powered by graph relationships</p>
      </header>

      <div className="user-selector">
        <label>Viewing as: </label>
        {[1, 2, 3].map(id => (
          <button
            key={id}
            className={selectedUser === id ? 'user-btn active' : 'user-btn'}
            onClick={() => getRecommendations(id)}
          >
            User {id}
          </button>
        ))}
      </div>

      <section className="section">
        <h2>Recommended For You</h2>
        {recLoading ? (
          <p className="loading-text">Loading recommendations...</p>
        ) : recommendations.length === 0 ? (
          <p className="empty-text">No recommendations found for this user.</p>
        ) : (
          <div className="movie-grid">
            {recommendations.map((rec, idx) => (
              <div className="movie-card rec-card" key={idx}>
                <h3>{rec.title}</h3>
                <span className="genre-tag">{rec.genre}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>All Movies</h2>
        {loading ? (
          <p className="loading-text">Loading movies...</p>
        ) : movies.length === 0 ? (
          <p className="empty-text">No movies found.</p>
        ) : (
          <div className="movie-grid">
            {movies.map(movie => (
              <div className="movie-card" key={movie.id}>
                <h3>{movie.title}</h3>
                <span className="year-tag">{movie.release_year}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;