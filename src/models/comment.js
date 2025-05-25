import mongoose, { Schema } from 'mongoose';

const CommentSchema = new Schema({
  postId: {
    type: mongoose.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  user: {
    _id: mongoose.Types.ObjectId,
    username: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 댓글이 수정될 때마다 updatedAt 필드 업데이트
CommentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;