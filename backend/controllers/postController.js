const { validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// GET /api/posts
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 9, category, search, featured } = req.query;
    const query = { status: 'published' };
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name avatar')
        .populate('category', 'name slug color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-content'),
      Post.countDocuments(query)
    ]);

    res.json({
      success: true,
      posts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/posts/:slug
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name avatar bio').populate('category', 'name slug color');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    // Related posts
    const related = await Post.find({
      category: post.category._id,
      status: 'published',
      _id: { $ne: post._id }
    }).limit(3).select('title slug featuredImage excerpt readTime createdAt').populate('category', 'name slug color');

    res.json({ success: true, post, related });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/posts (admin)
exports.createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const post = await Post.create({ ...req.body, author: req.user._id });
    await post.populate('author', 'name avatar');
    await post.populate('category', 'name slug color');
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/posts/:id (admin)
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('author', 'name avatar')
      .populate('category', 'name slug color');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/posts/:id (admin)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    await Comment.deleteMany({ post: req.params.id });
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/posts/admin/all (admin - includes drafts)
exports.getAllPostsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      Post.find()
        .populate('author', 'name')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('title status views featured createdAt readTime'),
      Post.countDocuments()
    ]);
    res.json({ success: true, posts, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
