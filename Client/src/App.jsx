// src/App.jsx
import '../src/CSS/HomeAndComponents.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

// components
import Header from './components/Header';
import Footer from './components/Footer';

// pages
import Home from './pages/Home';
import MovieCatalogue from './pages/MovieCatalogue';
import Register from './pages/Register';
import Login from './pages/Login';
import Movie from './pages/Movie';
import ActorsPage from './pages/ActorsPage';

export default function App() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="App" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
        <Header userEmail={userEmail} setUserEmail={setUserEmail} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/moviecatalogue" element={<MovieCatalogue />} />
            <Route path="/movie/:imdbID" element={<Movie />} />
            <Route path="/login" element={<Login setUserEmail={setUserEmail} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/actor/:id" element={<ActorsPage />} />            
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
