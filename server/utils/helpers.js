// Utility function to extract hashtags from text
const extractHashtags = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const hashtags = text.match(hashtagRegex);
  
  return hashtags ? hashtags.map(tag => tag.slice(1).toLowerCase()) : [];
};

// Utility function to extract mentions from text
const extractMentions = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const mentionRegex = /@[a-zA-Z0-9_]+/g;
  const mentions = text.match(mentionRegex);
  
  return mentions ? mentions.map(mention => mention.slice(1).toLowerCase()) : [];
};

// Utility function to validate tweet content
const validateTweetContent = (content) => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'Tweet content is required' };
  }
  
  if (content.trim().length === 0) {
    return { isValid: false, error: 'Tweet content cannot be empty' };
  }
  
  if (content.length > 280) {
    return { isValid: false, error: 'Tweet content exceeds 280 characters' };
  }
  
  return { isValid: true };
};

// Utility function to generate avatar URL
const generateAvatarUrl = (name) => {
  if (!name) return '';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1da1f2&color=fff&size=128`;
};

// Utility function to format user response (remove sensitive data)
const formatUserResponse = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  const { password, ...userWithoutPassword } = userObj;
  
  return userWithoutPassword;
};

// Utility function to generate conversation ID for messages
const generateConversationId = (user1, user2) => {
  const sorted = [user1, user2].sort();
  return `${sorted[0]}_${sorted[1]}`;
};

// Utility function to validate username
const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 15) {
    return { isValid: false, error: 'Username cannot exceed 15 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { isValid: true };
};

// Utility function to validate email
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
};

module.exports = {
  extractHashtags,
  extractMentions,
  validateTweetContent,
  generateAvatarUrl,
  formatUserResponse,
  generateConversationId,
  validateUsername,
  validateEmail
};
