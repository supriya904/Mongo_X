const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    dateOfBirth?: string;
    bio?: string;
    location?: string;
  }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { username: string; password: string }) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Tweet endpoints
  async getTweets(page = 1, limit = 20, type = 'all', username?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      type,
      ...(username && { username }),
    });
    return this.request(`/tweets?${params}`);
  }

  async getTweet(id: string) {
    return this.request(`/tweets/${id}`);
  }

  async createTweet(tweetData: {
    content: string;
    author: string;
    authorName: string;
    type?: string;
    originalTweet?: string;
    replyTo?: string;
  }) {
    return this.request('/tweets', {
      method: 'POST',
      body: JSON.stringify(tweetData),
    });
  }

  async likeTweet(tweetId: string, username: string, displayName?: string) {
    return this.request(`/tweets/${tweetId}/like`, {
      method: 'POST',
      body: JSON.stringify({ username, displayName }),
    });
  }

  async retweetTweet(tweetId: string, username: string, displayName?: string) {
    return this.request(`/tweets/${tweetId}/retweet`, {
      method: 'POST',
      body: JSON.stringify({ username, displayName }),
    });
  }

  async replyToTweet(tweetId: string, replyData: {
    content: string;
    author: string;
    authorName: string;
  }) {
    return this.request(`/tweets/${tweetId}/reply`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
  }

  async deleteTweet(tweetId: string, username: string) {
    return this.request(`/tweets/${tweetId}`, {
      method: 'DELETE',
      body: JSON.stringify({ username }),
    });
  }

  async getUserTweets(username: string, page = 1, limit = 20, type = 'all') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      type,
    });
    return this.request(`/tweets/user/${username}?${params}`);
  }

  async searchTweets(query: string, page = 1, limit = 20, type = 'all') {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      type,
    });
    return this.request(`/tweets/search?${params}`);
  }

  // User endpoints
  async getUsers(page = 1, limit = 20, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    return this.request(`/users?${params}`);
  }

  async getUserProfile(username: string) {
    return this.request(`/users/${username}`);
  }

  async updateUserProfile(username: string, profileData: {
    name?: string;
    bio?: string;
    location?: string;
    currentUser: string;
  }) {
    return this.request(`/users/${username}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserTimeline(username: string, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/users/${username}/timeline?${params}`);
  }

  async searchUsers(query: string, page = 1, limit = 20) {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/users/search?${params}`);
  }

  async getUserStats(username: string) {
    return this.request(`/users/${username}/stats`);
  }

  // Follow endpoints
  async followUser(username: string, follower: string, followerName: string) {
    return this.request(`/follows/${username}`, {
      method: 'POST',
      body: JSON.stringify({ follower, followerName }),
    });
  }

  async unfollowUser(username: string, follower: string) {
    return this.request(`/follows/${username}`, {
      method: 'DELETE',
      body: JSON.stringify({ follower }),
    });
  }

  async getFollowers(username: string, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/follows/${username}/followers?${params}`);
  }

  async getFollowing(username: string, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/follows/${username}/following?${params}`);
  }

  async getFollowStatus(username: string, follower: string) {
    const params = new URLSearchParams({ follower });
    return this.request(`/follows/${username}/status?${params}`);
  }

  async getFollowSuggestions(username: string, limit = 10) {
    const params = new URLSearchParams({ limit: limit.toString() });
    return this.request(`/follows/${username}/suggestions?${params}`);
  }

  // Notification endpoints
  async getNotifications(username: string, page = 1, limit = 20, type?: string, unreadOnly = false) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString(),
      ...(type && { type }),
    });
    return this.request(`/notifications/${username}?${params}`);
  }

  async markNotificationAsRead(notificationId: string, username: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
      body: JSON.stringify({ username }),
    });
  }

  async markAllNotificationsAsRead(username: string, currentUser: string) {
    return this.request(`/notifications/${username}/read-all`, {
      method: 'PUT',
      body: JSON.stringify({ currentUser }),
    });
  }

  async deleteNotification(notificationId: string, username: string) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
      body: JSON.stringify({ username }),
    });
  }

  async getUnreadNotificationsCount(username: string) {
    return this.request(`/notifications/${username}/unread-count`);
  }

  // Trending endpoints
  async getTrendingHashtags(limit = 10, category?: string, location?: any) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(category && { category }),
      ...(location && { location: JSON.stringify(location) }),
    });
    return this.request(`/trending?${params}`);
  }

  async getHashtagStats(hashtag: string) {
    return this.request(`/trending/${hashtag}`);
  }

  async getTrendsByCategory() {
    return this.request('/trending/categories/all');
  }

  async searchTrending(query: string, limit = 10) {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    return this.request(`/trending/search/${query}?${params}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  async testConnection() {
    return this.request('/test');
  }
}

export const apiService = new ApiService();
export default apiService;
