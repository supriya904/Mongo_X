const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  // Core Content
  content: {
    type: String,
    required: true,
    maxlength: 280,
    trim: true
  },
  
  // Author Information
  author: {
    type: String, // username
    required: true,
    index: true
  },
  authorName: {
    type: String, // display name
    required: true
  },
  authorAvatar: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.authorName)}&background=1da1f2&color=fff`;
    }
  },
  
  // Media (for future implementation)
  images: [{
    type: String // image URLs
  }],
  video: {
    type: String, // video URL
    default: null
  },
  
  // Engagement Arrays (stores usernames who interacted)
  likes: [{
    type: String // array of usernames who liked
  }],
  retweets: [{
    type: String // array of usernames who retweeted
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet' // array of reply tweet IDs
  }],
  
  // Performance Counts (for quick access)
  likesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  retweetsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  repliesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Tweet Type & Relationships
  type: {
    type: String,
    enum: ['original', 'retweet', 'reply'],
    default: 'original'
  },
  originalTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    default: null // only set if type is 'retweet'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    default: null // only set if type is 'reply'
  },
  
  // Content Analysis
  hashtags: [{
    type: String,
    lowercase: true
  }],
  mentions: [{
    type: String,
    lowercase: true
  }],
  
  // Visibility & Settings
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
tweetSchema.index({ createdAt: -1 }); // For timeline sorting
tweetSchema.index({ author: 1, createdAt: -1 }); // For user tweets
tweetSchema.index({ hashtags: 1 }); // For hashtag search
tweetSchema.index({ mentions: 1 }); // For mention search
tweetSchema.index({ type: 1 }); // For filtering tweet types

// Virtual fields
tweetSchema.virtual('isLiked').get(function() {
  // This will be used in frontend to check if current user liked
  return false; // Will be calculated based on current user
});

// Instance methods
tweetSchema.methods.addLike = function(username) {
  if (!this.likes.includes(username)) {
    this.likes.push(username);
    this.likesCount = this.likes.length;
  }
  return this.save();
};

tweetSchema.methods.removeLike = function(username) {
  this.likes = this.likes.filter(user => user !== username);
  this.likesCount = this.likes.length;
  return this.save();
};

tweetSchema.methods.addRetweet = function(username) {
  if (!this.retweets.includes(username)) {
    this.retweets.push(username);
    this.retweetsCount = this.retweets.length;
  }
  return this.save();
};

tweetSchema.methods.removeRetweet = function(username) {
  this.retweets = this.retweets.filter(user => user !== username);
  this.retweetsCount = this.retweets.length;
  return this.save();
};

tweetSchema.methods.incrementViews = function() {
  this.viewsCount += 1;
  return this.save();
};

// Static methods
tweetSchema.statics.getTimelineTweets = function(limit = 50, skip = 0) {
  return this.find({ isPublic: true, type: { $in: ['original', 'retweet'] } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('originalTweet')
    .exec();
};

tweetSchema.statics.getUserTweets = function(username, limit = 50, skip = 0) {
  return this.find({ author: username, isPublic: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .exec();
};

// Pre-save middleware to ensure data consistency
tweetSchema.pre('save', function(next) {
  // Ensure counts match array lengths
  this.likesCount = this.likes.length;
  this.retweetsCount = this.retweets.length;
  this.repliesCount = this.replies.length;
  
  // Set authorAvatar if not provided
  if (!this.authorAvatar) {
    this.authorAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.authorName)}&background=1da1f2&color=fff`;
  }
  
  next();
});

module.exports = mongoose.model('Tweet', tweetSchema);
