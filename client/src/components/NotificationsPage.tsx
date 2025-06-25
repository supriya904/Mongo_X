import { useState } from 'react';
import type { User } from '../types';

interface Notification {
  id: string;
  type: 'like' | 'retweet' | 'follow' | 'mention' | 'reply';
  user: User;
  content?: string;
  timestamp: Date;
  read: boolean;
}

const NotificationsPage = () => {
  // Sample notification data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'like',
      user: {
        id: '2',
        name: 'Jane Smith',
        username: 'janesmith',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      },
      content: 'Just setting up my Twitter clone! 🚀',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
    },
    {
      id: '2',
      type: 'retweet',
      user: {
        id: '3',
        name: 'Alex Johnson',
        username: 'alexj',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
      },
      content: 'Just setting up my Twitter clone! 🚀',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
    },
    {
      id: '3',
      type: 'follow',
      user: {
        id: '4',
        name: 'Sarah Williams',
        username: 'sarahw',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
    },
    {
      id: '4',
      type: 'mention',
      user: {
        id: '5',
        name: 'Mike Brown',
        username: 'mikeb',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      },
      content: 'Hey @johndoe, check out this new feature!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
    },
    {
      id: '5',
      type: 'reply',
      user: {
        id: '6',
        name: 'Emily Davis',
        username: 'emilyd',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      },
      content: 'I totally agree with your post!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'mentions'>('all');

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return (
          <div className="p-2 bg-red-900 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'retweet':
        return (
          <div className="p-2 bg-green-900 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12.293 16.707a1 1 0 010-1.414L14.586 13H9a7 7 0 01-7-7V4a1 1 0 112 0v2a5 5 0 005 5h5.586l-2.293-2.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="p-2 bg-blue-900 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        );
      case 'mention':
      case 'reply':
        return (
          <div className="p-2 bg-purple-900 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return <span><span className="font-bold">{notification.user.name}</span> liked your Tweet</span>;
      case 'retweet':
        return <span><span className="font-bold">{notification.user.name}</span> retweeted your Tweet</span>;
      case 'follow':
        return <span><span className="font-bold">{notification.user.name}</span> followed you</span>;
      case 'mention':
        return <span><span className="font-bold">{notification.user.name}</span> mentioned you</span>;
      case 'reply':
        return <span><span className="font-bold">{notification.user.name}</span> replied to your Tweet</span>;
      default:
        return null;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }
    
    return date.toLocaleDateString();
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === 'mention');

  return (
    <div className="min-h-screen border-l border-r border-gray-800">
      <header className="sticky top-0 z-10 bg-black backdrop-blur-md border-b border-gray-800">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">Notifications</h1>
        </div>
        <div className="flex border-b border-gray-800">
          <button 
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'all' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'mentions' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('mentions')}
          >
            Mentions
          </button>
        </div>
      </header>

      <div className="flex justify-end p-3 border-b border-gray-800">
        <button 
          onClick={markAllAsRead}
          className="text-blue-500 text-sm font-medium hover:text-blue-600"
        >
          Mark all as read
        </button>
      </div>

      <div className="divide-y divide-gray-800">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 flex items-start space-x-3 ${!notification.read ? 'bg-gray-900' : ''}`}
            >
              {getNotificationIcon(notification.type)}
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={notification.user.avatar} 
                      alt={notification.user.name} 
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="text-white">
                      {getNotificationText(notification)}
                      {notification.content && (
                        <p className="text-gray-400 mt-1">"{notification.content}"</p>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-400">
            No notifications found
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
