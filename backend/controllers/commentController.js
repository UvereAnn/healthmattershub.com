const Comment = require('../models/Comment');
const Post = require('../models/Post');

// GET /api/comments/:postId
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, parentComment: null, isApproved: true })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    // Attach replies
    const withReplies = await Promise.all(comments.map(async (comment) => {
      const replies = await Comment.find({ parentComment: comment._id, isApproved: true })
        .populate('author', 'name avatar')
        .sort({ createdAt: 1 });
      return { ...comment.toObject(), replies };
    }));

    res.json({ success: true, comments: withReplies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/comments
exports.createComment = async (req, res) => {
  try {
    const { postId, content, parentComment } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content,
      parentComment: parentComment || null
    });
    await comment.populate('author', 'name avatar');
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/comments/:id (admin or own comment)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    if (req.user.role !== 'admin' && comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();
    res.json({ success: true, message: 'Comment deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/comments/admin/all (admin)
exports.getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [comments, total] = await Promise.all([
      Comment.find()
        .populate('author', 'name email')
        .populate('post', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Comment.countDocuments()
    ]);
    res.json({ success: true, comments, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
