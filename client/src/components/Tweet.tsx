import { Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Tweet as TweetType } from '../types';

export function Tweet({ tweet }: { tweet: TweetType }) {
  const handleLike = () => {
    // TODO: Implement like functionality
    console.log('Like tweet:', tweet._id);
  };

  const handleRetweet = () => {
    // TODO: Implement retweet functionality
    console.log('Retweet tweet:', tweet._id);
  };

  const handleReply = () => {
    // TODO: Implement reply functionality
    console.log('Reply to tweet:', tweet._id);
  };

  return (
    <div className="border-b border-gray-800 p-4 hover:bg-gray-900">
      <div className="flex gap-4">
        <img
          src={tweet.authorAvatar}
          alt={tweet.authorName}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{tweet.authorName}</span>
            <span className="text-gray-500">@{tweet.author}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {formatDistanceToNow(new Date(tweet.createdAt))} ago
            </span>
          </div>
          <p className="mt-2 text-white">{tweet.content}</p>
          <div className="flex gap-12 mt-4">
            <button 
              onClick={handleReply}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={18} />
              <span>{tweet.repliesCount}</span>
            </button>
            <button 
              onClick={handleRetweet}
              className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors"
            >
              <Repeat2 size={18} />
              <span>{tweet.retweetsCount}</span>
            </button>
            <button 
              onClick={handleLike}
              className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart size={18} />
              <span>{tweet.likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}