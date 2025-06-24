// src/components/Movie.jsx

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../CSS/Movie.css';

/**
 * Movie component
 * Displays detailed information for a selected movie, including ratings and cast.
 */
export default function Movie() {
  const { imdbID } = useParams(); // Extract movie ID from route
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetchMovie(); // Fetch movie on mount or imdbID change
  }, [imdbID]);

  /**
   * Fetches movie details from API using imdbID.
   */
  const fetchMovie = async () => {
    try {
      const res = await fetch(`http://4.237.58.241:3000/movies/data/${imdbID}`);
      const json = await res.json();
      setMovie(json.data || json);
    } catch (err) {
      console.error('Failed to fetch movie:', err);
    }
  };

  if (!movie) {
    return <div className="movie-loading">Loading movie details...</div>;
  }

  // Extract ratings by source
  const imdbRating = movie.ratings?.find(r => r.source === 'Internet Movie Database')?.value ?? 'N/A';
  const rottenTomatoesRating = movie.ratings?.find(r => r.source === 'Rotten Tomatoes')?.value ?? 'N/A';
  const metacriticRating = movie.ratings?.find(r => r.source === 'Metacritic')?.value ?? 'N/A';

  return (
    <div className="movie-container">
      {/* Back button with session restoration */}
      <button
        onClick={() => {
          const page = sessionStorage.getItem('restorePage') || '1';
          const title = sessionStorage.getItem('restoreSearchTitle') || '';
          const year = sessionStorage.getItem('restoreSearchYear') || '';

          sessionStorage.setItem('restorePage', page);
          sessionStorage.setItem('restoreSearchTitle', title);
          sessionStorage.setItem('restoreSearchYear', year);

          navigate('/moviecatalogue');
        }}
        className="back-button"
      >
        ← Back to Catalogue
      </button>

      {/* Movie header section */}
      <div
        className="movie-header"
        style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}
      >
        <div className="movie-meta" style={{ flex: 1, minWidth: '300px' }}>
          <h1>{movie.title}</h1>
          <p><strong>Released:</strong> {movie.year}</p>
          <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
          <p><strong>Genres:</strong> {movie.genres?.map((g, idx) => (
            <span key={idx} className="genre-pill">{g}</span>
          ))}</p>
          <p><strong>Country:</strong> {movie.country}</p>
          <p><strong>Box Office:</strong> {movie.boxoffice ? `$${movie.boxoffice.toLocaleString()}` : 'N/A'}</p>

          <p className="movie-plot">{movie.plot}</p>

          {/* Ratings */}
          <div className="rating-section">
            <div className="rating-with-icon">
              <img src="/img/IMDB.png" alt="IMDb" />
              <strong>IMDb:</strong> {imdbRating !== 'N/A' ? `${imdbRating}/10` : 'N/A'}
            </div>
            <div className="rating-with-icon">
              <img src="/img/rt.png" alt="RT" />
              <strong>Rotten Tomatoes:</strong> {rottenTomatoesRating !== 'N/A' ? `${rottenTomatoesRating}%` : 'N/A'}
            </div>
            <div className="rating-with-icon">
              <img src="/img/Metacritic.png" alt="MC" />
              <strong>Metacritic:</strong> {metacriticRating !== 'N/A' ? `${metacriticRating}/100` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Movie poster */}
        <div className="movie-poster" style={{ flexShrink: 0 }}>
          <img
            src={movie.poster || '/img/comingsoon.png'}
            alt={movie.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/img/comingsoon.png';
            }}
            style={{
              width: '375px',
              height: 'auto',
              borderRadius: '6px',
              display: 'block'
            }}
          />
        </div>
      </div>

      {/* Cast and crew */}
      <div className="cast-section">
        <h2>Cast & Crew</h2>
        <table className="cast-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Name</th>
              <th>Character</th>
            </tr>
          </thead>
          <tbody>
            {movie.principals?.length > 0 ? (
              movie.principals.map((person, index) => (
                <tr key={index}>
                  <td>{capitalise(person.category)}</td>
                  <td>
                    <Link to={`/actor/${person.personId || person.id || person._id}`} className="actor-link">
                      {person.name}
                    </Link>
                  </td>
                  <td>{person.characters?.length ? person.characters.join(', ') : '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>
                  No cast and crew information available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Capitalise a string
 * @param {string} text
 * @returns {string}
 */
function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
