import { useState } from 'react';
import { Tweet as TweetComponent } from './components/Tweet';
import { TweetBox } from './components/TweetBox';
import { SideNav } from './components/SideNav';
import { TrendingSidebar } from './components/TrendingSidebar';
import { ExplorePage } from './components/ExplorePage';
import { ProfilePage } from './components/ProfilePage';
import { PremiumPage } from './components/PremiumPage';
import { CommunitiesPage } from './components/CommunitiesPage';
import LandingPage from './components/LandingPage';
import NotificationsPage from './components/NotificationsPage';
import MessagesPage from './components/MessagesPage';
import type { Tweet, User } from './types';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const currentUser: User = {
  id: '1',
  name: 'John Doe',
  username: 'johndoe',
  avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop',
};

function HomePage({ tweets, onTweet, onLike, onRetweet }: { 
  tweets: Tweet[], 
  onTweet: (content: string) => void,
  onLike: (id: string) => void,
  onRetweet: (id: string) => void 
}) {
  return (
    <div className="min-h-screen border-l border-r border-gray-800">
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">Home</h1>
        </div>
      </header>
      <div className="p-4">
        <TweetBox onTweet={onTweet} />
        <div className="space-y-4 mt-4">
          {tweets.map((tweet) => (
            <TweetComponent
              key={tweet.id}
              tweet={tweet}
              onLike={onLike}
              onRetweet={onRetweet}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tweets, setTweets] = useState<Tweet[]>([
    {
      id: '1',
      content: 'Just setting up my Twitter clone! 🚀',
      author: currentUser,
      likes: 0,
      retweets: 0,
      createdAt: new Date(),
    },
  ]);

  const handleTweet = (content: string) => {
    const newTweet: Tweet = {
      id: String(Date.now()),
      content,
      author: currentUser,
      likes: 0,
      retweets: 0,
      createdAt: new Date(),
    };
    setTweets([newTweet, ...tweets]);
  };

  const handleLike = (id: string) => {
    setTweets(tweets.map(tweet => 
      tweet.id === id ? { ...tweet, likes: tweet.likes + 1 } : tweet
    ));
  };

  const handleRetweet = (id: string) => {
    setTweets(tweets.map(tweet => 
      tweet.id === id ? { ...tweet, retweets: tweet.retweets + 1 } : tweet
    ));
  };

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={
            <div className="flex">
              <div className="w-72 flex-shrink-0">
                <SideNav />
              </div>
              
              <main className="flex-1 mr-96">  
                <Routes>
                  <Route 
                    path="/home" 
                    element={
                      <HomePage 
                        tweets={tweets}
                        onTweet={handleTweet}
                        onLike={handleLike}
                        onRetweet={handleRetweet}
                      />
                    } 
                  />
                  <Route path="/explore" element={<ExplorePage />} />
                  {/* Placeholder routes for other navigation items */}
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/communities" element={<CommunitiesPage />} />
                  <Route path="/premium" element={<PremiumPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </main>

              <div className="w-96 fixed right-0 h-screen">
                <TrendingSidebar />
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;