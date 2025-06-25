import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Bell,
  Mail,
  Users,
  Star,
  User,
  LogOut,
  Twitter
} from 'lucide-react';

export const SideNav = () => {
  const navigate = useNavigate();
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Mail, label: 'Messages', path: '/messages' },
    { icon: Users, label: 'Communities', path: '/communities' },
    { icon: Star, label: 'Premium', path: '/premium' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const handleLogout = () => {
    // In a real app, you would clear auth tokens, user session, etc.
    // For now, we'll just redirect to the landing page
    navigate('/');
  };

  return (
    <div className="fixed h-screen p-4 flex flex-col gap-4">
      <Link to="/home" className="p-2 hover:bg-gray-800 rounded-full w-fit">
        <Twitter className="h-8 w-8 text-blue-500" />
      </Link>
      
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-full w-fit text-white"
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xl">{item.label}</span>
          </Link>
        ))}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-full w-fit text-red-500"
        >
          <LogOut className="h-6 w-6" />
          <span className="text-xl">Logout</span>
        </button>
      </nav>

      <button className="bg-blue-500 text-white rounded-full py-3 px-6 text-xl font-bold mt-4 hover:bg-blue-600">
        Post
      </button>
    </div>
  );
};
