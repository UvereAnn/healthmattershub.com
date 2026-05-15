import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const SITE_NAME = process.env.REACT_APP_SITE_NAME || 'HealthBlog';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🌿</span>
          <span>{SITE_NAME}</span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`ham-line ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/blog" onClick={() => setMenuOpen(false)}>Blog</NavLink>
          <NavLink to="/categories" onClick={() => setMenuOpen(false)}>Categories</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>

          {user ? (
            <div className="nav-user">
              {isAdmin && (
                <NavLink to="/admin" className="btn btn-sm btn-secondary" onClick={() => setMenuOpen(false)}>
                  Admin
                </NavLink>
              )}
              <div className="nav-avatar-menu">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2d6a4f&color=fff`}
                  alt={user.name}
                  className="nav-avatar"
                />
                <div className="avatar-dropdown">
                  <span className="dropdown-name">{user.name}</span>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-sm btn-secondary" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
