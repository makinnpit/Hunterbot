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

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0 6px 16px rgba(0, 245, 225, 0.4)' }, // Neon cyan shadow
    tap: { scale: 0.95 },
    pulse: {
      scale: [1, 1.02, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const errorVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#121212] to-[#1A1A1A] pointer-events-none animate-gradient-shift" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,225,0.15)_0%,transparent_70%)] pointer-events-none animate-pulse-slow" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-[#1E1E1E] backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 border border-[rgba(0,245,225,0.3)]"
      >
        {!isSubmitted ? (
          <>
            <div className="text-center mb-8">
              <ShieldCheckIcon className="h-12 w-12 mx-auto text-[#00F5E1]" />
              <h2 className="mt-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00F5E1] to-[#FF00E5]">Reset Password</h2>
              <p className="mt-2 text-[#B0BEC5] text-sm">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            {error && (
              <motion.div
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                className="bg-[rgba(255,51,102,0.2)] text-[#FF3366] rounded-lg p-3 mb-4 text-sm flex items-start border border-[rgba(255,51,102,0.5)]"
              >
                <InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={inputVariants}>
                <label htmlFor="email" className="block text-sm font-medium text-[#FFFFFF] mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <EnvelopeIcon className="h-5 w-5 text-[#B0BEC5] group-hover:text-[#00F5E1] transition-colors" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-[#252525] text-[#FFFFFF] rounded-lg border border-[rgba(0,245,225,0.3)] focus:outline-none focus:ring-2 focus:ring-[#00F5E1] focus:border-transparent placeholder-[#B0BEC5] transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(0,245,225,0.4)] focus:shadow-[0_0_16px_rgba(0,245,225,0.6)]"
                    placeholder="Enter your email"
                  />
                </div>
              </motion.div>

              <motion.div variants={inputVariants}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg text-[#121212] font-semibold bg-gradient-to-r from-[#00F5E1] to-[#FF00E5] transition-all duration-300 relative overflow-hidden ${
                    loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_24px_rgba(0,245,225,0.9)]'
                  }`}
                  variants={buttonVariants}
                  whileHover={loading ? undefined : 'hover'}
                  whileTap={loading ? undefined : 'tap'}
                  whileFocus={loading ? undefined : 'pulse'}
                >
                  <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(0,245,225,0.3),transparent)] animate-pulse-effect" />
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-[#121212]" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </motion.button>
              </motion.div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <ShieldCheckIcon className="h-12 w-12 mx-auto text-[#00FF99]" />
            <h2 className="mt-4 text-2xl font-bold text-[#FFFFFF]">Check Your Email</h2>
            <p className="mt-2 text-[#B0BEC5] text-sm">
              We've sent password reset instructions to <span className="font-medium text-[#00F5E1]">{email}</span>
            </p>
            <p className="mt-4 text-[#B0BEC5] text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-[#00F5E1] hover:underline font-medium"
              >
                try again
              </button>
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center space-x-2 text-sm">
          <motion.button
            onClick={() => navigate('/login')}
            className="flex items-center text-[#B0BEC5] hover:text-[#00F5E1] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Login
          </motion.button>
        </div>

        <div className="mt-8 pt-6 border-t border-[rgba(0,245,225,0.3)]">
          <p className="text-xs text-center text-[#B0BEC5]">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@hunterbot.com" className="text-[#00F5E1] hover:underline">
              support@hunterbot.com
            </a>
          </p>
        </div>
      </motion.div>

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
        @keyframes pulseEffect {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-pulse-effect {
          animation: pulseEffect 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;