const express = require('express');
const Tweet = require('../models/Tweet');
const User = require('../models/User');
const Trending = require('../models/Trending');
const Notification = require('../models/Notification');
const { processTweetContent, validateTweetContent, generateAvatarUrl } = require('../utils/dataProcessor');
const { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse } = require('../utils/responseHelper');

const router = express.Router();

// GET /api/tweets - Get timeline tweets with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type = 'all', username } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isPublic: true };
    
    // Filter by tweet type
    if (type === 'original') {
      query.type = 'original';
    } else if (type === 'retweets') {
      query.type = 'retweet';
    } else if (type === 'replies') {
      query.type = 'reply';
    }
    
    // Filter by user
    if (username) {
      query.author = username;
    }
    
    const tweets = await Tweet.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('originalTweet', 'content author authorName authorAvatar createdAt')
      .populate('replyTo', 'content author authorName authorAvatar createdAt')
      .lean();
    
    const total = await Tweet.countDocuments(query);
    
    sendPaginatedResponse(res, 'Tweets retrieved successfully', tweets, parseInt(page), parseInt(limit), total);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    sendErrorResponse(res, 'Failed to fetch tweets', error.message, 500);
  }
});

// GET /api/tweets/:id - Get single tweet with thread
router.get('/:id', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
      .populate('originalTweet', 'content author authorName authorAvatar createdAt')
      .populate('replyTo', 'content author authorName authorAvatar createdAt')
      .lean();
    
    if (!tweet) {
      return sendErrorResponse(res, 'Tweet not found', null, 404);
    }
    
    // Get replies to this tweet
    const replies = await Tweet.find({ replyTo: req.params.id })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean();
    
    sendSuccessResponse(res, 'Tweet retrieved successfully', {
      tweet,
      replies
    });
  } catch (error) {
    console.error('Error fetching tweet:', error);
    sendErrorResponse(res, 'Failed to fetch tweet', error.message, 500);
  }
});

// POST /api/tweets - Create new tweet
router.post('/', async (req, res) => {
  try {
    const { content, author, authorName, type = 'original', originalTweet, replyTo } = req.body;
    
    // Validate required fields
    if (!content || !author || !authorName) {
      return sendErrorResponse(res, 'Content, author, and authorName are required', null, 400);
    }
    
    // Validate tweet content
    const validation = validateTweetContent(content);
    if (!validation.isValid) {
      return sendErrorResponse(res, 'Invalid tweet content', validation.errors, 400);
    }
    
    // Check if user exists
    const user = await User.findOne({ username: author });
    if (!user) {
      return sendErrorResponse(res, 'User not found', null, 404);
    }
    
    // Validate tweet type-specific requirements
    if (type === 'retweet' && !originalTweet) {
      return sendErrorResponse(res, 'Original tweet ID required for retweets', null, 400);
    }
    
    if (type === 'reply' && !replyTo) {
      return sendErrorResponse(res, 'Reply-to tweet ID required for replies', null, 400);
    }
    
    // Process tweet content for hashtags and mentions
    const { hashtags, mentions } = processTweetContent(content);
    
    // Create tweet
    const tweet = new Tweet({
      content,
      author,
      authorName,
      authorAvatar: generateAvatarUrl(author),
      type,
      originalTweet: type === 'retweet' ? originalTweet : undefined,
      replyTo: type === 'reply' ? replyTo : undefined,
      hashtags,
      mentions
    });
    
    await tweet.save();
    
    // Update hashtag trending data
    for (const hashtag of hashtags) {
      await Trending.updateHashtagCount(hashtag);
    }
    
    // Create notifications for mentions
    for (const mentionedUser of mentions) {
      if (mentionedUser !== author) { // Don't notify self
        await Notification.createMentionNotification(mentionedUser, author, authorName, tweet._id);
      }
    }
    
    // Create notification for reply
    if (type === 'reply' && replyTo) {
      const originalTweetDoc = await Tweet.findById(replyTo);
      if (originalTweetDoc && originalTweetDoc.author !== author) {
        await Notification.createReplyNotification(
          originalTweetDoc.author,
          author,
          authorName,
          tweet._id,
          originalTweetDoc._id
        );
      }
    }
    
    sendSuccessResponse(res, 'Tweet created successfully', { tweet }, 201);
  } catch (error) {
    console.error('Error creating tweet:', error);
    sendErrorResponse(res, 'Failed to create tweet', error.message, 500);
  }
});

// POST /api/tweets/:id/like - Like/unlike a tweet
router.post('/:id/like', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return sendErrorResponse(res, 'Username is required', null, 400);
    }
    
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return sendErrorResponse(res, 'Tweet not found', null, 404);
    }
    
    const result = await tweet.toggleLike(username);
    
    // Create notification for like (if liked, not unliked)
    if (result.liked && tweet.author !== username) {
      await Notification.createLikeNotification(
        tweet.author,
        username,
        req.body.displayName || username,
        tweet._id
      );
    }
    
    sendSuccessResponse(res, 
      result.liked ? 'Tweet liked successfully' : 'Tweet unliked successfully',
      {
        liked: result.liked,
        likesCount: result.likesCount
      }
    );
  } catch (error) {
    console.error('Error toggling like:', error);
    sendErrorResponse(res, 'Failed to toggle like', error.message, 500);
  }
});

