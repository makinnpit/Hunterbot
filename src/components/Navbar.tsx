import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  BellIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface NavbarProps {
  brandName?: string;
  userName?: string;
  userAvatar?: string;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  initialNotifications?: { id: number; message: string; time: string; link: string }[];
  theme?: 'light' | 'dark'; // Add theme prop
}

const Navbar: React.FC<NavbarProps> = ({
  brandName = 'Hunter AI',
  userName = 'User',
  userAvatar = 'https://randomuser.me/api/portraits/men/1.jpg',
  onSearch,
  showSearch = true,
  showNotifications = true,
  initialNotifications = [],
  theme = 'dark', // Default to dark theme
}) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-gray-100/80'} backdrop-blur-lg shadow-lg z-50 border-b ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Make Hunter AI text clickable and navigate to /admin/home */}
          <Link to="/admin/home">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
              {brandName}
            </h1>
          </Link>
          <div className="flex items-center space-x-3">
            {showSearch && (
              <div className="relative">
                <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                <input
                  type="text"
                  placeholder="Search jobs or candidates..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={`pl-10 pr-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600/50 placeholder-gray-400' : 'bg-gray-200 text-gray-900 border-gray-300/50 placeholder-gray-500'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label="Search jobs or candidates"
                />
              </div>
            )}
            {showNotifications && (
              <div className="relative">
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants}
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} transition-colors relative`}
                  aria-label="Notifications"
                >
                  <BellIcon className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
                  {initialNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 h-5 w-5 bg-blue-500 rounded-full text-xs text-white flex items-center justify-center">
                      {initialNotifications.length}
                    </span>
                  )}
                </motion.button>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute right-0 mt-2 w-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} shadow-lg rounded-lg py-2 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'} max-h-96 overflow-y-auto`}
                  >
                    <h3 className={`px-4 py-2 text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      Notifications
                    </h3>
                    {initialNotifications.length === 0 ? (
                      <p className={`px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No new notifications</p>
                    ) : (
                      initialNotifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => {
                            navigate(notification.link);
                            setIsNotificationsOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-3 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                        >
                          <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{notification.message}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{notification.time}</p>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </div>
            )}
            <div className="relative">
              <motion.button
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center space-x-2 p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                aria-label="User profile menu"
              >
                <img
                  src={userAvatar}
                  alt="Profile"
                  className={`h-8 w-8 rounded-full border-2 ${theme === 'dark' ? 'border-blue-500' : 'border-blue-400'}`}
                />
                <span className={`hidden md:inline ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{userName}</span>
                <ArrowDownIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </motion.button>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute right-0 mt-2 w-48 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} shadow-lg rounded-lg py-2 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}`}
                >
                  <button
                    onClick={() => navigate('/admin/create-job')}
                    className={`block w-full text-left px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-900'} transition-colors`}
                  >
                    Create New Job
                  </button>
                  <button
                    onClick={() => navigate('/admin/jobs')}
                    className={`block w-full text-left px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-900'} transition-colors`}
                  >
                    Jobs
                  </button>
                  <button
                    onClick={() => navigate('/admin/candidates')}
                    className={`block w-full text-left px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-900'} transition-colors`}
                  >
                    Candidates
                  </button>
                  <button
                    onClick={() => navigate('/admin/reports')}
                    className={`block w-full text-left px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-900'} transition-colors`}
                  >
                    Reports
                  </button>
                  <button
                    onClick={() => navigate('/admin/settings')}
                    className={`block w-full text-left px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-900'} transition-colors`}
                  >
                    Settings
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;