// src/pages/MovieCatalogue.jsx

import { useState, useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../CSS/HomeAndComponents.css';
import '../CSS/MovieCatalogue.css';

/**
 * MovieCatalogue
 * A grid-based catalogue view allowing users to browse, search, and paginate movies.
 */
export default function MovieCatalogue() {
  const gridRef = useRef();
  const navigate = useNavigate();
  const [rowData, setRowData] = useState([]);
  const [maxPages, setMaxPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(() => Number(sessionStorage.getItem('restorePage') || 1));
  const [searchTitle, setSearchTitle] = useState(() => sessionStorage.getItem('restoreSearchTitle') || '');
  const [searchYear, setSearchYear] = useState(() => sessionStorage.getItem('restoreSearchYear') || '');

  /**
   * Column definitions for AG Grid
   */
  const columnDefs = useMemo(() => [
    {
      headerName: 'Title',
      field: 'title',
      flex: 2,
      cellRenderer: ({ data }) =>
        data && (
          <button
            className="link-button"
            onClick={() => {
              const scrollTop = document.querySelector('.ag-body-viewport')?.scrollTop ?? 0;
              sessionStorage.setItem('restoreScroll', scrollTop);
              navigate(`/movie/${data.imdbID}`);
            }}
          >
            {data.title}
          </button>
        ),
    },
    {
      headerName: 'Year | Classification',
      valueGetter: ({ data }) =>
        data ? `${data.year} ${data.classification ? '| ' + data.classification : ''}` : '',
      flex: 1.5,
      cellRenderer: ({ value }) => <strong>{value}</strong>,
    },
    {
      headerName: 'IMDb Rating',
      field: 'imdbRating',
      flex: 1,
      cellRenderer: ({ data }) => (
        <>
          <img src="/img/IMDB.png" alt="IMDb" className="emoji-icon" />
          <strong> IMDb:</strong> {data.imdbRating ?? 'N/A'}
        </>
      ),
    },
    {
      headerName: 'Rotten Tomatoes Rating',
      field: 'rottenTomatoesRating',
      flex: 1,
      cellRenderer: ({ data }) => (
        <>
          <img src="/img/rt.png" alt="RT" className="emoji-icon" />
          <strong> RT:</strong>{' '}
          {data.rottenTomatoesRating != null ? `${data.rottenTomatoesRating}%` : 'N/A'}
        </>
      ),
    },
    {
      headerName: 'Metacritic Rating',
      field: 'metacriticRating',
      flex: 1,
      cellRenderer: ({ data }) => (
        <>
          <img src="/img/Metacritic.png" alt="MC" className="emoji-icon" />
          <strong> MC:</strong> {data.metacriticRating ?? 'N/A'}
        </>
      ),
    },
  ], [navigate]);

  /**
   * Fetch movie data from API based on search and pagination
   */
  const fetchMovies = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(searchTitle && { title: searchTitle }),
        ...(searchYear && { year: searchYear }),
        page,
        pageSize,
      }).toString();

      const res = await fetch(`http://4.237.58.241:3000/movies/search?${query}`);
      const json = await res.json();
      setRowData(json.data || []);
      setMaxPages(json.pagination?.lastPage || 1);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
      const savedScroll = Number(sessionStorage.getItem('restoreScroll') || '0');
      setTimeout(() => {
        const viewport = document.querySelector('.ag-body-viewport');
        if (viewport) viewport.scrollTop = savedScroll;
      }, 0);
    }
  };

  // Fetch movies on relevant state changes
  useEffect(() => {
    fetchMovies();
  }, [page, searchTitle, searchYear, pageSize]);

  // Restore scroll on mount
  useEffect(() => {
    const scroll = sessionStorage.getItem('restoreScroll');
    if (scroll) {
      window.scrollTo({ top: parseInt(scroll), behavior: 'auto' });
    }
    sessionStorage.removeItem('restoreScroll');
  }, []);

  /**
   * Handle search input and update filters
   */
  const handleSearch = ({ title, year }) => {
    setSearchTitle(title);
    setSearchYear(year);
    setPage(1);

    sessionStorage.setItem('restoreSearchTitle', title);
    sessionStorage.setItem('restoreSearchYear', year);
    sessionStorage.setItem('restorePage', '1');
  };

  /**
   * Handle pagination input
   */
  const handlePageChange = (val) => {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 1 && n <= maxPages) {
      setPage(n);
      sessionStorage.setItem('restorePage', String(n));
    }
  };

  return (
    <div className="movie-catalogue-wrapper">
      <SearchBar setSearch={handleSearch} searchTitle={searchTitle} searchYear={searchYear} />

      {loading && <p className="loading-text">Loading...</p>}

      <div className="ag-grid-wrapper ag-theme-alpine">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{ resizable: true }}
          rowSelection="single"
          suppressPaginationPanel
        />
      </div>

      <div className="pagination-bar custom-pagination">
        <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>← Prev</button>

        <form onSubmit={(e) => {
          e.preventDefault();
          handlePageChange(e.target.page.value);
        }}>
          Page <input
            name="page"
            value={page}
            onChange={(e) => handlePageChange(e.target.value)}
          /> of {maxPages}
        </form>

        <button disabled={page >= maxPages} onClick={() => handlePageChange(page + 1)}>Next →</button>
      </div>
    </div>
  );
}
