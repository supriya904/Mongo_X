import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/apiService';

// User interface for authenticated user
interface AuthUser {
  _id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  createdAt: string;
}

// Auth context interface
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    dateOfBirth?: string;
    bio?: string;
    location?: string;
  }) => Promise<boolean>;
  updateUser: (userData: Partial<AuthUser>) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the context
export { AuthContext };

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('userData');
      const currentUser = localStorage.getItem('currentUser');
      
      if (storedUser && currentUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('userData');
          localStorage.removeItem('currentUser');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login({ username, password });
      
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        localStorage.setItem('currentUser', username);
        localStorage.setItem('userData', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Register function
  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    dateOfBirth?: string;
    bio?: string;
    location?: string;
  }): Promise<boolean> => {
    try {
      const response = await apiService.register(userData);
      
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
  };

  // Update user function
  const updateUser = (userData: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    register,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export types for use in other components
export type { AuthUser, AuthContextType };
