import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../../services/api';
import './Admin.css';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await postsAPI.getAllAdmin({ page, limit: 10 });
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post? All comments will also be deleted.')) return;
    try {
      await postsAPI.delete(id);
      setPosts(posts.filter(p => p._id !== id));
    } catch (e) { alert('Failed to delete post.'); }
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>📝 All Posts ({pagination.total})</h1>
        <Link to="/admin/posts/new" className="btn btn-primary">+ New Post</Link>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Views</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p._id}>
                  <td style={{ maxWidth: 300 }}>
                    <span style={{ fontWeight: 500 }}>{p.title.substring(0, 50)}{p.title.length > 50 ? '...' : ''}</span>
                  </td>
                  <td>{p.category?.name || '—'}</td>
                  <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                  <td>{p.views}</td>
                  <td style={{ fontSize: '0.82rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/admin/posts/edit/${p._id}`} className="btn btn-sm btn-secondary">Edit</Link>
                      <button onClick={() => handleDelete(p._id)} className="btn btn-sm btn-danger">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No posts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pg => (
            <button key={pg} className={`page-btn ${pagination.page === pg ? 'active' : ''}`} onClick={() => fetchPosts(pg)}>{pg}</button>
          ))}
        </div>
      )}
    </div>
  );
}
