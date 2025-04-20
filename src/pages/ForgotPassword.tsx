import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      setLoading(false);
      return;
    }

    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-start)]/10 to-[var(--gradient-end)]/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-[var(--card-background)]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-700/50"
      >
        {!isSubmitted ? (
          <>
            <div className="text-center mb-8">
              <ShieldCheckIcon className="h-12 w-12 mx-auto text-[var(--accent-primary)]" />
              <h2 className="mt-4 text-2xl font-bold gradient-text">Reset Password</h2>
              <p className="mt-2 text-[var(--text-secondary)] text-sm">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--error)]/20 text-[var(--error)] rounded-lg p-3 mb-4 text-sm flex items-start"
              >
                <InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
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
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/50 text-[var(--text-primary)] rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent placeholder-gray-400 transition-all duration-300 group-hover:shadow-md group-hover:shadow-[var(--accent-primary)]/20"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] transition-all duration-300 ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-[var(--accent-primary)]/30'
                }`}
                variants={buttonVariants}
                whileHover={loading ? undefined : 'hover'}
                whileTap={loading ? undefined : 'tap'}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </motion.button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <ShieldCheckIcon className="h-12 w-12 mx-auto text-[var(--success)]" />
            <h2 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">Check Your Email</h2>
            <p className="mt-2 text-[var(--text-secondary)] text-sm">
              We've sent password reset instructions to <span className="font-medium text-[var(--accent-primary)]">{email}</span>
            </p>
            <p className="mt-4 text-[var(--text-secondary)] text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-[var(--accent-primary)] hover:underline font-medium"
              >
                try again
              </button>
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center space-x-2 text-sm">
          <motion.button
            onClick={() => navigate('/login')}
            className="flex items-center text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Login
          </motion.button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <p className="text-xs text-center text-[var(--text-secondary)]">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@hunterbot.com" className="text-[var(--accent-primary)] hover:underline">
              support@hunterbot.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;