// src/pages/ActorsPage.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { fetchWithAuth } from '../Services/AuthService';
import '../CSS/ActorsPage.css';

/**
 * Actor detail page.
 * Displays actor bio, movie roles, and IMDb rating breakdown chart.
 */
export default function ActorsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rolesPerPage = 10;
  const chartRef = useRef(null);

  // Fetch actor data once component mounts
  useEffect(() => {
    const bearerToken = localStorage.getItem('bearerToken');
    if (!bearerToken) {
      setError('Please log in to view actor details.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetchWithAuth(`http://4.237.58.241:3000/people/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch actor data');
        setPerson(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch actor data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Update chart whenever person data is available
  useEffect(() => {
    if (person?.roles?.length) {
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = renderChart(person.roles);
    }
  }, [person]);

  /**
   * Render a bar chart summarising IMDb rating distribution
   * @param {Array} roles - Actor's roles with IMDb ratings
   */
  const renderChart = (roles) => {
    const ctx = document.getElementById('ratingChart')?.getContext('2d');
    if (!ctx) return;

    const ranges = { '0-2': 0, '2-4': 0, '4-6': 0, '6-8': 0, '8-10': 0 };
    roles.forEach(role => {
      const r = parseFloat(role.imdbRating || 0);
      if (r < 2) ranges['0-2']++;
      else if (r < 4) ranges['2-4']++;
      else if (r < 6) ranges['4-6']++;
      else if (r < 8) ranges['6-8']++;
      else ranges['8-10']++;
    });

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(ranges),
        datasets: [{
          label: 'IMDb Ratings Distribution',
          data: Object.values(ranges),
          backgroundColor: '#ff4136'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'IMDb Rating Range Breakdown',
            color: '#000',
            font: { size: 18, weight: 'bold' }
          },
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: {
              color: '#000',
              font: { size: 14, weight: 'bold' }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#000',
              font: { size: 14, weight: 'bold' }
            }
          }
        }
      }
    });
  };

  const paginatedRoles = person?.roles?.slice((currentPage - 1) * rolesPerPage, currentPage * rolesPerPage) || [];
  const totalPages = Math.ceil((person?.roles?.length || 0) / rolesPerPage);

  if (loading) return <div className="loading">Loading...</div>;

  if (error) {
    return (
      <div className="actor-login-banner">
        <div className="banner-text">{error}</div>
      </div>
    );
  }

  return (
    <div className="actor-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back to Movie
      </button>

      <h1>{person.name}</h1>
      <p className="lifespan">
        <strong>Born:</strong> {person.birthYear} – {person.deathYear || 'Present'}
      </p>

      <div className="table-wrapper">
        <table className="roles-table">
          <thead>
            <tr>
              <th>Movie</th>
              <th>Role</th>
              <th>Character(s)</th>
              <th>IMDb Rating</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRoles.map((r, idx) => (
              <tr key={idx}>
                <td>
                  <Link to={`/movie/${r.movieId}`}>
                    {r.movieName}
                  </Link>
                </td>
                <td>{r.category}</td>
                <td>{r.characters?.join(', ') || 'N/A'}</td>
                <td>
                  {r.imdbRating ? (
                    <>
                      <img
                        src="/img/IMDB.png"
                        alt="IMDb"
                        className="imdb-icon"
                      />
                      {r.imdbRating}
                    </>
                  ) : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-controls">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>Page {currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <div className="chart-container">
        <canvas id="ratingChart"></canvas>
      </div>
    </div>
  );
}