// POST /api/tweets/:id/retweet - Retweet/unretweet a tweet
router.post('/:id/retweet', async (req, res) => {
  try {
    const { username, displayName } = req.body;
    
    if (!username) {
      return sendErrorResponse(res, 'Username is required', null, 400);
    }
    
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return sendErrorResponse(res, 'Tweet not found', null, 404);
    }
    
    const result = await tweet.toggleRetweet(username);
    
    // Create notification for retweet (if retweeted, not unretweeted)
    if (result.retweeted && tweet.author !== username) {
      await Notification.createRetweetNotification(
        tweet.author,
        username,
        displayName || username,
        tweet._id
      );
    }
    
    sendSuccessResponse(res,
      result.retweeted ? 'Tweet retweeted successfully' : 'Tweet unretweeted successfully',
      {
        retweeted: result.retweeted,
        retweetsCount: result.retweetsCount
      }
    );
  } catch (error) {
    console.error('Error toggling retweet:', error);
    sendErrorResponse(res, 'Failed to toggle retweet', error.message, 500);
  }
});

// POST /api/tweets/:id/reply - Reply to a tweet
router.post('/:id/reply', async (req, res) => {
  try {
    const tweetId = req.params.id;
    const { content, author, authorName } = req.body;
    
    // Validate required fields
    if (!content || !author || !authorName) {
      return sendErrorResponse(res, 'Content, author, and authorName are required', null, 400);
    }
    
    // Validate tweet content
    const validation = validateTweetContent(content);
    if (!validation.isValid) {
      return sendErrorResponse(res, 'Invalid reply content', validation.errors, 400);
    }
    
    // Check if original tweet exists
    const originalTweet = await Tweet.findById(tweetId);
    if (!originalTweet) {
      return sendErrorResponse(res, 'Original tweet not found', null, 404);
    }
    
    // Process reply content
    const { hashtags, mentions } = processTweetContent(content);
    
    // Create reply tweet
    const reply = new Tweet({
      content,
      author,
      authorName,
      authorAvatar: generateAvatarUrl(author),
      type: 'reply',
      replyTo: tweetId,
      hashtags,
      mentions
    });
    
    await reply.save();
    
    // Update original tweet reply count
    await Tweet.updateRepliesCount(tweetId);
    
    // Update hashtag trending data
    for (const hashtag of hashtags) {
      await Trending.updateHashtagCount(hashtag);
    }
    
    // Create notifications for mentions
    for (const mentionedUser of mentions) {
      if (mentionedUser !== author) {
        await Notification.createMentionNotification(mentionedUser, author, authorName, reply._id);
      }
    }
    
    // Create notification for original tweet author
    if (originalTweet.author !== author) {
      await Notification.createReplyNotification(
        originalTweet.author,
        author,
        authorName,
        reply._id,
        tweetId
      );
    }
    
    sendSuccessResponse(res, 'Reply created successfully', { reply }, 201);
  } catch (error) {
    console.error('Error creating reply:', error);
    sendErrorResponse(res, 'Failed to create reply', error.message, 500);
  }
});

// GET /api/tweets/:id/replies - Get replies to a tweet
router.get('/:id/replies', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const replies = await Tweet.find({ replyTo: req.params.id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Tweet.countDocuments({ replyTo: req.params.id });
    
    sendPaginatedResponse(res, 'Replies retrieved successfully', replies, parseInt(page), parseInt(limit), total);
  } catch (error) {
    console.error('Error fetching replies:', error);
    sendErrorResponse(res, 'Failed to fetch replies', error.message, 500);
  }
});

// DELETE /api/tweets/:id - Delete a tweet
router.delete('/:id', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return sendErrorResponse(res, 'Username is required', null, 400);
    }
    
    const tweet = await Tweet.findById(req.params.id);
    
    if (!tweet) {
      return sendErrorResponse(res, 'Tweet not found', null, 404);
    }
    
    // Check if user is authorized to delete (tweet author)
    if (tweet.author !== username) {
      return sendErrorResponse(res, 'Not authorized to delete this tweet', null, 403);
    }
    
    await Tweet.findByIdAndDelete(req.params.id);
    
    // Delete related notifications
    await Notification.deleteMany({ tweetId: req.params.id });
    
    sendSuccessResponse(res, 'Tweet deleted successfully');
  } catch (error) {
    console.error('Error deleting tweet:', error);
    sendErrorResponse(res, 'Failed to delete tweet', error.message, 500);
  }
});

// GET /api/tweets/user/:username - Get tweets by user
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20, type = 'all' } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { author: username, isPublic: true };
    
    if (type !== 'all') {
      query.type = type;
    }
    
    const tweets = await Tweet.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('originalTweet', 'content author authorName authorAvatar createdAt')
      .populate('replyTo', 'content author authorName authorAvatar createdAt')
      .lean();
    
    const total = await Tweet.countDocuments(query);
    
    sendPaginatedResponse(res, 'User tweets retrieved successfully', tweets, parseInt(page), parseInt(limit), total);
  } catch (error) {
    console.error('Error fetching user tweets:', error);
    sendErrorResponse(res, 'Failed to fetch user tweets', error.message, 500);
  }
});

// GET /api/tweets/search - Search tweets
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20, type = 'all' } = req.query;
    
    if (!q) {
      return sendErrorResponse(res, 'Search query is required', null, 400);
    }
    
    const skip = (page - 1) * limit;
    let query = {
      $and: [
        { isPublic: true },
        {
          $or: [
            { content: { $regex: q, $options: 'i' } },
            { hashtags: { $in: [q.toLowerCase()] } },
            { mentions: { $in: [q.toLowerCase()] } }
          ]
        }
      ]
    };
    
    if (type !== 'all') {
      query.$and.push({ type });
    }
    
    const tweets = await Tweet.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Tweet.countDocuments(query);
    
    sendSuccessResponse(res, 'Search results retrieved successfully', {
      tweets,
      query: q,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error searching tweets:', error);
    sendErrorResponse(res, 'Failed to search tweets', error.message, 500);
  }
});

module.exports = router;
