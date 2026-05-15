import { Link } from 'react-router-dom';
import './BlogCard.css';

export default function BlogCard({ post }) {
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <article className="blog-card card">
      <Link to={`/blog/${post.slug}`} className="card-img-wrap">
        <img
          src={post.featuredImage || `https://picsum.photos/seed/${post._id}/600/360`}
          alt={post.title}
          className="card-img"
          loading="lazy"
        />
        {post.featured && <span className="card-featured-badge">⭐ Featured</span>}
      </Link>
      <div className="card-body">
        {post.category && (
          <Link
            to={`/blog?category=${post.category._id}`}
            className="card-category"
            style={{ background: post.category.color + '22', color: post.category.color || 'var(--primary)' }}
          >
            {post.category.name}
          </Link>
        )}
        <Link to={`/blog/${post.slug}`}>
          <h2 className="card-title">{post.title}</h2>
        </Link>
        <p className="card-excerpt">{post.excerpt}</p>
        <div className="card-meta">
          <div className="card-author">
            <img
              src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'A')}&size=32&background=2d6a4f&color=fff`}
              alt={post.author?.name}
              className="author-avatar-sm"
            />
            <span>{post.author?.name || 'Admin'}</span>
          </div>
          <div className="card-stats">
            <span>📅 {formatDate(post.createdAt)}</span>
            <span>⏱ {post.readTime} min</span>
            <span>👁 {post.views || 0}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
