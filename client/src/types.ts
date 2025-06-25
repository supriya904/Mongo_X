export interface Tweet {
  id: string;
  content: string;
  author: User;
  likes: number;
  retweets: number;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  email?: string;
  dateOfBirth?: {
    month: string;
    day: string;
    year: string;
  };
}

export interface AuthUser {
  username: string;
  password: string;
  name?: string;
  email?: string;
  dateOfBirth?: {
    month: string;
    day: string;
    year: string;
  };
}