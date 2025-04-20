import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
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
}

const Navbar: React.FC<NavbarProps> = ({
  brandName = 'Hunter AI',
  userName = 'User',
  userAvatar = 'https://randomuser.me/api/portraits/men/1.jpg',
  onSearch,
  showSearch = true,
  showNotifications = true,
  initialNotifications = [],
}) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
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
    <nav className="fixed top-0 left-0 right-0 bg-[var(--background)]/80 backdrop-blur-lg shadow-lg z-50 border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold gradient-text">{brandName}</h1>
          <div className="flex items-center space-x-3">
            {showSearch && (
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search jobs or candidates..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 rounded-lg bg-[var(--card-background)] text-[var(--text-primary)] border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] placeholder-gray-400"
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
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors relative"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-6 w-6 text-[var(--text-primary)]" />
                  {initialNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 h-5 w-5 bg-[var(--accent-primary)] rounded-full text-xs text-white flex items-center justify-center">
                      {initialNotifications.length}
                    </span>
                  )}
                </motion.button>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-80 bg-[var(--card-background)] shadow-lg rounded-lg py-2 border border-gray-700/50 max-h-96 overflow-y-auto"
                  >
                    <h3 className="px-4 py-2 text-sm font-semibold text-[var(--text-primary)] border-b border-gray-700">
                      Notifications
                    </h3>
                    {initialNotifications.length === 0 ? (
                      <p className="px-4 py-2 text-sm text-[var(--text-secondary)]">No new notifications</p>
                    ) : (
                      initialNotifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => {
                            navigate(notification.link);
                            setIsNotificationsOpen(false);
                          }}
                          className="block w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-sm text-[var(--text-primary)]">{notification.message}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{notification.time}</p>
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
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="User profile menu"
              >
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="h-8 w-8 rounded-full border-2 border-[var(--accent-primary)]"
                />
                <span className="hidden md:inline text-[var(--text-primary)]">{userName}</span>
                <ArrowDownIcon className="h-4 w-4 text-[var(--text-primary)]" />
              </motion.button>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-[var(--card-background)] shadow-lg rounded-lg py-2 border border-gray-700/50"
                >
                  <button
                    onClick={() => navigate('/admin/create-job')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-[var(--text-primary)]"
                  >
                    Create New Job
                  </button>
                  <button
                    onClick={() => navigate('/admin/jobs')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-[var(--text-primary)]"
                  >
                    Jobs
                  </button>
                  <button
                    onClick={() => navigate('/admin/candidates')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-[var(--text-primary)]"
                  >
                    Candidates
                  </button>
                  <button
                    onClick={() => navigate('/admin/reports')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-[var(--text-primary)]"
                  >
                    Reports
                  </button>
                  <button
                    onClick={() => navigate('/admin/settings')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-[var(--text-primary)]"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      navigate('/login');
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-[var(--error)]"
                  >
                    Logout
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