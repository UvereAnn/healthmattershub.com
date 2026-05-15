const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalPosts, publishedPosts, draftPosts, totalComments, totalCategories, totalViews] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      Comment.countDocuments(),
      Category.countDocuments(),
      Post.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }])
    ]);

    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status views createdAt')
      .populate('category', 'name');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    res.json({
      success: true,
      stats: {
        totalUsers, totalPosts, publishedPosts, draftPosts,
        totalComments, totalCategories,
        totalViews: totalViews[0]?.total || 0
      },
      recentPosts,
      recentUsers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
