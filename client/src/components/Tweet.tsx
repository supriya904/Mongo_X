import { Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Tweet as TweetType } from '../types';

interface TweetProps {
  tweet: TweetType;
  onLike: (id: string) => void;
  onRetweet: (id: string) => void;
}

export function Tweet({ tweet, onLike, onRetweet }: TweetProps) {
  return (
    <div className="border-b border-gray-800 p-4 hover:bg-gray-900">
      <div className="flex gap-4">
        <img
          src={tweet.author.avatar}
          alt={tweet.author.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{tweet.author.name}</span>
            <span className="text-gray-500">@{tweet.author.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {formatDistanceToNow(tweet.createdAt)} ago
            </span>
          </div>
          <p className="mt-2 text-white">{tweet.content}</p>
          <div className="flex gap-12 mt-4">
            <button
              onClick={() => onLike(tweet.id)}
              className="flex items-center gap-2 text-gray-500 hover:text-red-500"
            >
              <Heart size={18} />
              <span>{tweet.likes}</span>
            </button>
            <button
              onClick={() => onRetweet(tweet.id)}
              className="flex items-center gap-2 text-gray-500 hover:text-green-500"
            >
              <Repeat2 size={18} />
              <span>{tweet.retweets}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500">
              <MessageCircle size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}