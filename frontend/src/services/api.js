import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data)
};

// ─── Posts ─────────────────────────────────────────────────────────────────────
export const postsAPI = {
  getAll: (params) => API.get('/posts', { params }),
  getOne: (slug) => API.get(`/posts/${slug}`),
  create: (data) => API.post('/posts', data),
  update: (id, data) => API.put(`/posts/${id}`, data),
  delete: (id) => API.delete(`/posts/${id}`),
  getAllAdmin: (params) => API.get('/posts/admin/all', { params })
};

// ─── Categories ────────────────────────────────────────────────────────────────
export const categoriesAPI = {
  getAll: () => API.get('/categories'),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`)
};

// ─── Comments ──────────────────────────────────────────────────────────────────
export const commentsAPI = {
  getByPost: (postId) => API.get(`/comments/${postId}`),
  create: (data) => API.post('/comments', data),
  delete: (id) => API.delete(`/comments/${id}`),
  getAllAdmin: (params) => API.get('/comments/admin/all', { params })
};

// ─── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params) => API.get('/users', { params }),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`)
};

// ─── Upload ────────────────────────────────────────────────────────────────────
export const uploadAPI = {
  image: (formData) => API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
};

// ─── Stats ─────────────────────────────────────────────────────────────────────
export const statsAPI = {
  getDashboard: () => API.get('/stats/dashboard')
};

export default API;
