const express = require('express');
const Follow = require('../models/Follow');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const router = express.Router();

// POST /api/follows/:username - Follow a user
router.post('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { follower, followerName } = req.body;
    
    if (!follower || !followerName) {
      return res.status(400).json(errorResponse('Follower and followerName are required'));
    }
    
    // Check if trying to follow self
    if (follower === username) {
      return res.status(400).json(errorResponse('Cannot follow yourself'));
    }
    
    // Check if users exist
    const [followingUser, followerUser] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ username: follower })
    ]);
    
    if (!followingUser) {
      return res.status(404).json(errorResponse('User to follow not found'));
    }
    
    if (!followerUser) {
      return res.status(404).json(errorResponse('Follower user not found'));
    }
    
    const result = await Follow.followUser(follower, username);
    
    if (result.alreadyFollowing) {
      return res.status(400).json(errorResponse('Already following this user'));
    }
    
    // Create follow notification
    await Notification.createFollowNotification(username, follower, followerName);
    
    res.json(successResponse('User followed successfully', {
      following: true,
      followersCount: result.followersCount,
      followingCount: result.followingCount
    }));
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json(errorResponse('Failed to follow user', error.message));
  }
});

// DELETE /api/follows/:username - Unfollow a user
router.delete('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { follower } = req.body;
    
    if (!follower) {
      return res.status(400).json(errorResponse('Follower is required'));
    }
    
    const result = await Follow.unfollowUser(follower, username);
    
    if (result.notFollowing) {
      return res.status(400).json(errorResponse('Not following this user'));
    }
    
    res.json(successResponse('User unfollowed successfully', {
      following: false,
      followersCount: result.followersCount,
      followingCount: result.followingCount
    }));
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json(errorResponse('Failed to unfollow user', error.message));
  }
});

// GET /api/follows/:username/followers - Get user's followers
router.get('/:username/followers', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }
    
    const followers = await Follow.getFollowers(username, parseInt(page), parseInt(limit));
    const followersCount = await Follow.getFollowersCount(username);
    
    res.json(successResponse('Followers retrieved successfully', {
      followers,
      followersCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: followersCount,
        totalPages: Math.ceil(followersCount / limit),
        hasNext: (page * limit) < followersCount,
        hasPrev: page > 1
      }
    }));
  } catch (error) {
    console.error('Error getting followers:', error);
    res.status(500).json(errorResponse('Failed to get followers', error.message));
  }
});

// GET /api/follows/:username/following - Get users that user is following
router.get('/:username/following', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }
    
    const following = await Follow.getFollowing(username, parseInt(page), parseInt(limit));
    const followingCount = await Follow.getFollowingCount(username);
    
    res.json(successResponse('Following retrieved successfully', {
      following,
      followingCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: followingCount,
        totalPages: Math.ceil(followingCount / limit),
        hasNext: (page * limit) < followingCount,
        hasPrev: page > 1
      }
    }));
  } catch (error) {
    console.error('Error getting following:', error);
    res.status(500).json(errorResponse('Failed to get following', error.message));
  }
});

// GET /api/follows/:username/status - Get follow status between two users
router.get('/:username/status', async (req, res) => {
  try {
    const { username } = req.params;
    const { follower } = req.query;
    
    if (!follower) {
      return res.status(400).json(errorResponse('Follower parameter is required'));
    }
    
    const isFollowing = await Follow.isFollowing(follower, username);
    const isFollowedBy = await Follow.isFollowing(username, follower);
    
    res.json(successResponse('Follow status retrieved successfully', {
      isFollowing,
      isFollowedBy,
      relationship: isFollowing && isFollowedBy ? 'mutual' : 
                   isFollowing ? 'following' : 
                   isFollowedBy ? 'follower' : 'none'
    }));
  } catch (error) {
    console.error('Error getting follow status:', error);
    res.status(500).json(errorResponse('Failed to get follow status', error.message));
  }
});

// GET /api/follows/:username/counts - Get follower and following counts
router.get('/:username/counts', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }
    
    const [followersCount, followingCount] = await Promise.all([
      Follow.getFollowersCount(username),
      Follow.getFollowingCount(username)
    ]);
    
    res.json(successResponse('Follow counts retrieved successfully', {
      followersCount,
      followingCount
    }));
  } catch (error) {
    console.error('Error getting follow counts:', error);
    res.status(500).json(errorResponse('Failed to get follow counts', error.message));
  }
});

// GET /api/follows/:username/suggestions - Get follow suggestions for user
router.get('/:username/suggestions', async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 10 } = req.query;
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }
    
    const suggestions = await Follow.getFollowSuggestions(username, parseInt(limit));
    
    res.json(successResponse('Follow suggestions retrieved successfully', {
      suggestions
    }));
  } catch (error) {
    console.error('Error getting follow suggestions:', error);
    res.status(500).json(errorResponse('Failed to get follow suggestions', error.message));
  }
});

// GET /api/follows/:username/mutual - Get mutual followers between two users
router.get('/:username/mutual', async (req, res) => {
  try {
    const { username } = req.params;
    const { otherUser, limit = 10 } = req.query;
    
    if (!otherUser) {
      return res.status(400).json(errorResponse('otherUser parameter is required'));
    }
    
    // Check if both users exist
    const [user1, user2] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ username: otherUser })
    ]);
    
    if (!user1 || !user2) {
      return res.status(404).json(errorResponse('One or both users not found'));
    }
    
    const mutualFollowers = await Follow.getMutualFollowers(username, otherUser, parseInt(limit));
    
    res.json(successResponse('Mutual followers retrieved successfully', {
      mutualFollowers,
      count: mutualFollowers.length
    }));
  } catch (error) {
    console.error('Error getting mutual followers:', error);
    res.status(500).json(errorResponse('Failed to get mutual followers', error.message));
  }
});

// GET /api/follows/recent - Get recent follow activities (for admin/analytics)
router.get('/recent', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const recentFollows = await Follow.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('follower', 'username name email')
      .populate('following', 'username name email')
      .lean();
    
    res.json(successResponse('Recent follows retrieved successfully', {
      recentFollows
    }));
  } catch (error) {
    console.error('Error getting recent follows:', error);
    res.status(500).json(errorResponse('Failed to get recent follows', error.message));
  }
});

module.exports = router;
