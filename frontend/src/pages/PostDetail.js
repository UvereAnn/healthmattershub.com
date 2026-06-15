import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import Comments from '../components/blog/Comments';
//import BlogCard from '../components/blog/BlogCard';
import './PostDetail.css';

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    postsAPI.getOne(slug)
      .then(({ data }) => {
        setPost(data.post);
        setRelated(data.related || []);
      })
      .catch(() => setError('Post not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="page-wrapper loading-center"><div className="spinner"></div></div>;
  if (error) return <div className="page-wrapper container"><div className="alert alert-error">{error}</div></div>;
  if (!post) return null;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="page-wrapper">
      {/* ─── Hero ──── */}
      <div className="post-hero">
        {post.featuredImage && (
          <img src={post.featuredImage} alt={post.title} className="post-hero-img" />
        )}
        <div className="post-hero-overlay">
          <div className="container">
            {post.category && (
              <Link
                to={`/blog?category=${post.category._id}`}
                className="post-category-badge"
                style={{ background: post.category.color }}
              >
                {post.category.name}
              </Link>
            )}
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <img
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'A')}&size=44&background=ffffff&color=2d6a4f`}
                alt={post.author?.name}
                className="post-author-avatar"
              />
              <div>
                <span className="post-author-name">{post.author?.name}</span>
                <div className="post-meta-details">
                  <span>📅 {formatDate(post.createdAt)}</span>
                  <span>⏱ {post.readTime} min read</span>
                  <span>👁 {post.views} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ──── */}
      <div className="container post-layout">
        <article className="post-content">
          <div
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags?.length > 0 && (
            <div className="post-tags">
              <span>🏷 Tags:</span>
              {post.tags.map(tag => (
                <Link key={tag} to={`/blog?search=${tag}`} className="tag-pill">{tag}</Link>
              ))}
            </div>
          )}

          {/* Author bio */}
          {post.author?.bio && (
            <div className="author-bio-card">
              <img
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'A')}&size=60&background=2d6a4f&color=fff`}
                alt={post.author?.name}
              />
              <div>
                <strong>{post.author?.name}</strong>
                <p>{post.author?.bio}</p>
              </div>
            </div>
          )}

          <Comments postId={post._id} />
        </article>

        {/* ─── Related Posts ──── */}
        {related.length > 0 && (
          <aside className="related-posts">
            <h3>Related Articles</h3>
            {related.map(p => (
              <Link key={p._id} to={`/blog/${p.slug}`} className="related-card">
                <img
                  src={p.featuredImage || `https://picsum.photos/seed/${p._id}/120/80`}
                  alt={p.title}
                />
                <div>
                  <span className="related-category" style={{ color: p.category?.color }}>
                    {p.category?.name}
                  </span>
                  <h4>{p.title}</h4>
                  <small>⏱ {p.readTime} min</small>
                </div>
              </Link>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}
