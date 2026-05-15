import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const navLinks = [
  { to: '/admin', label: '📊 Dashboard', exact: true },
  { to: '/admin/posts', label: '📝 Posts' },
  { to: '/admin/posts/new', label: '➕ New Post' },
  { to: '/admin/categories', label: '📂 Categories' },
  { to: '/admin/comments', label: '💬 Comments' },
  { to: '/admin/users', label: '👥 Users' },
  { to: '/', label: '🌐 View Site' },
];

export default function AdminLayout() {
  const { user, loading, isAdmin, logout } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">🌿 Admin Panel</div>
        <nav className="admin-nav">
          {navLinks.map(({ to, label, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to) && to !== '/admin' ? true : location.pathname === to;
            return (
              <Link key={to} to={to} className={`admin-nav-link ${active ? 'active' : ''}`}>
                {label}
              </Link>
            );
          })}
          <button onClick={logout} className="admin-nav-link logout-btn">🚪 Logout</button>
        </nav>
        <div className="admin-user-info">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=52b788&color=fff`} alt={user.name} />
          <div>
            <strong>{user.name}</strong>
            <span>Administrator</span>
          </div>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
