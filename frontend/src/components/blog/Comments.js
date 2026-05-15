import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Comments.css';

function CommentItem({ comment, onDelete, onReply, currentUser, isAdmin }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setLoading(true);
    await onReply(comment._id, replyText);
    setReplyText('');
    setShowReplyBox(false);
    setLoading(false);
  };

  const canDelete = isAdmin || currentUser?._id === comment.author?._id;

  return (
    <div className="comment-item">
      <img
        src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.name || 'U')}&size=40&background=2d6a4f&color=fff`}
        alt={comment.author?.name}
        className="comment-avatar"
      />
      <div className="comment-body">
        <div className="comment-header">
          <strong>{comment.author?.name || 'User'}</strong>
          <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
          {canDelete && (
            <button className="btn-icon-danger" onClick={() => onDelete(comment._id)} title="Delete">🗑</button>
          )}
        </div>
        <p className="comment-text">{comment.content}</p>
        {currentUser && (
          <button className="reply-btn" onClick={() => setShowReplyBox(!showReplyBox)}>
            💬 Reply
          </button>
        )}
        {showReplyBox && (
          <form onSubmit={handleReply} className="reply-form">
            <textarea
              className="form-input"
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <button type="submit" className="btn btn-sm btn-primary" disabled={loading}>
                {loading ? 'Posting...' : 'Post Reply'}
              </button>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowReplyBox(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
        {comment.replies?.length > 0 && (
          <div className="replies">
            {comment.replies.map(reply => (
              <CommentItem key={reply._id} comment={reply} onDelete={onDelete} onReply={() => {}} currentUser={currentUser} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Comments({ postId }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    commentsAPI.getByPost(postId)
      .then(({ data }) => setComments(data.comments))
      .catch(() => setError('Failed to load comments.'))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const { data } = await commentsAPI.create({ postId, content: newComment });
      setComments(prev => [{ ...data.comment, replies: [] }, ...prev]);
      setNewComment('');
    } catch (err) {
      setError('Failed to post comment.');
    }
    setPosting(false);
  };

  const handleReply = async (parentComment, content) => {
    try {
      const { data } = await commentsAPI.create({ postId, content, parentComment });
      setComments(prev => prev.map(c =>
        c._id === parentComment
          ? { ...c, replies: [...(c.replies || []), data.comment] }
          : c
      ));
    } catch (err) {
      setError('Failed to post reply.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsAPI.delete(id);
      setComments(prev =>
        prev.filter(c => c._id !== id).map(c => ({
          ...c, replies: (c.replies || []).filter(r => r._id !== id)
        }))
      );
    } catch {
      setError('Failed to delete comment.');
    }
  };

  return (
    <section className="comments-section">
      <h3 className="comments-title">💬 Comments ({comments.length})</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=40&background=2d6a4f&color=fff`}
            alt={user.name}
            className="comment-avatar"
          />
          <div style={{ flex: 1 }}>
            <textarea
              className="form-textarea"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength={1000}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={posting}>
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <Link to="/login" className="btn btn-primary btn-sm">Login to comment</Link>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>or <Link to="/register">register</Link></span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No comments yet. Be the first!</p>
      ) : (
        <div className="comments-list">
          {comments.map(c => (
            <CommentItem
              key={c._id}
              comment={c}
              onDelete={handleDelete}
              onReply={handleReply}
              currentUser={user}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </section>
  );
}
