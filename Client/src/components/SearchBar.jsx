import { useState, useEffect } from 'react';

export default function SearchBar({ setSearch, searchTitle = '', searchYear = '' }) {
  const [title, setTitle] = useState(searchTitle);
  const [year, setYear] = useState(searchYear);

  // Sync props to state when they change
  useEffect(() => {
    setTitle(searchTitle);
    setYear(searchYear);
  }, [searchTitle, searchYear]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSearch({ title, year });
  };

  // Year options from 1990 to 2023 plus 'Any Year'
  const years = ['Any Year', ...Array.from({ length: 2023 - 1990 + 1 }, (_, i) => (1990 + i).toString())];

  return (
    <form onSubmit={handleSubmit} className="searchbar-container">
      <input
        type="search"
        placeholder="Search by Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="searchbar-input"
      />

      {/* Year dropdown */}
      <select
        value={year || ''}
        onChange={(e) => setYear(e.target.value === 'Any Year' ? '' : e.target.value)}
        className="searchbar-select"
      >
        {years.map(y => (
          <option key={y} value={y === 'Any Year' ? '' : y}>
            {y}
          </option>
        ))}
      </select>

      <button type="submit" className="searchbar-button">
        Search
      </button>
    </form>
  );
}
