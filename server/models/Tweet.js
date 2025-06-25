const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 280
  },
  author: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  retweets: {
    type: Number,
    default: 0
  },
  replies: {
    type: Number,
    default: 0
  },
  images: [String],
  hashtags: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Tweet', tweetSchema);
