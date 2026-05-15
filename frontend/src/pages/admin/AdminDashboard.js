import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI } from '../../services/api';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.getDashboard()
      .then(({ data }) => {
        setStats(data.stats);
        setRecentPosts(data.recentPosts);
        setRecentUsers(data.recentUsers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: '👥', color: '#3b82f6', link: '/admin/users' },
    { label: 'Total Posts', value: stats?.totalPosts, icon: '📝', color: '#8b5cf6', link: '/admin/posts' },
    { label: 'Published', value: stats?.publishedPosts, icon: '✅', color: '#10b981', link: '/admin/posts' },
    { label: 'Drafts', value: stats?.draftPosts, icon: '📄', color: '#f59e0b', link: '/admin/posts' },
    { label: 'Comments', value: stats?.totalComments, icon: '💬', color: '#ef4444', link: '/admin/comments' },
    { label: 'Total Views', value: stats?.totalViews?.toLocaleString(), icon: '👁', color: '#06b6d4', link: '/admin/posts' },
  ];

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>📊 Dashboard</h1>
        <Link to="/admin/posts/new" className="btn btn-primary">+ New Post</Link>
      </div>

      <div className="stats-grid">
        {cards.map((c, i) => (
          <Link to={c.link} key={i} className="stat-card">
            <div className="stat-icon" style={{ background: c.color + '20', color: c.color }}>{c.icon}</div>
            <div>
              <div className="stat-value">{c.value ?? '—'}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="admin-grid-2">
        <div className="admin-section-card">
          <h2>Recent Posts</h2>
          <table>
            <thead>
              <tr><th>Title</th><th>Status</th><th>Views</th></tr>
            </thead>
            <tbody>
              {recentPosts.map(p => (
                <tr key={p._id}>
                  <td>
                    <Link to={`/admin/posts/edit/${p._id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                      {p.title.substring(0, 40)}{p.title.length > 40 ? '...' : ''}
                    </Link>
                  </td>
                  <td>
                    <span className={`status-badge ${p.status}`}>{p.status}</span>
                  </td>
                  <td>{p.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/admin/posts" className="see-all-link">View all posts →</Link>
        </div>

        <div className="admin-section-card">
          <h2>Recent Users</h2>
          <table>
            <thead>
              <tr><th>Name</th><th>Role</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td><span className={`status-badge ${u.role}`}>{u.role}</span></td>
                  <td style={{ fontSize: '0.82rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/admin/users" className="see-all-link">View all users →</Link>
        </div>
      </div>
    </div>
  );
}
