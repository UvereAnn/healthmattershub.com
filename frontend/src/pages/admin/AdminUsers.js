import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await usersAPI.getAll({ page, limit: 20 });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user) => {
    if (user._id === currentUser.id) return alert("Can't change your own role.");
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await usersAPI.update(user._id, { role: newRole });
      setUsers(u => u.map(x => x._id === user._id ? { ...x, role: newRole } : x));
    } catch { alert('Failed to update role.'); }
  };

  const toggleActive = async (user) => {
    if (user._id === currentUser.id) return alert("Can't deactivate yourself.");
    try {
      await usersAPI.update(user._id, { isActive: !user.isActive });
      setUsers(u => u.map(x => x._id === user._id ? { ...x, isActive: !x.isActive } : x));
    } catch { alert('Failed to update status.'); }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) return alert("Can't delete your own account.");
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await usersAPI.delete(id);
      setUsers(u => u.filter(x => x._id !== id));
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete.'); }
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>👥 Users ({pagination.total})</h1>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=32&background=2d6a4f&color=fff`}
                        alt={u.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <strong style={{ fontSize: '0.9rem' }}>{u.name}</strong>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.88rem' }}>{u.email}</td>
                  <td><span className={`status-badge ${u.role}`}>{u.role}</span></td>
                  <td>
                    <span style={{ color: u.isActive ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                      {u.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns" style={{ flexWrap: 'wrap' }}>
                      <button onClick={() => toggleRole(u)} className="btn btn-sm btn-secondary" style={{ fontSize: '0.75rem' }}>
                        {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                      </button>
                      <button onClick={() => toggleActive(u)} className="btn btn-sm btn-secondary" style={{ fontSize: '0.75rem' }}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(u._id)} className="btn btn-sm btn-danger">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pg => (
            <button key={pg} className={`page-btn ${pagination.page === pg ? 'active' : ''}`} onClick={() => fetchUsers(pg)}>{pg}</button>
          ))}
        </div>
      )}
    </div>
  );
}
