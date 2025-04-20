import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

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
      // Hardcode role as 'ADMIN' since only admins can register
      await register(formData.email, formData.password, formData.name, 'ADMIN');
      const redirectPath = user?.role === 'ADMIN' ? '/admin/home' : '/home';
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
      setLoading(false);
    }
  };

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
    hover: { scale: 1.05, boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' },
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

  return (
    <Box
      sx={{
        height: '100vh', // Use height instead of minHeight to prevent overflow
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        width: '100%',
        bgcolor: 'var(--background)',
        position: 'relative',
        overflowY: 'auto', // Allow scrolling only when necessary
      }}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-start)]/10 to-[var(--gradient-end)]/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)] pointer-events-none" />

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: { xs: 340, sm: 400 },
            minWidth: { xs: 280 },
            bgcolor: 'var(--card-background)',
            backdropFilter: 'blur(16px)',
            background: 'var(--card-background)/80',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Typography
            variant="h5"
            align="center"
            className="gradient-text"
            sx={{
              mb: 1,
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
            }}
          >
            Admin Registration
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{
              mb: 3,
              color: 'var(--text-secondary)',
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
                  bgcolor: 'var(--error)/20',
                  color: 'var(--error)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  '& .MuiAlert-icon': {
                    color: 'var(--error)',
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
                        <UserIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                      </motion.div>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: 'var(--input-background)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'var(--input-hover-background)',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--glass-border)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--accent-primary)',
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--accent-primary)',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'var(--accent-primary)',
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
                        <EnvelopeIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                      </motion.div>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: 'var(--input-background)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'var(--input-hover-background)',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--glass-border)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--accent-primary)',
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--accent-primary)',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'var(--accent-primary)',
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
                        <LockClosedIcon className="h-5 w-5 text-[var(--text-secondary)]" />
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
                            <EyeSlashIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                          )}
                        </motion.div>
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: 'var(--input-background)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'var(--input-hover-background)',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--glass-border)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--accent-primary)',
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--accent-primary)',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'var(--accent-primary)',
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
                type="submit"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  bgcolor: 'var(--accent-primary)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 'medium',
                  textTransform: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#7c3aed',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                  },
                  '&:disabled': {
                    bgcolor: 'var(--text-secondary)',
                    color: 'var(--background)',
                    cursor: 'not-allowed',
                  },
                }}
              >
                {loading ? 'Registering...' : 'Register Admin'}
              </Button>
            </motion.div>

            <motion.div variants={inputVariants} custom={4}>
              <Typography
                variant="body2"
                align="center"
                sx={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                }}
              >
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: 'var(--accent-primary)',
                    textDecoration: 'none',
                    fontWeight: 'medium',
                  }}
                >
                  Log In
                </Link>
              </Typography>
            </motion.div>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Register;