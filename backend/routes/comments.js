const express = require('express');
const { getComments, createComment, deleteComment, getAllComments } = require('../controllers/commentController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/admin/all', protect, adminOnly, getAllComments);
router.get('/:postId', getComments);
router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
