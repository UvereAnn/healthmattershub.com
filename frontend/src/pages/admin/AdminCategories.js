import { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import './Admin.css';

const COLORS = ['#2d6a4f', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981'];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesAPI.getAll().then(({ data }) => setCategories(data.categories)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        const { data } = await categoriesAPI.update(editId, form);
        setCategories(cats => cats.map(c => c._id === editId ? { ...data.category, postCount: c.postCount } : c));
        setEditId(null);
      } else {
        const { data } = await categoriesAPI.create(form);
        setCategories(cats => [...cats, { ...data.category, postCount: 0 }]);
      }
      setForm({ name: '', description: '', color: COLORS[0] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.');
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setForm({ name: cat.name, description: cat.description || '', color: cat.color || COLORS[0] });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoriesAPI.delete(id);
      setCategories(cats => cats.filter(c => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>📂 Categories</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Form */}
        <div className="post-editor-form">
          <h2 style={{ marginBottom: '1.5rem' }}>{editId ? 'Edit Category' : 'New Category'}</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input type="text" className="form-input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Nutrition" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" style={{ minHeight: 80 }} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description..." />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #000' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.7rem' }}>
              <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'}</button>
              {editId && <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm({ name: '', description: '', color: COLORS[0] }); }}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* List */}
        <div>
          {loading ? <div className="loading-center"><div className="spinner"></div></div> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Category</th><th>Posts</th><th>Actions</th></tr></thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                          <span style={{ width: 14, height: 14, borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }}></span>
                          <strong>{cat.name}</strong>
                        </div>
                      </td>
                      <td>{cat.postCount || 0}</td>
                      <td>
                        <div className="action-btns">
                          <button onClick={() => handleEdit(cat)} className="btn btn-sm btn-secondary">Edit</button>
                          <button onClick={() => handleDelete(cat._id)} className="btn btn-sm btn-danger">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No categories yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
