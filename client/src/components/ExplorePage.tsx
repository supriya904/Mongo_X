import { type FC } from 'react';

export const ExplorePage: FC = () => {
  return (
    <div className="min-h-screen border-l border-r border-gray-800">
      <header className="sticky top-0 z-10 bg-black backdrop-blur-md border-b border-gray-800">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">Explore</h1>
        </div>
      </header>
      
      <div className="p-4">
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h2 className="font-bold text-lg mb-2 text-white">What's happening</h2>
            <div className="space-y-4">
              {/* Placeholder trending topics */}
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-1">
                  <p className="text-sm text-gray-500">Trending in Technology</p>
                  <p className="font-bold text-white">#{`TrendingTopic${item}`}</p>
                  <p className="text-sm text-gray-500">{`${item}0K posts`}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
