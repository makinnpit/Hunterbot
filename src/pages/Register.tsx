import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Alert, InputAdornment, IconButton } from '@mui/material';
import { UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name, 'ADMIN');
      const redirectPath = user?.role === 'ADMIN' ? '/admin/home' : '/home';
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
      setLoading(false);
    }
  };

  // Particle initialization
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    console.log('Particles loaded:', container);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.1, ease: 'easeOut' },
    }),
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0 6px 16px rgba(34, 211, 238, 0.4)' },
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
      x: [-5, 5, -5, 5, 0],
      transition: { duration: 0.5 },
    },
  };

  const iconVariants = {
    hover: { scale: 1.1, rotate: 10, transition: { duration: 0.2 } },
    tap: { scale: 0.9 },
  };

  const linkVariants = {
    hover: { scale: 1.05, color: '#22D3EE' },
    tap: { scale: 0.95 },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        width: '100%',
        bgcolor: '#0F172A',
        position: 'relative',
        overflowY: 'auto',
      }}
    >
      
      {/* Background Gradient with Hexagonal Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#1E293B] pointer-events-none z-10" />
      <div className="absolute inset-0 hexagon-overlay pointer-events-none opacity-20 z-10" />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="z-20">
        <Paper
          elevation={6}
          className="glowing-border"
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: { xs: 340, sm: 400 },
            minWidth: { xs: 280 },
            bgcolor: '#1E293B',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            position: 'relative',
          }}
        >
          <Typography
            variant="h5"
            align="center"
            className="font-inter"
            sx={{
              mb: 1,
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
              color: '#F8FAFC',
            }}
          >
            Admin Registration
          </Typography>
          <Typography
            variant="body2"
            align="center"
            className="font-inter"
            sx={{
              mb: 3,
              color: '#BAE6FD',
              fontSize: '0.875rem',
            }}
          >
            Create an admin account for HUNTER AI
          </Typography>

          {error && (
            <motion.div
              variants={errorVariants}
              initial="hidden"
              animate="visible"
            >
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255,51,102,0.2)',
                  color: '#F87171',
                  border: '1px solid rgba(255,51,102,0.5)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontFamily: 'Inter, sans-serif',
                  '& .MuiAlert-icon': {
                    color: '#F87171',
                  },
                }}
              >
                {error}
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div variants={inputVariants} custom={0}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
                        <UserIcon className="h-5 w-5 text-[#BAE6FD]" />
                      </motion.div>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  style: { color: '#BAE6FD', fontFamily: 'Inter, sans-serif' },
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    color: '#F8FAFC',
                    fontFamily: 'Inter, sans-serif',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#22D3EE',
                    },
                    '&:hover fieldset': {
                      borderColor: '#38BDF8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#22D3EE',
                    },
                  },
                }}
              />
            </motion.div>

            <motion.div variants={inputVariants} custom={1}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
                        <EnvelopeIcon className="h-5 w-5 text-[#BAE6FD]" />
                      </motion.div>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  style: { color: '#BAE6FD', fontFamily: 'Inter, sans-serif' },
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    color: '#F8FAFC',
                    fontFamily: 'Inter, sans-serif',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#22D3EE',
                    },
                    '&:hover fieldset': {
                      borderColor: '#38BDF8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#22D3EE',
                    },
                  },
                }}
              />
            </motion.div>

            <motion.div variants={inputVariants} custom={2}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
                        <LockClosedIcon className="h-5 w-5 text-[#BAE6FD]" />
                      </motion.div>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-[#BAE6FD] hover:text-[#22D3EE]" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-[#BAE6FD] hover:text-[#22D3EE]" />
                          )}
                        </motion.div>
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  style: { color: '#BAE6FD', fontFamily: 'Inter, sans-serif' },
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    color: '#F8FAFC',
                    fontFamily: 'Inter, sans-serif',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#22D3EE',
                    },
                    '&:hover fieldset': {
                      borderColor: '#38BDF8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#22D3EE',
                    },
                  },
                }}
              />
            </motion.div>

            <motion.div variants={inputVariants} custom={3}>
              <Button
                component={motion.button}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                whileFocus="pulse"
                type="submit"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(to right, #22D3EE, #38BDF8)',
                  color: '#0F172A',
                  borderRadius: '8px',
                  fontWeight: 'medium',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontFamily: 'Inter, sans-serif',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 0 24px rgba(34, 211, 238, 0.9)',
                  },
                  '&:disabled': {
                    opacity: 0.7,
                    cursor: 'not-allowed',
                  },
                }}
              >
                <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.3),transparent)] animate-pulse-effect" />
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg className="animate-spin h-5 w-5 mr-2 text-[#0F172A]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Registering...
                  </Box>
                ) : (
                  'Register Admin'
                )}
              </Button>
            </motion.div>

            <motion.div variants={inputVariants} custom={4}>
              <Typography
                variant="body2"
                align="center"
                className="font-inter"
                sx={{
                  color: '#BAE6FD',
                  fontSize: '0.875rem',
                }}
              >
                Already have an account?{' '}
                <Link to="/login">
                  <motion.span
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                    style={{
                      color: '#22D3EE',
                      textDecoration: 'none',
                      fontWeight: 'medium',
                    }}
                  >
                    Log In
                  </motion.span>
                </Link>
              </Typography>
            </motion.div>
          </form>
        </Paper>
      </motion.div>

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

        @keyframes pulseEffect {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-pulse-effect {
          animation: pulseEffect 2s infinite;
        }
      `}</style>
    </Box>
  );
};

export default Register;