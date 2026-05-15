import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commentsAPI } from '../../services/api';
import './Admin.css';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchComments = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await commentsAPI.getAllAdmin({ page, limit: 20 });
      setComments(data.comments);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsAPI.delete(id);
      setComments(c => c.filter(cm => cm._id !== id));
    } catch { alert('Failed to delete.'); }
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>💬 Comments ({pagination.total})</h1>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Author</th><th>Comment</th><th>Post</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {comments.map(c => (
                <tr key={c._id}>
                  <td>
                    <strong style={{ fontSize: '0.9rem' }}>{c.author?.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.author?.email}</div>
                  </td>
                  <td style={{ maxWidth: 300, fontSize: '0.88rem' }}>
                    {c.content.substring(0, 100)}{c.content.length > 100 ? '...' : ''}
                    {c.parentComment && <span style={{ color: 'var(--primary)', fontSize: '0.78rem', display: 'block' }}>↳ Reply</span>}
                  </td>
                  <td>
                    {c.post && <Link to={`/blog/${c.post.slug}`} style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{c.post.title?.substring(0, 40)}</Link>}
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDelete(c._id)} className="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No comments found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pg => (
            <button key={pg} className={`page-btn ${pagination.page === pg ? 'active' : ''}`} onClick={() => fetchComments(pg)}>{pg}</button>
          ))}
        </div>
      )}
    </div>
  );
}
