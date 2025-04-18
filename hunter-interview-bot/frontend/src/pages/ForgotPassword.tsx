import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Alert, InputAdornment } from '@mui/material';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('/api/auth/reset-password', { email });
      setSuccess('Password reset email sent! Check your inbox.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
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
      }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Paper
          elevation={6}
          className="hunter-card"
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: { xs: 340, sm: 400 },
            minWidth: { xs: 280 },
          }}
        >
          <Typography
            variant="h5"
            align="center"
            sx={{
              mb: 1,
              background: 'linear-gradient(45deg, #3b82f6, #9333ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Reset Password
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Enter your email to receive a password reset link
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EnvelopeIcon className="h-4 w-4" />
                  </InputAdornment>
                ),
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
              className="hunter-button hunter-button-primary"
              sx={{ mt: 2 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ForgotPassword;