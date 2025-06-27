const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Core Message Info
  content: {
    type: String,
    required: true,
    maxlength: 1000, // Direct messages can be longer than tweets
    trim: true
  },
  
  // Participants
  sender: {
    type: String,
    required: true,
    ref: 'User'
  },
  recipient: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  // Conversation Management
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  
  // Message Status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // Message Type
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  
  // Media Attachment (if applicable)
  attachment: {
    url: String,
    type: String, // 'image', 'file'
    name: String,
    size: Number
  },
  
  // Reply Information (for message threads)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  
  // Timestamps
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1 });

// Static Methods
messageSchema.statics.createConversationId = function(user1, user2) {
  // Create consistent conversation ID for two users
  return [user1, user2].sort().join('_');
};

messageSchema.statics.getConversation = async function(user1, user2, page = 1, limit = 50) {
  const conversationId = this.createConversationId(user1, user2);
  const skip = (page - 1) * limit;
  
  try {
    const messages = await this.find({
      conversationId,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('replyTo', 'content sender createdAt')
    .lean();
    
    // Reverse to show oldest first in conversation
    return messages.reverse();
  } catch (error) {
    throw new Error(`Error getting conversation: ${error.message}`);
  }
};

messageSchema.statics.getConversationList = async function(username, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  try {
    // Get latest message for each conversation
    const conversations = await this.aggregate([
      {
        $match: {
          $or: [{ sender: username }, { recipient: username }],
          isDeleted: false
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', username] },
                    { $eq: ['$status', { $ne: 'read' }] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);
    
    // Add participant info
    const conversationsWithParticipants = conversations.map(conv => {
      const participants = conv._id.split('_');
      const otherParticipant = participants.find(p => p !== username);
      
      return {
        conversationId: conv._id,
        participant: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount
      };
    });
    
    return conversationsWithParticipants;
  } catch (error) {
    throw new Error(`Error getting conversation list: ${error.message}`);
  }
};

messageSchema.statics.markAsRead = async function(conversationId, recipient) {
  try {
    const result = await this.updateMany(
      {
        conversationId,
        recipient,
        status: { $ne: 'read' }
      },
      {
        $set: {
          status: 'read',
          readAt: new Date()
        }
      }
    );
    
    return result.modifiedCount;
  } catch (error) {
    throw new Error(`Error marking messages as read: ${error.message}`);
  }
};

messageSchema.statics.getUnreadCount = async function(username) {
  try {
    const count = await this.countDocuments({
      recipient: username,
      status: { $ne: 'read' },
      isDeleted: false
    });
    
    return count;
  } catch (error) {
    throw new Error(`Error getting unread count: ${error.message}`);
  }
};

messageSchema.statics.deleteMessage = async function(messageId, username) {
  try {
    const message = await this.findOne({
      _id: messageId,
      $or: [{ sender: username }, { recipient: username }]
    });
    
    if (!message) {
      throw new Error('Message not found or unauthorized');
    }
    
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();
    
    return message;
  } catch (error) {
    throw new Error(`Error deleting message: ${error.message}`);
  }
};

messageSchema.statics.searchMessages = async function(username, query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  try {
    const messages = await this.find({
      $and: [
        {
          $or: [{ sender: username }, { recipient: username }]
        },
        {
          content: { $regex: query, $options: 'i' }
        },
        {
          isDeleted: false
        }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    return messages;
  } catch (error) {
    throw new Error(`Error searching messages: ${error.message}`);
  }
};

// Instance Methods
messageSchema.methods.markAsDelivered = function() {
  if (this.status === 'sent') {
    this.status = 'delivered';
    return this.save();
  }
  return Promise.resolve(this);
};

messageSchema.methods.markAsRead = function() {
  if (this.status !== 'read') {
    this.status = 'read';
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Pre-save middleware
messageSchema.pre('save', function(next) {
  // Set conversation ID if not set
  if (!this.conversationId) {
    this.conversationId = this.constructor.createConversationId(this.sender, this.recipient);
  }
  
  // Validate that sender and recipient are different
  if (this.sender === this.recipient) {
    return next(new Error('Sender and recipient cannot be the same'));
  }
  
  next();
});

// Virtual for formatted date
messageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Ensure virtual fields are serialized
messageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Message', messageSchema);
