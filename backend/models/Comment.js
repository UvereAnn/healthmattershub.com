const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    trim: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

commentSchema.index({ post: 1, parentComment: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
