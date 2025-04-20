import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin123',
};

interface LoginProps {
  brandName?: string;
}

const Login: React.FC<LoginProps> = ({ brandName = 'Hunter AI' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      setLoading(false);
      return;
    }

    try {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('token', 'admin-token');
        localStorage.setItem('user', JSON.stringify(ADMIN_CREDENTIALS));
        setNotificationMessage('Login successful! Redirecting to admin dashboard...');
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
          navigate('/admin/home');
        }, 2000);
      } else {
        await login(email, password);
        setNotificationMessage('Login successful! Redirecting to onboarding...');
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
          navigate('/applicant/onboarding');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.2, ease: 'easeInOut' },
    }),
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0 6px 16px rgba(30, 58, 138, 0.4)' }, // Updated to navy blue shadow
    tap: { scale: 0.95 },
    pulse: {
      scale: [1, 1.02, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const errorVariants = {
    hidden: { opacity: 0, x: 0 },
    visible: {
      opacity: 1,
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.5 },
    },
  };

  const iconVariants = {
    hover: { scale: 1.1, rotate: 10, transition: { duration: 0.2 } },
    tap: { scale: 0.9 },
  };

  const notificationVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 relative overflow-hidden">
      {/* Enhanced Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-start)]/20 to-[var(--gradient-end)]/20 pointer-events-none animate-gradient-shift" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.15)_0%,transparent_70%)] pointer-events-none animate-pulse-slow" />

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            variants={notificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-4 right-4 z-50 bg-[var(--card-background)]/90 backdrop-blur-lg rounded-lg shadow-lg p-4 flex items-center space-x-3 border border-[var(--glass-border)] max-w-sm"
          >
            <CheckCircleIcon className="h-6 w-6 text-[var(--success)]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">{notificationMessage}</p>
              <div className="mt-1 h-1 bg-[var(--success)]/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--success)]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'linear' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-[var(--card-background)]/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-200/30"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold gradient-text text-center mb-3">
          {brandName}
        </h1>
        <p className="text-[var(--text-secondary)] text-center text-base mb-8">
          Your AI Interview Companion
        </p>

        {error && (
          <motion.div
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            className="bg-[var(--error)]/20 text-[var(--error)] rounded-lg p-3 mb-6 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={inputVariants} custom={0}>
            <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Email Address
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <EnvelopeIcon className="h-5 w-5 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-100/50 dark:bg-gray-800/50 text-[var(--text-primary)] rounded-lg border border-gray-300/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-transparent placeholder-gray-400 transition-all duration-300 group-hover:shadow-md group-hover:shadow-[var(--accent-primary)]/20"
                placeholder="Enter your email"
              />
            </div>
          </motion.div>

          <motion.div variants={inputVariants} custom={1}>
            <label htmlFor="password" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Password
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <LockClosedIcon className="h-5 w-5 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-4 bg-gray-100/50 dark:bg-gray-800/50 text-[var(--text-primary)] rounded-lg border border-gray-300/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-transparent placeholder-gray-400 transition-all duration-300 group-hover:shadow-md group-hover:shadow-[var(--accent-primary)]/20"
                placeholder="Enter your password"
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                variants={iconVariants}
                whileHover="hover"
                whileTap="tap"
                className="absolute inset-y-0 right-0 flex items-center pr-4"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors" />
                )}
              </motion.button>
            </div>
          </motion.div>

          <motion.div variants={inputVariants} custom={2}>
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-4 rounded-lg text-white font-semibold bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] transition-all duration-300 ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-[var(--accent-primary)]/40'
              }`}
              {...(loading
                ? {}
                : { whileHover: 'hover', whileTap: 'tap', whileFocus: 'pulse', variants: buttonVariants })}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Logging in...
                </div>
              ) : (
                'Log In'
              )}
            </motion.button>
          </motion.div>

          <motion.div
            variants={inputVariants}
            custom={3}
            className="flex flex-col sm:flex-row gap-3 mt-4"
          >
            <motion.button
              type="button"
              onClick={() => navigate('/register')}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="flex-1 py-3 px-4 bg-transparent text-[var(--text-primary)] border border-gray-300/50 dark:border-gray-600/50 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300 text-sm font-medium hover:shadow-md hover:shadow-gray-400/20 dark:hover:shadow-gray-600/20"
            >
              Register
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate('/forgot-password')}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="flex-1 py-3 px-4 bg-transparent text-[var(--text-primary)] border border-gray-300/50 dark:border-gray-600/50 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300 text-sm font-medium hover:shadow-md hover:shadow-gray-400/20 dark:hover:shadow-gray-600/20"
            >
              Forgot Password
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* Add keyframes for background animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradientShift 15s ease infinite;
        }
        @keyframes pulseSlow {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;