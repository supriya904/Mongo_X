export interface Tweet {
  _id: string;
  content: string;
  author: string;
  authorName: string;
  authorAvatar: string;
  
  // Engagement
  likes: string[];
  retweets: string[];
  replies: string[];
  
  // Counts
  likesCount: number;
  retweetsCount: number;
  repliesCount: number;
  viewsCount: number;
  
  // Tweet Type
  type: 'original' | 'retweet' | 'reply';
  originalTweet?: Tweet;
  replyTo?: Tweet;
  
  // Content Analysis
  hashtags: string[];
  mentions: string[];
  
  // Visibility
  isPublic: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  bio?: string;
  location?: string;
  website?: string;
  dateOfBirth?: string;
  avatar: string;
  coverPhoto?: string;
  verified: boolean;
  
  // Counts
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  likesCount: number;
  
  // Settings
  isPrivate: boolean;
  allowMessages: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface Follow {
  _id: string;
  follower: string;
  following: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: string;
  type: 'like' | 'retweet' | 'follow' | 'mention' | 'reply';
  tweetId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  _id: string;
  content: string;
  sender: string;
  recipient: string;
  conversationId: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  attachment?: {
    url: string;
    type: string;
    name: string;
    size: number;
  };
  replyTo?: string;
  isDeleted: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trending {
  _id: string;
  hashtag: string;
  displayHashtag: string;
  tweetCount: number;
  counts: {
    last1Hour: number;
    last6Hours: number;
    last24Hours: number;
    last7Days: number;
  };
  trendingScore: number;
  peakCount: number;
  peakDate?: string;
  category: 'general' | 'sports' | 'politics' | 'entertainment' | 'technology' | 'news';
  isActive: boolean;
  firstSeenAt: string;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  username: string;
  password: string;
  name?: string;
  email?: string;
  dateOfBirth?: string;
  bio?: string;
  location?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TimelineData {
  tweets: Tweet[];
  pagination: PaginationInfo;
}

export interface UserSearchData {
  users: User[];
  pagination: PaginationInfo;
}

export interface NotificationData {
  notifications: Notification[];
  unreadCount: number;
  pagination: PaginationInfo;
}

export interface TrendingData {
  hashtags: Trending[];
}

export interface FollowData {
  followers?: User[];
  following?: User[];
  followersCount: number;
  followingCount: number;
  pagination?: PaginationInfo;
}