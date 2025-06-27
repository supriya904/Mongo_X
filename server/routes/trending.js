const express = require('express');
const Trending = require('../models/Trending');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const router = express.Router();

// GET /api/trending - Get trending hashtags
router.get('/', async (req, res) => {
  try {
    const { limit = 10, category, location } = req.query;
    
    const options = {
      limit: parseInt(limit),
      category: category || null,
      location: location ? JSON.parse(location) : null
    };
    
    const trending = await Trending.getTrendingHashtags(options);
    
    res.json(successResponse('Trending hashtags retrieved successfully', { trending }));
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    res.status(500).json(errorResponse('Failed to fetch trending hashtags', error.message));
  }
});

// GET /api/trending/:hashtag - Get detailed stats for a hashtag
router.get('/:hashtag', async (req, res) => {
  try {
    const { hashtag } = req.params;
    
    const stats = await Trending.getHashtagStats(hashtag);
    
    if (!stats) {
      return res.status(404).json(errorResponse('Hashtag not found in trending data'));
    }
    
    res.json(successResponse('Hashtag statistics retrieved successfully', { stats }));
  } catch (error) {
    console.error('Error fetching hashtag stats:', error);
    res.status(500).json(errorResponse('Failed to fetch hashtag statistics', error.message));
  }
});

// GET /api/trending/categories/all - Get trending hashtags by category
router.get('/categories/all', async (req, res) => {
  try {
    const trendsByCategory = await Trending.getTopTrendsByCategory();
    
    res.json(successResponse('Trending hashtags by category retrieved successfully', { 
      trendsByCategory 
    }));
  } catch (error) {
    console.error('Error fetching trends by category:', error);
    res.status(500).json(errorResponse('Failed to fetch trends by category', error.message));
  }
});

// POST /api/trending/:hashtag/update - Update hashtag count (internal use)
router.post('/:hashtag/update', async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { increment = 1 } = req.body;
    
    // This endpoint would typically be called internally when tweets are created
    // For security, we might want to add authentication here in production
    
    const trending = await Trending.updateHashtagCount(hashtag, increment);
    
    res.json(successResponse('Hashtag count updated successfully', { trending }));
  } catch (error) {
    console.error('Error updating hashtag count:', error);
    res.status(500).json(errorResponse('Failed to update hashtag count', error.message));
  }
});

// GET /api/trending/search/:query - Search trending hashtags
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    
    const trending = await Trending.find({
      $or: [
        { hashtag: { $regex: query, $options: 'i' } },
        { displayHashtag: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    })
    .sort({ trendingScore: -1 })
    .limit(parseInt(limit))
    .select('hashtag displayHashtag tweetCount trendingScore lastActivityAt')
    .lean();
    
    res.json(successResponse('Trending hashtag search results retrieved successfully', { 
      trending,
      query 
    }));
  } catch (error) {
    console.error('Error searching trending hashtags:', error);
    res.status(500).json(errorResponse('Failed to search trending hashtags', error.message));
  }
});

// GET /api/trending/history/:hashtag - Get historical data for a hashtag
router.get('/history/:hashtag', async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { days = 7 } = req.query;
    
    const trendingData = await Trending.findOne({ 
      hashtag: hashtag.toLowerCase() 
    }).select('hashtag displayHashtag history').lean();
    
    if (!trendingData) {
      return res.status(404).json(errorResponse('Hashtag not found in trending data'));
    }
    
    // Filter history by days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const filteredHistory = trendingData.history.filter(
      entry => new Date(entry.date) >= cutoffDate
    );
    
    res.json(successResponse('Hashtag history retrieved successfully', {
      hashtag: trendingData.hashtag,
      displayHashtag: trendingData.displayHashtag,
      history: filteredHistory,
      days: parseInt(days)
    }));
  } catch (error) {
    console.error('Error fetching hashtag history:', error);
    res.status(500).json(errorResponse('Failed to fetch hashtag history', error.message));
  }
});

// POST /api/trending/cleanup - Clean up old/inactive trends (admin endpoint)
router.post('/cleanup', async (req, res) => {
  try {
    // This should be protected by admin authentication in production
    
    const count = await Trending.cleanupOldTrends();
    
    res.json(successResponse('Old trends cleaned up successfully', { 
      deactivatedCount: count 
    }));
  } catch (error) {
    console.error('Error cleaning up trends:', error);
    res.status(500).json(errorResponse('Failed to clean up trends', error.message));
  }
});

// POST /api/trending/reset/hourly - Reset hourly counts (scheduled endpoint)
router.post('/reset/hourly', async (req, res) => {
  try {
    // This should be called by a scheduled job every hour
    
    const count = await Trending.resetHourlyCounts();
    
    res.json(successResponse('Hourly counts reset successfully', { 
      updatedCount: count 
    }));
  } catch (error) {
    console.error('Error resetting hourly counts:', error);
    res.status(500).json(errorResponse('Failed to reset hourly counts', error.message));
  }
});

// POST /api/trending/reset/daily - Reset daily counts (scheduled endpoint)
router.post('/reset/daily', async (req, res) => {
  try {
    // This should be called by a scheduled job every 24 hours
    
    const count = await Trending.resetDailyCounts();
    
    res.json(successResponse('Daily counts reset successfully', { 
      updatedCount: count 
    }));
  } catch (error) {
    console.error('Error resetting daily counts:', error);
    res.status(500).json(errorResponse('Failed to reset daily counts', error.message));
  }
});

// GET /api/trending/stats/global - Get global trending statistics
router.get('/stats/global', async (req, res) => {
  try {
    const [
      totalHashtags,
      activeHashtags,
      topTrending,
      recentActivity
    ] = await Promise.all([
      Trending.countDocuments({}),
      Trending.countDocuments({ isActive: true }),
      Trending.find({ isActive: true })
        .sort({ trendingScore: -1 })
        .limit(5)
        .select('hashtag displayHashtag trendingScore tweetCount')
        .lean(),
      Trending.find({ isActive: true })
        .sort({ lastActivityAt: -1 })
        .limit(10)
        .select('hashtag displayHashtag lastActivityAt tweetCount')
        .lean()
    ]);
    
    const stats = {
      counts: {
        totalHashtags,
        activeHashtags,
        inactiveHashtags: totalHashtags - activeHashtags
      },
      topTrending,
      recentActivity
    };
    
    res.json(successResponse('Global trending statistics retrieved successfully', { stats }));
  } catch (error) {
    console.error('Error fetching global trending stats:', error);
    res.status(500).json(errorResponse('Failed to fetch global trending statistics', error.message));
  }
});

module.exports = router;
