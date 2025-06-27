const express = require('express');
const User = require('../models/User');
const Follow = require('../models/Follow');
const Tweet = require('../models/Tweet');
const { generateAvatarUrl } = require('../utils/dataProcessor');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const router = express.Router();

// GET /api/users - Get all users with search and pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Add follower counts to each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const [followersCount, followingCount, tweetsCount] = await Promise.all([
          Follow.getFollowersCount(user.username),
          Follow.getFollowingCount(user.username),
          Tweet.countDocuments({ author: user.username })
        ]);
        
        return {
          ...user,
          followersCount,
          followingCount,
          tweetsCount
        };
      })
    );
    
    const total = await User.countDocuments(query);
    
    res.json(successResponse('Users retrieved successfully', {
      users: usersWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json(errorResponse('Failed to fetch users', error.message));
  }
});

// GET /api/users/:username - Get user profile with stats
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }
    
    // Get user stats
    const [followersCount, followingCount, tweetsCount] = await Promise.all([
      Follow.getFollowersCount(user.username),
      Follow.getFollowingCount(user.username),
      Tweet.countDocuments({ author: user.username })
    ]);
    
    const userProfile = {
      ...user,
      followersCount,
      followingCount,
      tweetsCount
    };

    res.json(successResponse('User profile retrieved successfully', { user: userProfile }));
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json(errorResponse('Failed to fetch user', error.message));
  }
});

// POST /api/users - Create new user (registration)
router.post('/', async (req, res) => {
  try {
    const { username, email, password, name, dateOfBirth, bio, location } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json(errorResponse('Username, email, password, and name are required'));
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json(errorResponse('Username must be 3-20 characters long and contain only letters, numbers, and underscores'));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json(errorResponse('Invalid email format'));
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json(errorResponse(`User with this ${field} already exists`));
    }

    const user = new User({
      username,
      email,
      password,
      name,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      bio,
      location,
      avatar: generateAvatarUrl(username)
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(successResponse('User created successfully', { user: userResponse }));
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json(errorResponse('Failed to create user', error.message));
  }
});

// PUT /api/users/:username - Update user profile
router.put('/:username', async (req, res) => {
  try {
    const { name, bio, location, currentUser } = req.body;
    
    // Check authorization (user can only update their own profile)
    if (currentUser !== req.params.username) {
      return res.status(403).json(errorResponse('Not authorized to update this profile'));
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (location !== undefined) updateFields.location = location;
    
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    res.json(successResponse('User profile updated successfully', { user }));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json(errorResponse('Failed to update user', error.message));
  }
});

// POST /api/users/login - Simple login (no JWT)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json(errorResponse('Username and password are required'));
    }

    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(400).json(errorResponse('Invalid username or password'));
    }

    // Get user stats
    const [followersCount, followingCount, tweetsCount] = await Promise.all([
      Follow.getFollowersCount(user.username),
      Follow.getFollowingCount(user.username),
      Tweet.countDocuments({ author: user.username })
    ]);

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    const userWithStats = {
      ...userResponse,
      followersCount,
      followingCount,
      tweetsCount
    };

    res.json(successResponse('Login successful', { user: userWithStats }));
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json(errorResponse('Login failed', error.message));
  }
});

// GET /api/users/:username/timeline - Get user's timeline (tweets from followed users)
router.get('/:username/timeline', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Get users that this user follows
    const following = await Follow.getFollowing(username, 1, 1000); // Get all following
    const followingUsernames = following.map(f => f.following);
    followingUsernames.push(username); // Include user's own tweets
    
    const tweets = await Tweet.find({ 
      author: { $in: followingUsernames },
      isPublic: true
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('originalTweet', 'content author authorName authorAvatar createdAt')
    .populate('replyTo', 'content author authorName authorAvatar createdAt')
    .lean();
    
    const total = await Tweet.countDocuments({ 
      author: { $in: followingUsernames },
      isPublic: true
    });
    
    res.json(successResponse('Timeline retrieved successfully', {
      tweets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    }));
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json(errorResponse('Failed to fetch timeline', error.message));
  }
});

// GET /api/users/search - Search users with advanced filtering
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json(errorResponse('Search query is required'));
    }
    
    const skip = (page - 1) * limit;
    const query = {
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ]
    };
    
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Add stats to each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [followersCount, followingCount, tweetsCount] = await Promise.all([
          Follow.getFollowersCount(user.username),
          Follow.getFollowingCount(user.username),
          Tweet.countDocuments({ author: user.username })
        ]);
        
        return {
          ...user,
          followersCount,
          followingCount,
          tweetsCount
        };
      })
    );
    
    const total = await User.countDocuments(query);
    
    res.json(successResponse('User search results retrieved successfully', {
      users: usersWithStats,
      query: q,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json(errorResponse('Failed to search users', error.message));
  }
});

// GET /api/users/:username/stats - Get detailed user statistics
router.get('/:username/stats', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Check if user exists
    const user = await User.findOne({ username }).select('username name createdAt');
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }
    
    // Get comprehensive stats
    const [
      followersCount,
      followingCount,
      tweetsCount,
      likesReceived,
      retweetsReceived,
      repliesReceived
    ] = await Promise.all([
      Follow.getFollowersCount(username),
      Follow.getFollowingCount(username),
      Tweet.countDocuments({ author: username }),
      Tweet.aggregate([
        { $match: { author: username } },
        { $group: { _id: null, total: { $sum: '$likesCount' } } }
      ]),
      Tweet.aggregate([
        { $match: { author: username } },
        { $group: { _id: null, total: { $sum: '$retweetsCount' } } }
      ]),
      Tweet.aggregate([
        { $match: { author: username } },
        { $group: { _id: null, total: { $sum: '$repliesCount' } } }
      ])
    ]);
    
    const stats = {
      user: {
        username: user.username,
        name: user.name,
        joinedAt: user.createdAt
      },
      counts: {
        followers: followersCount,
        following: followingCount,
        tweets: tweetsCount,
        likesReceived: likesReceived[0]?.total || 0,
        retweetsReceived: retweetsReceived[0]?.total || 0,
        repliesReceived: repliesReceived[0]?.total || 0
      },
      engagement: {
        totalEngagement: (likesReceived[0]?.total || 0) + (retweetsReceived[0]?.total || 0) + (repliesReceived[0]?.total || 0),
        averageEngagementPerTweet: tweetsCount > 0 ? 
          Math.round(((likesReceived[0]?.total || 0) + (retweetsReceived[0]?.total || 0) + (repliesReceived[0]?.total || 0)) / tweetsCount * 100) / 100 : 0
      }
    };
    
    res.json(successResponse('User statistics retrieved successfully', { stats }));
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json(errorResponse('Failed to fetch user statistics', error.message));
  }
});

module.exports = router;
