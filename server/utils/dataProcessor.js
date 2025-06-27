/**
 * Data Processing Utilities for Twitter Clone
 * Handles content analysis, engagement calculations, and data transformations
 */

/**
 * Extract hashtags from tweet content
 * @param {string} content - Tweet content
 * @returns {Array<string>} - Array of hashtags (without #)
 */
function extractHashtags(content) {
  if (!content || typeof content !== 'string') return [];
  
  const hashtagRegex = /#(\w+)/g;
  const hashtags = [];
  let match;
  
  while ((match = hashtagRegex.exec(content)) !== null) {
    const hashtag = match[1].toLowerCase();
    if (!hashtags.includes(hashtag)) {
      hashtags.push(hashtag);
    }
  }
  
  return hashtags;
}

/**
 * Extract mentions from tweet content
 * @param {string} content - Tweet content
 * @returns {Array<string>} - Array of mentioned usernames (without @)
 */
function extractMentions(content) {
  if (!content || typeof content !== 'string') return [];
  
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    const mention = match[1].toLowerCase();
    if (!mentions.includes(mention)) {
      mentions.push(mention);
    }
  }
  
  return mentions;
}

/**
 * Process tweet content to extract hashtags and mentions
 * @param {string} content - Tweet content
 * @returns {Object} - Object with hashtags and mentions arrays
 */
function processTweetContent(content) {
  return {
    hashtags: extractHashtags(content),
    mentions: extractMentions(content)
  };
}

/**
 * Calculate engagement rate for a tweet
 * @param {Object} tweet - Tweet object with engagement counts
 * @returns {number} - Engagement rate as percentage
 */
function calculateEngagementRate(tweet) {
  if (!tweet) return 0;
  
  const totalEngagements = (tweet.likesCount || 0) + 
                          (tweet.retweetsCount || 0) + 
                          (tweet.repliesCount || 0);
  
  // For now, we'll use a base impression count
  // In a real app, this would be actual view/impression data
  const baseImpressions = Math.max(totalEngagements * 10, 100);
  
  return totalEngagements > 0 ? (totalEngagements / baseImpressions) * 100 : 0;
}

/**
 * Calculate tweet popularity score
 * @param {Object} tweet - Tweet object
 * @returns {number} - Popularity score
 */
function calculatePopularityScore(tweet) {
  if (!tweet) return 0;
  
  const likes = tweet.likesCount || 0;
  const retweets = tweet.retweetsCount || 0;
  const replies = tweet.repliesCount || 0;
  
  // Weighted scoring system
  const weights = {
    likes: 1,
    retweets: 3, // Retweets are more valuable
    replies: 2   // Replies show engagement
  };
  
  const score = (likes * weights.likes) + 
                (retweets * weights.retweets) + 
                (replies * weights.replies);
  
  // Factor in tweet age (newer tweets get slight boost)
  const ageInHours = (Date.now() - new Date(tweet.createdAt).getTime()) / (1000 * 60 * 60);
  const ageFactor = Math.max(0.1, 1 - (ageInHours / 168)); // Decay over a week
  
  return Math.round(score * ageFactor);
}

/**
 * Format tweet content for display
 * @param {string} content - Raw tweet content
 * @returns {string} - Formatted content with clickable hashtags and mentions
 */
function formatTweetContent(content) {
  if (!content) return '';
  
  let formatted = content;
  
  // Format hashtags
  formatted = formatted.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
  
  // Format mentions
  formatted = formatted.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  
  // Format URLs (basic implementation)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return formatted;
}

/**
 * Validate tweet content
 * @param {string} content - Tweet content to validate
 * @returns {Object} - Validation result with isValid and errors
 */
