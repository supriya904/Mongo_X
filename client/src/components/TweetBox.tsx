import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface TweetBoxProps {
  onTweet: (content: string) => void;
}

export function TweetBox({ onTweet }: TweetBoxProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onTweet(content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-b border-gray-800 p-4">
      <div className="flex gap-4">
        <img
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"
          alt="User avatar"
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full resize-none border-none focus:ring-0 text-lg bg-black text-white placeholder-gray-500"
            rows={3}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-500">
              {280 - content.length} characters remaining
            </div>
            <button
              type="submit"
              disabled={!content.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={18} />
              Tweet
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}