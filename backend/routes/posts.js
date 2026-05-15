const express = require('express');
const { body } = require('express-validator');
const {
  getPosts, getPost, createPost, updatePost, deletePost, getAllPostsAdmin
} = require('../controllers/postController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPosts);
router.get('/admin/all', protect, adminOnly, getAllPostsAdmin);
router.get('/:slug', getPost);

router.post('/', protect, adminOnly, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').notEmpty().withMessage('Category is required')
], createPost);

router.put('/:id', protect, adminOnly, updatePost);
router.delete('/:id', protect, adminOnly, deletePost);

module.exports = router;
