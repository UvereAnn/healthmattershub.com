import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postsAPI, categoriesAPI, uploadAPI } from '../../services/api';
import './Admin.css';

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', category: '',
    tags: '', status: 'draft', featured: false, featuredImage: ''
  });
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    categoriesAPI.getAll().then(({ data }) => setCategories(data.categories));
    if (isEdit) {
      postsAPI.getAllAdmin({ limit: 999 }).then(({ data }) => {
        const post = data.posts.find(p => p._id === id);
        if (post) setForm({
          title: post.title || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          category: post.category?._id || '',
          tags: post.tags?.join(', ') || '',
          status: post.status || 'draft',
          featured: post.featured || false,
          featuredImage: post.featuredImage || ''
        });
      });
    }
  }, [id, isEdit]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      const { data } = await uploadAPI.image(fd);
      setForm(f => ({ ...f, featuredImage: data.url }));
    } catch { setError('Image upload failed.'); }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.title.trim() || !form.content.trim() || !form.category) {
      return setError('Title, content, and category are required.');
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      if (isEdit) {
        await postsAPI.update(id, payload);
        setSuccess('Post updated successfully!');
      } else {
        await postsAPI.create(payload);
        setSuccess('Post created!');
        setTimeout(() => navigate('/admin/posts'), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post.');
    }
    setSaving(false);
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>{isEdit ? '✏️ Edit Post' : '➕ New Post'}</h1>
        <button onClick={() => navigate('/admin/posts')} className="btn btn-secondary">← Back</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="post-editor-form">
        <div className="editor-grid">
          <div className="editor-main">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" className="form-input" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter post title..." />
            </div>

            <div className="form-group">
              <label className="form-label">Content * (HTML supported)</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: 400, fontFamily: 'monospace', fontSize: '0.9rem' }}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="<p>Write your content here... HTML is supported</p>"
              />
              <small style={{ color: 'var(--text-muted)' }}>HTML tags supported: h2, h3, p, ul, ol, li, blockquote, strong, em, img</small>
            </div>

            <div className="form-group">
              <label className="form-label">Excerpt (optional – auto-generated if empty)</label>
              <textarea className="form-textarea" style={{ minHeight: 80 }} value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Brief description for article previews..." />
            </div>
          </div>

          <div className="editor-sidebar">
            <div>
              <h3>Publish</h3>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                ⭐ Featured Post
              </label>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Update Post' : 'Publish Post'}
              </button>
            </div>

            <div>
              <h3>Category</h3>
              <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category...</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <h3>Tags</h3>
              <input type="text" className="form-input" value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="nutrition, health, diet (comma-separated)" />
            </div>

            <div>
              <h3>Featured Image</h3>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '0.6rem', width: '100%' }} />
              {uploading && <p style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Uploading...</p>}
              <input type="text" className="form-input" value={form.featuredImage}
                onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                placeholder="Or paste image URL" />
              {form.featuredImage && (
                <img src={form.featuredImage} alt="Preview" className="img-preview" style={{ marginTop: '0.7rem' }} />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
