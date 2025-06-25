const express = require('express');
const Tweet = require('../models/Tweet');

const router = express.Router();

// GET /api/tweets - Get all tweets
router.get('/', async (req, res) => {
  try {
    const tweets = await Tweet.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: tweets.length,
      data: tweets
    });
  } catch (error) {
    console.error('Error fetching tweets:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// GET /api/tweets/:id - Get single tweet
router.get('/:id', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    res.json({
      success: true,
      data: tweet
    });
  } catch (error) {
    console.error('Error fetching tweet:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// POST /api/tweets - Create new tweet
router.post('/', async (req, res) => {
  try {
    const { content, author, authorName } = req.body;

    if (!content || !author || !authorName) {
      return res.status(400).json({
        success: false,
        message: 'Content, author, and authorName are required'
      });
    }

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=1da1f2&color=fff`;

    const tweet = new Tweet({
      content,
      author,
      authorName,
      avatar
    });

    await tweet.save();

    res.status(201).json({
      success: true,
      message: 'Tweet created successfully',
      data: tweet
    });
  } catch (error) {
    console.error('Error creating tweet:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// PUT /api/tweets/:id/like - Like a tweet
router.put('/:id/like', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    tweet.likes += 1;
    await tweet.save();

    res.json({
      success: true,
      message: 'Tweet liked successfully',
      data: { likes: tweet.likes }
    });
  } catch (error) {
    console.error('Error liking tweet:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// PUT /api/tweets/:id/retweet - Retweet a tweet
router.put('/:id/retweet', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    tweet.retweets += 1;
    await tweet.save();

    res.json({
      success: true,
      message: 'Tweet retweeted successfully',
      data: { retweets: tweet.retweets }
    });
  } catch (error) {
    console.error('Error retweeting:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// DELETE /api/tweets/:id - Delete a tweet
router.delete('/:id', async (req, res) => {
  try {
    const tweet = await Tweet.findByIdAndDelete(req.params.id);
    
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    res.json({
      success: true,
      message: 'Tweet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tweet:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