function validateTweetContent(content) {
  const errors = [];
  
  if (!content || typeof content !== 'string') {
    errors.push('Tweet content is required');
  } else {
    const trimmedContent = content.trim();
    
    if (trimmedContent.length === 0) {
      errors.push('Tweet content cannot be empty');
    }
    
    if (trimmedContent.length > 280) {
      errors.push('Tweet content cannot exceed 280 characters');
    }
    
    // Check for spam patterns (basic implementation)
    const repeatedCharPattern = /(.)\1{10,}/;
    if (repeatedCharPattern.test(trimmedContent)) {
      errors.push('Tweet contains excessive repeated characters');
    }
    
    // Check for excessive hashtags
    const hashtags = extractHashtags(trimmedContent);
    if (hashtags.length > 10) {
      errors.push('Tweet cannot contain more than 10 hashtags');
    }
    
    // Check for excessive mentions
    const mentions = extractMentions(trimmedContent);
    if (mentions.length > 10) {
      errors.push('Tweet cannot mention more than 10 users');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate tweet summary for notifications
 * @param {string} content - Tweet content
 * @param {number} maxLength - Maximum length of summary
 * @returns {string} - Truncated tweet summary
 */
function generateTweetSummary(content, maxLength = 50) {
  if (!content) return '';
  
  const cleanContent = content.replace(/@\w+|#\w+/g, '').trim();
  
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  
  return cleanContent.substring(0, maxLength - 3) + '...';
}

/**
 * Calculate time-based trending score
 * @param {Array} timeSeriesData - Array of count data over time
 * @returns {number} - Trending score
 */
function calculateTrendingScore(timeSeriesData) {
  if (!timeSeriesData || timeSeriesData.length < 2) return 0;
  
  // Calculate velocity (rate of change)
  const recent = timeSeriesData.slice(-6); // Last 6 data points
  const earlier = timeSeriesData.slice(-12, -6); // 6 data points before
  
  if (recent.length === 0 || earlier.length === 0) return 0;
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length;
  
  // Calculate growth rate
  const growthRate = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) : 0;
  
  // Calculate absolute volume score
  const volumeScore = recentAvg;
  
  // Combine growth rate and volume (weighted)
  return Math.round((growthRate * 0.6 + volumeScore * 0.4) * 100);
}

/**
 * Format numbers for display (e.g., 1.2K, 1.5M)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
function formatNumber(num) {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  return (num / 1000000000).toFixed(1).replace('.0', '') + 'B';
}

/**
 * Calculate time ago string
 * @param {Date} date - Date to calculate from
 * @returns {string} - Time ago string (e.g., "2h", "1d", "3w")
 */
function timeAgo(date) {
  if (!date) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo`;
  return `${Math.floor(diffInSeconds / 31536000)}y`;
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Generate user avatar URL based on username
 * @param {string} username - User's username
 * @returns {string} - Avatar URL
 */
function generateAvatarUrl(username) {
  if (!username) return '/api/avatars/default.png';
  
  // For now, we'll use a placeholder service
  // In production, this would be actual uploaded avatars
  const colors = ['1abc9c', '2ecc71', '3498db', '9b59b6', 'e74c3c', 'f39c12', '95a5a6'];
  const colorIndex = username.length % colors.length;
  const color = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${color}&color=fff&size=128`;
}

/**
 * Paginate results
 * @param {Array} data - Data to paginate
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} - Paginated result with data and metadata
 */
function paginate(data, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const paginatedData = data.slice(offset, offset + limit);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
      hasNext: offset + limit < data.length,
      hasPrev: page > 1
    }
  };
}

module.exports = {
  // Content processing
  extractHashtags,
  extractMentions,
  processTweetContent,
  formatTweetContent,
  validateTweetContent,
  generateTweetSummary,
  
  // Engagement calculations
  calculateEngagementRate,
  calculatePopularityScore,
  calculateTrendingScore,
  
  // Formatting utilities
  formatNumber,
  timeAgo,
  generateAvatarUrl,
  
  // Security utilities
  sanitizeInput,
  
  // Data utilities
  paginate
};
