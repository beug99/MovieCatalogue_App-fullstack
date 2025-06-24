// src/pages/Login.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Authentication.css';

/**
 * Login component
 * Allows users to log in and receive authentication tokens.
 * On success, redirects to the home page and stores tokens in localStorage.
 *
 * @param {function} setUserEmail - Callback to set user email in parent component
 */
export default function Login({ setUserEmail }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /**
   * Handle login form submission
   * @param {Event} e
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://4.237.58.241:3000/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, longExpiry: false }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Invalid login credentials.');
        return;
      }

      // Store auth tokens and redirect
      localStorage.setItem('bearerToken', data.bearerToken.token);
      localStorage.setItem('refreshToken', data.refreshToken.token);
      localStorage.setItem('userEmail', email);
      setUserEmail(email);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-button">Login</button>
        </form>
        <p className="auth-link">
          Don't have an account?{' '}
          <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}
