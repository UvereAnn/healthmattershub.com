import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI, categoriesAPI } from '../services/api';
import BlogCard from '../components/blog/BlogCard';
import './Home.css';

const SITE_NAME = process.env.REACT_APP_SITE_NAME || 'HealthBlog';
const SITE_TAGLINE = process.env.REACT_APP_SITE_TAGLINE || 'Your Guide to a Healthier Life';

export default function Home() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      postsAPI.getAll({ featured: true, limit: 3 }),
      postsAPI.getAll({ limit: 6 }),
      categoriesAPI.getAll()
    ]).then(([feat, latest, cats]) => {
      setFeaturedPosts(feat.data.posts);
      setLatestPosts(latest.data.posts);
      setCategories(cats.data.categories.slice(0, 6));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      {/* ─── Hero ──────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <div className="hero-text">
            <span className="hero-badge">🌿 Wellness & Health</span>
            <h1 className="hero-title">Welcome to <span className="text-green">{SITE_NAME}</span></h1>
            <p className="hero-subtitle">{SITE_TAGLINE}. Explore expert-backed articles on nutrition, fitness, mental wellness, and healthy living.</p>
            <div className="hero-actions">
              <Link to="/blog" className="btn btn-primary btn-lg">Explore Articles</Link>
              <Link to="/categories" className="btn btn-secondary btn-lg">Browse Topics</Link>
            </div>
            <div className="hero-stats">
              <div><strong>100+</strong><span>Articles</span></div>
              <div><strong>10k+</strong><span>Readers</span></div>
              <div><strong>6</strong><span>Topics</span></div>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80" alt="Healthy living" />
          </div>
        </div>
      </section>

      {/* ─── Categories ────────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Explore Topics</h2>
          <p className="section-subtitle">Find articles on subjects you care about most</p>
          <div className="categories-grid">
            {loading ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="category-card skeleton"></div>)
            ) : (
              categories.map(cat => (
                <Link key={cat._id} to={`/blog?category=${cat._id}`} className="category-card"
                  style={{ borderTop: `4px solid ${cat.color}` }}>
                  <span className="cat-count">{cat.postCount} articles</span>
                  <h3>{cat.name}</h3>
                  <p>{cat.description || 'Explore our ' + cat.name + ' articles'}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─── Featured Posts ─────────────────────────── */}
      {featuredPosts.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <h2 className="section-title">⭐ Featured Articles</h2>
            <p className="section-subtitle">Our editors' top picks</p>
            <div className="grid-3">
              {featuredPosts.map(p => <BlogCard key={p._id} post={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── Latest Posts ───────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Latest Articles</h2>
              <p className="section-subtitle">Fresh content, updated regularly</p>
            </div>
            <Link to="/blog" className="btn btn-secondary">View All →</Link>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : (
            <div className="grid-3">
              {latestPosts.map(p => <BlogCard key={p._id} post={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─── Newsletter CTA ─────────────────────────── */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-card">
            <h2>📧 Stay Informed</h2>
            <p>Get the latest health tips delivered to your inbox. Join thousands of health-conscious readers.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Create a Free Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
