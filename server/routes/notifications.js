const express = require('express');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const router = express.Router();

// GET /api/notifications/:username - Get user's notifications
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20, type, unreadOnly = false } = req.query;
    
    const notifications = await Notification.getUserNotifications(
      username,
      parseInt(page),
      parseInt(limit),
      type,
      unreadOnly === 'true'
    );
    
    const unreadCount = await Notification.getUnreadCount(username);
    
    res.json(successResponse('Notifications retrieved successfully', {
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasNext: notifications.length === parseInt(limit),
        hasPrev: page > 1
      }
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json(errorResponse('Failed to fetch notifications', error.message));
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json(errorResponse('Username is required'));
    }
    
    const notification = await Notification.markAsRead(id, username);
    
    if (!notification) {
      return res.status(404).json(errorResponse('Notification not found or unauthorized'));
    }
    
    res.json(successResponse('Notification marked as read', { notification }));
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json(errorResponse('Failed to mark notification as read', error.message));
  }
});

// PUT /api/notifications/:username/read-all - Mark all notifications as read
router.put('/:username/read-all', async (req, res) => {
  try {
    const { username } = req.params;
    const { currentUser } = req.body;
    
    // Check authorization
    if (currentUser !== username) {
      return res.status(403).json(errorResponse('Not authorized to mark notifications as read'));
    }
    
    const count = await Notification.markAllAsRead(username);
    
    res.json(successResponse('All notifications marked as read', { markedCount: count }));
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json(errorResponse('Failed to mark all notifications as read', error.message));
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json(errorResponse('Username is required'));
    }
    
    const notification = await Notification.deleteNotification(id, username);
    
    if (!notification) {
      return res.status(404).json(errorResponse('Notification not found or unauthorized'));
    }
    
    res.json(successResponse('Notification deleted successfully'));
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json(errorResponse('Failed to delete notification', error.message));
  }
});

// GET /api/notifications/:username/unread-count - Get unread notifications count
router.get('/:username/unread-count', async (req, res) => {
  try {
    const { username } = req.params;
    
    const count = await Notification.getUnreadCount(username);
    
    res.json(successResponse('Unread count retrieved successfully', { count }));
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json(errorResponse('Failed to get unread count', error.message));
  }
});

// POST /api/notifications/test - Create test notification (development only)
router.post('/test', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json(errorResponse('Test notifications not allowed in production'));
    }
    
    const { recipient, type, fromUser, fromUserName, tweetId, followId } = req.body;
    
    if (!recipient || !type || !fromUser || !fromUserName) {
      return res.status(400).json(errorResponse('Missing required fields'));
    }
    
    let notification;
    
    switch (type) {
      case 'like':
        notification = await Notification.createLikeNotification(recipient, fromUser, fromUserName, tweetId);
        break;
      case 'retweet':
        notification = await Notification.createRetweetNotification(recipient, fromUser, fromUserName, tweetId);
        break;
      case 'follow':
        notification = await Notification.createFollowNotification(recipient, fromUser, fromUserName);
        break;
      case 'mention':
        notification = await Notification.createMentionNotification(recipient, fromUser, fromUserName, tweetId);
        break;
      case 'reply':
        notification = await Notification.createReplyNotification(recipient, fromUser, fromUserName, tweetId, followId);
        break;
      default:
        return res.status(400).json(errorResponse('Invalid notification type'));
    }
    
    res.status(201).json(successResponse('Test notification created successfully', { notification }));
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json(errorResponse('Failed to create test notification', error.message));
  }
});

module.exports = router;
