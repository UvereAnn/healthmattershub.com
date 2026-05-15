import { Link } from 'react-router-dom';
import './Footer.css';

const SITE_NAME = process.env.REACT_APP_SITE_NAME || 'HealthBlog';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">🌿 {SITE_NAME}</Link>
            <p>Your trusted source for evidence-based health, nutrition, fitness, and wellness content.</p>
          </div>
          <div className="footer-links">
            <h4>Categories</h4>
            <Link to="/blog?category=nutrition">Nutrition</Link>
            <Link to="/blog?category=fitness">Fitness</Link>
            <Link to="/blog?category=mental-health">Mental Health</Link>
            <Link to="/blog?category=lifestyle">Lifestyle</Link>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/about">About</Link>
            <Link to="/register">Sign Up</Link>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
            <p className="disclaimer">
              Content is for informational purposes only. Always consult a healthcare professional.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
