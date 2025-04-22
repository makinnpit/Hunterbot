import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { TypeAnimation } from 'react-type-animation';

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

  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    console.log('Particles loaded:', container);
  }, []);

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
    hover: { scale: 1.05, boxShadow: '0 0 15px rgba(34, 211, 238, 0.4)' },
    tap: { scale: 0.95 },
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
    float: {
      y: [-2, 2, -2],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const notificationVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  const logoVariants = {
    hover: { rotate: 360, scale: 1.2, transition: { duration: 0.5 } },
    tap: { scale: 0.9 },
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col relative overflow-hidden">
      {/* Particle Background */}
      <Particles
        id="tsparticles"
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: {
                enable: true,
              },
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#22D3EE",
            },
            links: {
              color: "#22D3EE",
              distance: 150,
              enable: true,
              opacity: 0.3,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      {/* Background Gradient with Hexagonal Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#1E293B] pointer-events-none z-10" />
      <div className="absolute inset-0 hexagon-overlay pointer-events-none opacity-20 z-10" />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <motion.svg
            className="h-8 w-8 text-[#22D3EE]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            whileHover="hover"
            whileTap="tap"
            variants={logoVariants}
          >
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
            <path d="M12 2v20M2 7l10 5M22 7l-10 5" />
          </motion.svg>
          <span className="text-xl font-bold text-[#F8FAFC] font-inter">{brandName}</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 z-20">
        {/* Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              variants={notificationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-4 right-4 z-50 bg-[#1E293B]/90 rounded-lg shadow-lg p-4 flex items-center space-x-3 border border-[#22D3EE]/30 max-w-sm"
            >
              <CheckCircleIcon className="h-6 w-6 text-[#22D3EE]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#F8FAFC] font-inter">{notificationMessage}</p>
                <div className="mt-1 h-1 bg-[#22D3EE]/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#22D3EE]"
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
          className="max-w-md w-full bg-[#1E293B]/90 rounded-xl shadow-lg p-8 sm:p-10 border border-[#22D3EE]/30 glowing-border relative"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#F8FAFC] text-center mb-3 font-inter">
            {brandName}
          </h1>
          <div className="text-[#BAE6FD] text-center text-base mb-8 font-inter">
            <TypeAnimation
              sequence={[
                'Your AI Interview Companion',
                2000,
                'Empowering Your Future',
                2000,
                'Smart. Secure. Simple.',
                2000,
              ]}
              wrapper="p"
              speed={50}
              repeat={Infinity}
            />
          </div>

          {error && (
            <motion.div
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              className="bg-[#F87171]/20 text-[#F87171] rounded-lg p-3 mb-6 text-sm text-center border border-[#F87171]/50"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={inputVariants} custom={0}>
              <label htmlFor="email" className="block text-sm font-medium text-[#F8FAFC] mb-2 font-inter">
                Email Address
              </label>
              <div className="relative group">
                <motion.span
                  className="absolute inset-y-0 left-0 flex items-center pl-4"
                  animate="float"
                  variants={iconVariants}
                >
                  <EnvelopeIcon className="h-5 w-5 text-[#BAE6FD] group-hover:text-[#22D3EE] transition-colors" />
                </motion.span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-[#F8FAFC] border-b-2 border-[#22D3EE]/30 focus:border-[#22D3EE] focus:outline-none placeholder-[#BAE6FD] transition-all duration-300 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] font-inter"
                  placeholder="Enter your email"
                />
              </div>
            </motion.div>

            <motion.div variants={inputVariants} custom={1}>
              <label htmlFor="password" className="block text-sm font-medium text-[#F8FAFC] mb-2 font-inter">
                Password
              </label>
              <div className="relative group">
                <motion.span
                  className="absolute inset-y-0 left-0 flex items-center pl-4"
                  animate="float"
                  variants={iconVariants}
                >
                  <LockClosedIcon className="h-5 w-5 text-[#BAE6FD] group-hover:text-[#22D3EE] transition-colors" />
                </motion.span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-transparent text-[#F8FAFC] border-b-2 border-[#22D3EE]/30 focus:border-[#22D3EE] focus:outline-none placeholder-[#BAE6FD] transition-all duration-300 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] font-inter"
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
                    <EyeSlashIcon className="h-5 w-5 text-[#BAE6FD] hover:text-[#22D3EE] transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-[#BAE6FD] hover:text-[#22D3EE] transition-colors" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            <motion.div variants={inputVariants} custom={2}>
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-[#0F172A] font-semibold bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] transition-all duration-300 ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                } font-inter`}
                {...(loading
                  ? {}
                  : { whileHover: 'hover', whileTap: 'tap', variants: buttonVariants })}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-[#0F172A]" viewBox="0 0 24 24">
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
                className="flex-1 py-2 px-4 bg-transparent text-[#F8FAFC] border border-[#22D3EE]/30 rounded-lg hover:bg-[#22D3EE]/10 transition-all duration-300 text-sm font-medium hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] font-inter"
              >
                Register
              </motion.button>
              <motion.button
                type="button"
                onClick={() => navigate('/forgot-password')}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="flex-1 py-2 px-4 bg-transparent text-[#F8FAFC] border border-[#22D3EE]/30 rounded-lg hover:bg-[#22D3EE]/10 transition-all duration-300 text-sm font-medium hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] font-inter"
              >
                Forgot Password
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Add Google Fonts and Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        .hexagon-overlay {
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><g fill="none" stroke="#22D3EE" stroke-opacity="0.2"><path d="M30 10 L50 20 L50 40 L30 50 L10 40 L10 20 Z" transform="translate(20, 20) scale(0.8)"/><path d="M30 10 L50 20 L50 40 L30 50 L10 40 L10 20 Z" transform="translate(80, 60) scale(0.6)"/><path d="M30 10 L50 20 L50 40 L30 50 L10 40 L10 20 Z" transform="translate(120, 30) scale(0.5)"/><path d="M30 10 L50 20 L50 40 L30 50 L10 40 L10 20 Z" transform="translate(180, 80) scale(0.7)"/><path d="M30 10 L50 20 L50 40 L30 50 L10 40 L10 20 Z" transform="translate(250, 40) scale(0.6)"/></g></svg>');
          background-size: 300px 300px;
          background-repeat: repeat;
        }

        .glowing-border {
          position: relative;
          transition: all 0.3s ease;
        }

        .glowing-border:hover {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.5);
        }

        .glowing-border::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(
            45deg,
            rgba(34, 211, 238, 0.3),
            rgba(56, 189, 248, 0.3),
            rgba(34, 211, 238, 0.3)
          );
          z-index: -1;
          border-radius: 14px;
          animation: borderGlow 3s linear infinite;
        }

        @keyframes borderGlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;