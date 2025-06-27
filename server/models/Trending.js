const mongoose = require('mongoose');

const trendingSchema = new mongoose.Schema({
  // Hashtag Information
  hashtag: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Display hashtag (with original casing)
  displayHashtag: {
    type: String,
    required: true
  },
  
  // Trending Metrics
  tweetCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Time-based counts for trending calculation
  counts: {
    last1Hour: { type: Number, default: 0 },
    last6Hours: { type: Number, default: 0 },
    last24Hours: { type: Number, default: 0 },
    last7Days: { type: Number, default: 0 }
  },
  
  // Trending Score (calculated field)
  trendingScore: {
    type: Number,
    default: 0,
    index: true
  },
  
  // Peak Information
  peakCount: {
    type: Number,
    default: 0
  },
  peakDate: {
    type: Date
  },
  
  // Category (optional)
  category: {
    type: String,
    enum: ['general', 'sports', 'politics', 'entertainment', 'technology', 'news'],
    default: 'general'
  },
  
  // Geographic Data (optional for local trends)
  location: {
    country: String,
    region: String,
    city: String
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Historical Data Points (for trend analysis)
  history: [{
    date: { type: Date, required: true },
    count: { type: Number, required: true },
    score: { type: Number, default: 0 }
  }],
  
  // Metadata
  firstSeenAt: {
    type: Date,
    default: Date.now
  },
  
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
trendingSchema.index({ trendingScore: -1, isActive: 1 });
trendingSchema.index({ 'counts.last24Hours': -1 });
trendingSchema.index({ category: 1, trendingScore: -1 });
trendingSchema.index({ lastActivityAt: -1 });
trendingSchema.index({ 'location.country': 1, trendingScore: -1 });

// Static Methods
trendingSchema.statics.updateHashtagCount = async function(hashtag, increment = 1) {
  const now = new Date();
  const displayHashtag = hashtag; // Keep original casing
  const normalizedHashtag = hashtag.toLowerCase();
  
  try {
    // Find or create trending record
    let trending = await this.findOne({ hashtag: normalizedHashtag });
    
    if (!trending) {
      trending = new this({
        hashtag: normalizedHashtag,
        displayHashtag: displayHashtag,
        tweetCount: 0,
        firstSeenAt: now,
        lastActivityAt: now
      });
    }
    
    // Update counts
    trending.tweetCount += increment;
    trending.counts.last1Hour += increment;
    trending.counts.last6Hours += increment;
    trending.counts.last24Hours += increment;
    trending.counts.last7Days += increment;
    trending.lastActivityAt = now;
    
    // Update peak if necessary
    if (trending.tweetCount > trending.peakCount) {
      trending.peakCount = trending.tweetCount;
      trending.peakDate = now;
    }
    
    // Calculate trending score
    trending.trendingScore = this.calculateTrendingScore(trending.counts);
    
    // Add to history (keep last 168 entries = 1 week of hourly data)
    trending.history.push({
      date: now,
      count: trending.tweetCount,
      score: trending.trendingScore
    });
    
    // Keep only last 168 history entries
    if (trending.history.length > 168) {
      trending.history = trending.history.slice(-168);
    }
    
    await trending.save();
    return trending;
  } catch (error) {
    throw new Error(`Error updating hashtag count: ${error.message}`);
  }
};

trendingSchema.statics.calculateTrendingScore = function(counts) {
  // Weighted scoring system favoring recent activity
  const weights = {
    last1Hour: 10,
    last6Hours: 5,
    last24Hours: 2,
    last7Days: 1
  };
  
  return (
    (counts.last1Hour * weights.last1Hour) +
    (counts.last6Hours * weights.last6Hours) +
    (counts.last24Hours * weights.last24Hours) +
    (counts.last7Days * weights.last7Days)
  );
};

trendingSchema.statics.getTrendingHashtags = async function(options = {}) {
  const {
    limit = 10,
    category = null,
    location = null,
    timeframe = '24h'
  } = options;
  
  try {
    let query = { isActive: true };
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by location
    if (location) {
      if (location.country) query['location.country'] = location.country;
      if (location.region) query['location.region'] = location.region;
      if (location.city) query['location.city'] = location.city;
    }
    
    // Sort by trending score
    const trending = await this.find(query)
      .sort({ trendingScore: -1 })
      .limit(limit)
      .select('hashtag displayHashtag tweetCount trendingScore counts category lastActivityAt')
      .lean();
    
    return trending;
  } catch (error) {
    throw new Error(`Error getting trending hashtags: ${error.message}`);
  }
};

trendingSchema.statics.getHashtagStats = async function(hashtag) {
  const normalizedHashtag = hashtag.toLowerCase();
  
  try {
    const trending = await this.findOne({ hashtag: normalizedHashtag })
      .select('hashtag displayHashtag tweetCount counts trendingScore history peakCount peakDate firstSeenAt lastActivityAt')
      .lean();
    
    if (!trending) {
      return null;
    }
    
    // Calculate growth rate
    const growthRate = this.calculateGrowthRate(trending.history);
    
    return {
      ...trending,
      growthRate
    };
  } catch (error) {
    throw new Error(`Error getting hashtag stats: ${error.message}`);
  }
};

trendingSchema.statics.calculateGrowthRate = function(history) {
  if (history.length < 2) return 0;
  
  const recent = history.slice(-6); // Last 6 hours
  const earlier = history.slice(-12, -6); // 6 hours before that
  
  if (recent.length === 0 || earlier.length === 0) return 0;
  
  const recentAvg = recent.reduce((sum, h) => sum + h.count, 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, h) => sum + h.count, 0) / earlier.length;
  
  if (earlierAvg === 0) return recentAvg > 0 ? 100 : 0;
  
  return ((recentAvg - earlierAvg) / earlierAvg) * 100;
};

trendingSchema.statics.cleanupOldTrends = async function() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
  
  try {
    // Mark inactive trends as inactive (don't delete, keep for historical data)
    const result = await this.updateMany(
      {
        lastActivityAt: { $lt: cutoffDate },
        isActive: true
      },
      {
        $set: { isActive: false }
      }
    );
    
    return result.modifiedCount;
  } catch (error) {
    throw new Error(`Error cleaning up old trends: ${error.message}`);
  }
};

trendingSchema.statics.resetHourlyCounts = async function() {
  // Reset hourly counts (to be run every hour)
  try {
    const result = await this.updateMany(
      { isActive: true },
      {
        $set: { 'counts.last1Hour': 0 }
      }
    );
    
    return result.modifiedCount;
  } catch (error) {
    throw new Error(`Error resetting hourly counts: ${error.message}`);
  }
};

trendingSchema.statics.resetDailyCounts = async function() {
  // Reset daily counts (to be run every 24 hours)
  try {
    await this.updateMany(
      { isActive: true },
      {
        $set: { 
          'counts.last6Hours': 0,
          'counts.last24Hours': 0
        }
      }
    );
    
    // Recalculate trending scores
    const trends = await this.find({ isActive: true });
    
    for (let trend of trends) {
      trend.trendingScore = this.calculateTrendingScore(trend.counts);
      await trend.save();
    }
    
    return trends.length;
  } catch (error) {
    throw new Error(`Error resetting daily counts: ${error.message}`);
  }
};

trendingSchema.statics.getTopTrendsByCategory = async function() {
  try {
    const trends = await this.aggregate([
      {
        $match: { isActive: true, trendingScore: { $gt: 0 } }
      },
      {
        $group: {
          _id: '$category',
          trends: {
            $push: {
              hashtag: '$hashtag',
              displayHashtag: '$displayHashtag',
              tweetCount: '$tweetCount',
              trendingScore: '$trendingScore'
            }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          trends: { $slice: ['$trends', 5] } // Top 5 per category
        }
      }
    ]);
    
    return trends;
  } catch (error) {
    throw new Error(`Error getting trends by category: ${error.message}`);
  }
};

// Instance Methods
trendingSchema.methods.updateActivity = function() {
  this.lastActivityAt = new Date();
  return this.save();
};

trendingSchema.methods.addToHistory = function(count, score) {
  this.history.push({
    date: new Date(),
    count: count || this.tweetCount,
    score: score || this.trendingScore
  });
  
  // Keep only last 168 entries (1 week of hourly data)
  if (this.history.length > 168) {
    this.history = this.history.slice(-168);
  }
  
  return this.save();
};

// Virtual for trend status
trendingSchema.virtual('trendStatus').get(function() {
  const now = new Date();
  const hoursSinceActivity = (now - this.lastActivityAt) / (1000 * 60 * 60);
  
  if (hoursSinceActivity > 24) return 'inactive';
  if (this.trendingScore > 100) return 'hot';
  if (this.trendingScore > 50) return 'trending';
  return 'active';
});

// Virtual for formatted last activity
trendingSchema.virtual('formattedLastActivity').get(function() {
  return this.lastActivityAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Ensure virtual fields are serialized
trendingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Trending', trendingSchema);
