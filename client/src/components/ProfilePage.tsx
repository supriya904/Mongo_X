import { type FC, useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { User } from '../types';
import { Calendar, Mail, MapPin, Link as LinkIcon } from 'lucide-react';

export const ProfilePage: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tweets, setTweets] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [followers, setFollowers] = useState<number>(0);

  useEffect(() => {
    // Get current user data
    const currentAuthUser = userService.getCurrentUser();
    if (currentAuthUser) {
      setUser(userService.convertToUser(currentAuthUser));
      
      // Mock data for profile stats
      setTweets(Math.floor(Math.random() * 100));
      setFollowing(Math.floor(Math.random() * 500));
      setFollowers(Math.floor(Math.random() * 1000));
    }
  }, []);

  if (!user) {
    return <div className="p-4">Loading profile...</div>;
  }

  // Format date of birth if available
  const formattedDOB = user.dateOfBirth 
    ? `${user.dateOfBirth.month} ${user.dateOfBirth.day}, ${user.dateOfBirth.year}` 
    : null;

  return (
    <div className="min-h-screen border-l border-r border-gray-200">
      {/* Header with back button */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-3 flex items-center">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </header>

      {/* Profile header */}
      <div className="relative">
        {/* Cover photo */}
        <div className="h-48 bg-blue-500"></div>
        
        {/* Profile picture */}
        <div className="absolute left-4 -bottom-16">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-32 h-32 rounded-full border-4 border-white"
          />
        </div>

        {/* Edit profile button */}
        <div className="flex justify-end p-4">
          <button className="px-4 py-2 border border-gray-300 rounded-full font-bold hover:bg-gray-100">
            Edit profile
          </button>
        </div>
      </div>

      {/* Profile info */}
      <div className="mt-16 px-4 py-2">
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-gray-500">@{user.username}</p>
        
        <div className="mt-3 space-y-2">
          {user.email && (
            <div className="flex items-center gap-2 text-gray-500">
              <Mail size={18} />
              <span>{user.email}</span>
            </div>
          )}
          
          {formattedDOB && (
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar size={18} />
              <span>Born {formattedDOB}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-500">
            <MapPin size={18} />
            <span>Earth</span>
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            <LinkIcon size={18} />
            <a href="#" className="text-blue-500">twitter.com</a>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-1">
            <span className="font-bold">{following}</span>
            <span className="text-gray-500">Following</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold">{followers}</span>
            <span className="text-gray-500">Followers</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mt-4">
        <div className="flex">
          <button className="flex-1 py-4 font-bold border-b-2 border-blue-500">Tweets</button>
          <button className="flex-1 py-4 text-gray-500 hover:bg-gray-50">Replies</button>
          <button className="flex-1 py-4 text-gray-500 hover:bg-gray-50">Media</button>
          <button className="flex-1 py-4 text-gray-500 hover:bg-gray-50">Likes</button>
        </div>
      </div>

      {/* Tweets section */}
      <div className="p-4">
        {tweets > 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>This user has {tweets} tweets</p>
            <p className="mt-2">Tweet functionality coming soon!</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <h3 className="text-2xl font-bold mb-2">No tweets yet</h3>
            <p>When this user posts tweets, they'll show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
