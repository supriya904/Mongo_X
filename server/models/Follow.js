const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {
    type: String, // username who follows
    required: true,
    index: true
  },
  following: {
    type: String, // username being followed
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate follows and for efficient queries
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1, createdAt: -1 }); // For followers list
followSchema.index({ follower: 1, createdAt: -1 }); // For following list

// Static methods
followSchema.statics.followUser = async function(followerUsername, followingUsername) {
  if (followerUsername === followingUsername) {
    throw new Error('Cannot follow yourself');
  }
  
  try {
    const follow = new this({
      follower: followerUsername,
      following: followingUsername
    });
    
    await follow.save();
    return follow;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Already following this user');
    }
    throw error;
  }
};

followSchema.statics.unfollowUser = async function(followerUsername, followingUsername) {
  const result = await this.deleteOne({
    follower: followerUsername,
    following: followingUsername
  });
  
  if (result.deletedCount === 0) {
    throw new Error('Not following this user');
  }
  
  return result;
};

followSchema.statics.isFollowing = async function(followerUsername, followingUsername) {
  const follow = await this.findOne({
    follower: followerUsername,
    following: followingUsername
  });
  
  return !!follow;
};

followSchema.statics.getFollowers = function(username, limit = 50, skip = 0) {
  return this.find({ following: username })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .select('follower createdAt')
    .exec();
};

followSchema.statics.getFollowing = function(username, limit = 50, skip = 0) {
  return this.find({ follower: username })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .select('following createdAt')
    .exec();
};

followSchema.statics.getFollowersCount = function(username) {
  return this.countDocuments({ following: username });
};

followSchema.statics.getFollowingCount = function(username) {
  return this.countDocuments({ follower: username });
};

module.exports = mongoose.model('Follow', followSchema);
