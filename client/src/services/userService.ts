import usersData from '../data/users.json';
import { AuthUser, User } from '../types';

// Mock current user - in a real app, this would come from authentication
let currentLoggedInUser: string = 'SupriyaVodnala'; // Default user

export const userService = {
  // Get all users
  getAllUsers: (): AuthUser[] => {
    return usersData.users;
  },

  // Get current logged in user
  getCurrentUser: (): AuthUser | undefined => {
    return usersData.users.find(user => user.username === currentLoggedInUser);
  },

  // Set current logged in user
  setCurrentUser: (username: string): void => {
    currentLoggedInUser = username;
  },

  // Convert AuthUser to User (for display in tweets, etc.)
  convertToUser: (authUser: AuthUser): User => {
    return {
      id: authUser.username, // Using username as ID for simplicity
      name: authUser.name || authUser.username,
      username: authUser.username,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.name || authUser.username)}&background=random`,
      email: authUser.email,
      dateOfBirth: authUser.dateOfBirth
    };
  },

  // Login function (mock)
  login: (username: string, password: string): boolean => {
    const user = usersData.users.find(
      user => user.username === username && user.password === password
    );
    
    if (user) {
      currentLoggedInUser = username;
      return true;
    }
    return false;
  }
};
