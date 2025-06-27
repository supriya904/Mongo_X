const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Service for backend integration
export class ApiService {
  // Helper method to make HTTP requests
  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      headers: { ...defaultHeaders, ...options.headers },
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
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User Authentication
  async register(userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    dateOfBirth?: string;
    bio?: string;
    location?: string;
  }) {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { username: string; password: string }) {
    return this.makeRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // User Operations
  async getUser(username: string) {
    return this.makeRequest(`/users/${username}`);
  }

  async getAllUsers() {
    return this.makeRequest('/users');
  }

  async updateUser(username: string, userData: {
    name?: string;
    bio?: string;
    location?: string;
  }) {
    return this.makeRequest(`/users/${username}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Tweet Operations
  async getTweets() {
    return this.makeRequest('/tweets');
  }

  async createTweet(tweetData: {
    content: string;
    author: string;
    authorName: string;
  }) {
    return this.makeRequest('/tweets', {
      method: 'POST',
      body: JSON.stringify(tweetData),
    });
  }

  async getTweet(id: string) {
    return this.makeRequest(`/tweets/${id}`);
  }

  async likeTweet(id: string) {
    return this.makeRequest(`/tweets/${id}/like`, {
      method: 'PUT',
    });
  }

  async retweetTweet(id: string) {
    return this.makeRequest(`/tweets/${id}/retweet`, {
      method: 'PUT',
    });
  }

  async deleteTweet(id: string) {
    return this.makeRequest(`/tweets/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }

  async testConnection() {
    return this.makeRequest('/test');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export default for easier importing
export default apiService;
