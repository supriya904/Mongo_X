import { Search, MoreHorizontal } from 'lucide-react';

export const TrendingSidebar = () => {
  const trends = [
    {
      category: 'Trending in India',
      title: '#GetOutRaGa',
      posts: '103K posts'
    },
    {
      category: 'Entertainment · Trending',
      title: 'Khloé in Wonder Land',
      posts: '52K posts'
    },
    {
      category: 'Trending',
      title: '#TVKForTN',
      posts: '83K posts'
    },
    {
      category: 'Politics · Trending',
      title: '#Divorce',
      posts: '1,043 posts'
    }
  ];

  return (
    <div className="py-1 px-6">
      {/* Search Bar */}
      <div className="sticky top-0 bg-black pt-2 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-900 text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-800"
          />
        </div>
      </div>

      {/* Subscribe Card */}
      <div className="bg-gray-900 rounded-2xl p-4 my-4">
        <h2 className="font-bold text-xl mb-2 text-white">Subscribe to Premium</h2>
        <p className="text-sm text-gray-400 mb-3">
          Subscribe to unlock new features and if eligible, receive a share of revenue.
        </p>
        <button className="bg-blue-500 text-white rounded-full px-4 py-2 font-bold hover:bg-blue-600">
          Subscribe
        </button>
      </div>

      {/* What's happening section */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden">
        <h2 className="font-bold text-xl p-4 text-white">What's happening</h2>
        {trends.map((trend, index) => (
          <div
            key={index}
            className="px-4 py-3 hover:bg-gray-800 transition-colors cursor-pointer flex justify-between items-start border-t border-gray-800 first:border-none"
          >
            <div>
              <p className="text-sm text-gray-500">{trend.category}</p>
              <p className="font-bold mt-0.5 text-white">{trend.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{trend.posts}</p>
            </div>
            <button className="hover:bg-gray-700 hover:text-blue-400 rounded-full p-1.5 transition-colors text-gray-400">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
