const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: String, // username of recipient
    required: true,
    index: true
  },
  sender: {
    type: String, // username of sender
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'retweet', 'follow', 'mention', 'reply'],
    required: true
  },
  tweetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    default: null // optional, used for tweet-related notifications
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  // Additional data for different notification types
  metadata: {
    tweetContent: String, // excerpt of tweet content for context
    senderName: String, // display name of sender
    senderAvatar: String // avatar of sender
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 }); // For user notifications
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 }); // For unread notifications
notificationSchema.index({ type: 1 }); // For filtering by type

// Static methods
notificationSchema.statics.createNotification = async function(data) {
  const { recipient, sender, type, tweetId, message, metadata } = data;
  
  // Don't create notification if user is notifying themselves
  if (recipient === sender) {
    return null;
  }
  
  const notification = new this({
    recipient,
    sender,
    type,
    tweetId,
    message,
    metadata
  });
  
  await notification.save();
  return notification;
};

notificationSchema.statics.getUserNotifications = function(username, limit = 50, skip = 0) {
  return this.find({ recipient: username })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('tweetId', 'content author authorName createdAt')
    .exec();
};

notificationSchema.statics.getUnreadCount = function(username) {
  return this.countDocuments({ recipient: username, isRead: false });
};

notificationSchema.statics.markAsRead = function(username, notificationIds = []) {
  if (notificationIds.length > 0) {
    // Mark specific notifications as read
    return this.updateMany(
      { 
        _id: { $in: notificationIds }, 
        recipient: username 
      },
      { $set: { isRead: true } }
    );
  } else {
    // Mark all notifications as read
    return this.updateMany(
      { recipient: username, isRead: false },
      { $set: { isRead: true } }
    );
  }
};

notificationSchema.statics.createLikeNotification = async function(tweetAuthor, liker, tweetId, tweetContent) {
  return this.createNotification({
    recipient: tweetAuthor,
    sender: liker,
    type: 'like',
    tweetId: tweetId,
    message: `${liker} liked your tweet`,
    metadata: {
      tweetContent: tweetContent.substring(0, 50) + (tweetContent.length > 50 ? '...' : ''),
      senderName: liker // You might want to pass actual display name
    }
  });
};

notificationSchema.statics.createRetweetNotification = async function(tweetAuthor, retweeter, tweetId, tweetContent) {
  return this.createNotification({
    recipient: tweetAuthor,
    sender: retweeter,
    type: 'retweet',
    tweetId: tweetId,
    message: `${retweeter} retweeted your tweet`,
    metadata: {
      tweetContent: tweetContent.substring(0, 50) + (tweetContent.length > 50 ? '...' : ''),
      senderName: retweeter
    }
  });
};

notificationSchema.statics.createFollowNotification = async function(followed, follower) {
  return this.createNotification({
    recipient: followed,
    sender: follower,
    type: 'follow',
    message: `${follower} started following you`,
    metadata: {
      senderName: follower
    }
  });
};

notificationSchema.statics.createMentionNotification = async function(mentioned, mentioner, tweetId, tweetContent) {
  return this.createNotification({
    recipient: mentioned,
    sender: mentioner,
    type: 'mention',
    tweetId: tweetId,
    message: `${mentioner} mentioned you in a tweet`,
    metadata: {
      tweetContent: tweetContent.substring(0, 50) + (tweetContent.length > 50 ? '...' : ''),
      senderName: mentioner
    }
  });
};

notificationSchema.statics.createReplyNotification = async function(originalAuthor, replier, tweetId, replyContent) {
  return this.createNotification({
    recipient: originalAuthor,
    sender: replier,
    type: 'reply',
    tweetId: tweetId,
    message: `${replier} replied to your tweet`,
    metadata: {
      tweetContent: replyContent.substring(0, 50) + (replyContent.length > 50 ? '...' : ''),
      senderName: replier
    }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
