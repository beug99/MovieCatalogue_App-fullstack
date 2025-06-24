// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Authentication.css';

export default function Register() {
  // State hooks for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // Navigation hook from React Router

  // Handles user registration logic
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent form default submission
    setError('');
    setSuccess('');

    // Password mismatch validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // API call to register endpoint
      const res = await fetch('http://4.237.58.241:3000/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle server-side error message
        setError(data.message || 'Registration failed.');
        return;
      }

      // Success message and navigation to login after delay
      setSuccess('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      // Catch network   errors
      console.error('Registration error:', err);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>

        <form onSubmit={handleRegister}>
          {/* Email input field */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          {/* Password input field */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          {/* Confirm password field */}
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="auth-input"
          />
          {error && <div className="auth-error">{/* Error message */}{error}</div>}
          {success && <div className="auth-success">{/* Success message */}{success}</div>}
          {/* register button */}
          <button type="submit" className="auth-button">Register</button>
        </form>

        {/* Link to login page */}
        <p className="auth-link">
          Already have an account?{' '}
          <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
