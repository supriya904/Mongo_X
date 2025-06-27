import { useState, useEffect } from 'react';
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
import type { Tweet } from './types';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { apiService } from './services/apiService';

function HomePage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch tweets from API
  const fetchTweets = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTweets() as any;
      if (response.success && response.data) {
        setTweets(response.data);
      } else {
        setError('Failed to fetch tweets');
      }
    } catch (err) {
      console.error('Error fetching tweets:', err);
      setError('Failed to fetch tweets');
    } finally {
      setIsLoading(false);
    }
  };

  // Load tweets on component mount
  useEffect(() => {
    fetchTweets();
  }, []);

  // Handle new tweet creation
  const handleNewTweet = (tweet: Tweet) => {
    setTweets(prevTweets => [tweet, ...prevTweets]);
  };

  return (
    <div className="min-h-screen border-l border-r border-gray-800">
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">Home</h1>
        </div>
      </header>
      <div className="p-4">
        <TweetBox onTweet={handleNewTweet} />
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="text-center py-8 text-gray-500">
              Loading tweets...
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          )}
          {!isLoading && !error && tweets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No tweets yet. Be the first to tweet!
            </div>
          )}
          {tweets.map((tweet) => (
            <TweetComponent
              key={tweet._id}
              tweet={tweet}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
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
                      element={<HomePage />} 
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
    </AuthProvider>
  );
}

export default App;