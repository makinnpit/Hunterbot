import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Alert, InputAdornment, IconButton } from '@mui/material';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password, 'ADMIN');
      navigate('/admin/home');
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 0px 15px rgba(59, 130, 246, 0.4)' },
    tap: { scale: 0.95 },
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0a0f24',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1e3b 100%)',
        p: { xs: 2, sm: 3 },
      }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: { xs: 320, sm: 360 },
            minWidth: 280,
            borderRadius: 3,
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontWeight: 'bold',
              mb: 1,
              color: '#3b82f6',
              background: 'linear-gradient(45deg, #3b82f6, #9333ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
            }}
          >
            Admin Registration
          </Typography>
          <Typography
            variant="body2"
            color="#94a3b8"
            align="center"
            sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Create your admin account
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <UserIcon className="h-4 w-4 text-blue-400" />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  color: '#e2e8f0',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '& fieldset': { borderColor: 'rgba(59, 130, 246, 0.3)' },
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 8px rgba(59, 130, 246, 0.2)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#94a3b8',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
              }}
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EnvelopeIcon className="h-4 w-4 text-blue-400" />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  color: '#e2e8f0',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '& fieldset': { borderColor: 'rgba(59, 130, 246, 0.3)' },
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 8px rgba(59, 130, 246, 0.2)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#94a3b8',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockClosedIcon className="h-4 w-4 text-blue-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ p: 0.5 }}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4 text-blue-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-blue-400" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  color: '#e2e8f0',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '& fieldset': { borderColor: 'rgba(59, 130, 246, 0.3)' },
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 8px rgba(59, 130, 246, 0.2)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#94a3b8',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockClosedIcon className="h-4 w-4 text-blue-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ p: 0.5 }}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4 text-blue-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-blue-400" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  color: '#e2e8f0',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '& fieldset': { borderColor: 'rgba(59, 130, 246, 0.3)' },
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 8px rgba(59, 130, 246, 0.2)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#94a3b8',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
              }}
            />
            <Button
              component={motion.button}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: 2,
                py: { xs: 1, sm: 1.5 },
                background: 'linear-gradient(45deg, #3b82f6, #9333ea)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2563eb, #7e22ce)',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
                },
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
              sx={{
                mt: 2,
                textTransform: 'none',
                color: '#3b82f6',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '&:hover': {
                  color: '#60a5fa',
                  background: 'rgba(59, 130, 246, 0.1)',
                },
              }}
            >
              Already have an account? Login
            </Button>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Register;