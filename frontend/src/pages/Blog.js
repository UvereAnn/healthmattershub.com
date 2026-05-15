import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { postsAPI, categoriesAPI } from '../services/api';
import BlogCard from '../components/blog/BlogCard';
import './Blog.css';

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 9 };
      if (currentCategory) params.category = currentCategory;
      if (currentSearch) params.search = currentSearch;
      const { data } = await postsAPI.getAll(params);
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [currentPage, currentCategory, currentSearch]);

  useEffect(() => {
    categoriesAPI.getAll().then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const updateParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const currentCatName = categories.find(c => c._id === currentCategory)?.name;

  return (
    <div className="page-wrapper">
      <div className="blog-hero">
        <div className="container">
          <h1>{currentCatName || 'Health Blog'}</h1>
          <p>{currentCatName ? `Articles in ${currentCatName}` : 'Expert health, wellness & lifestyle articles'}</p>
        </div>
      </div>

      <div className="container blog-layout">
        {/* Sidebar */}
        <aside className="blog-sidebar">
          <div className="sidebar-card">
            <h3>🔍 Search</h3>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                className="form-input"
                placeholder="Search articles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Search</button>
            </form>
            {currentSearch && (
              <button className="clear-filter" onClick={() => { setSearchInput(''); updateParam('search', ''); }}>
                ✕ Clear search: "{currentSearch}"
              </button>
            )}
          </div>

          <div className="sidebar-card">
            <h3>📂 Categories</h3>
            <button
              className={`cat-filter-btn ${!currentCategory ? 'active' : ''}`}
              onClick={() => updateParam('category', '')}
            >
              All Topics <span>{categories.reduce((a, c) => a + (c.postCount || 0), 0)}</span>
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                className={`cat-filter-btn ${currentCategory === cat._id ? 'active' : ''}`}
                onClick={() => updateParam('category', cat._id)}
                style={{ '--cat-color': cat.color }}
              >
                {cat.name} <span>{cat.postCount || 0}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="blog-main">
          <div className="blog-results-info">
            <span>{pagination.total} article{pagination.total !== 1 ? 's' : ''}</span>
            {currentCategory && (
              <button className="clear-filter" onClick={() => updateParam('category', '')}>
                ✕ Clear category
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <span>📭</span>
              <h3>No articles found</h3>
              <p>Try different search terms or categories</p>
            </div>
          ) : (
            <div className="grid-3">
              {posts.map(p => <BlogCard key={p._id} post={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pg => (
                <button
                  key={pg}
                  className={`page-btn ${currentPage === pg ? 'active' : ''}`}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set('page', pg);
                    setSearchParams(p);
                  }}
                >
                  {pg}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
