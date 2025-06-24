import { Link, useNavigate } from 'react-router-dom';
import { handleLogout } from '../services/AuthService';

export default function Nav({ userEmail, setUserEmail }) {
  const navigate = useNavigate();

  // Handle user logout
  const logout = async () => {
    const success = await handleLogout();
    if (success) {
      setUserEmail(null);
      navigate('/login');
    }
  };

  return (
    <header>
      <div id="icon">
        {/* Logo redirects to home */}
        <Link to="/">MovieFinder+</Link>
      </div>

      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/moviecatalogue">Movies</Link></li>
          {userEmail ? (
            <>
              {/* Show user email when logged in */}
              <li>
                <span className="navbar-email">
                  {userEmail}
                </span>
              </li>
              {/* Logout button */}
              <li>
                <button onClick={logout} className="navbar-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              {/* Auth links when logged out */}
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/login">Login</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
