import React, { useState, useContext } from 'react';
import { Send, Image, Mic, Smile } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import type { ApiResponse, Tweet } from '../types';

interface TweetBoxProps {
  onTweet?: (tweet: any) => void;
  replyTo?: string;
  placeholder?: string;
}

export function TweetBox({ onTweet, replyTo, placeholder = "What's happening?" }: TweetBoxProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    throw new Error('TweetBox must be used within an AuthProvider');
  }
  
  const { user } = authContext;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    if (!user) {
      setError('Please log in to tweet');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const tweetData = {
        content: content.trim(),
        author: user.username,
        authorName: user.name,
        ...(replyTo && { type: 'reply', replyTo })
      };

      const response = await apiService.createTweet(tweetData) as ApiResponse<{ tweet: Tweet }>;
      
      if (response.success && response.data) {
        setContent('');
        if (onTweet) {
          onTweet(response.data.tweet);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create tweet');
    } finally {
      setIsLoading(false);
    }
  };

  const remainingChars = 280 - content.length;
  const isOverLimit = remainingChars < 0;

  if (!user) {
    return (
      <div className="border-b border-gray-800 p-4">
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <p className="text-gray-400">Please log in to compose tweets</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-gray-800 p-4">
      <div className="flex gap-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-12 h-12 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full resize-none border-none focus:ring-0 text-lg bg-black text-white placeholder-gray-500 focus:outline-none"
            rows={3}
            disabled={isLoading}
          />
          
          {error && (
            <div className="mt-2 text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex space-x-2">
              {/* Media buttons */}
              <button
                type="button"
                className="text-blue-400 hover:bg-blue-400/10 p-2 rounded-full transition-colors"
                disabled={isLoading}
                title="Add photo"
              >
                <Image size={18} />
              </button>
              
              <button
                type="button"
                className="text-blue-400 hover:bg-blue-400/10 p-2 rounded-full transition-colors"
                disabled={isLoading}
                title="Add voice"
              >
                <Mic size={18} />
              </button>
              
              <button
                type="button"
                className="text-blue-400 hover:bg-blue-400/10 p-2 rounded-full transition-colors"
                disabled={isLoading}
                title="Add emoji"
              >
                <Smile size={18} />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`text-sm font-medium ${
                isOverLimit 
                  ? 'text-red-500' 
                  : remainingChars <= 20 
                    ? 'text-yellow-500' 
                    : 'text-gray-500'
              }`}>
                {remainingChars < 0 ? remainingChars : remainingChars <= 20 ? remainingChars : ''}
              </div>
              
              <button
                type="submit"
                disabled={!content.trim() || isOverLimit || isLoading}
                className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send size={16} />
                {isLoading ? 'Posting...' : replyTo ? 'Reply' : 'Tweet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}