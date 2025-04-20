import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { ChatBubbleLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  id: string;
  text: string;
}

interface Application {
  id: string;
  job: { title: string };
  status: string;
}

const InterviewChat: React.FC = () => {
  const { user } = useAuth();
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'APPLICANT') {
      navigate('/login');
      return;
    }
    fetchApplicationAndQuestions();
  }, [user, applicationId, navigate]);

  const fetchApplicationAndQuestions = async () => {
    if (!applicationId) {
      setError('Invalid application ID');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch application details
      const appResponse = await axios.get(`/api/applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplication(appResponse.data);

      // Fetch questions
      const questionsResponse = await axios.get(`/api/interviews/${applicationId}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(questionsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load interview data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError('Please provide an answer');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const currentQuestion = questions[currentQuestionIndex];
      await axios.post(
        `/api/interviews/${applicationId}/answers`,
        {
          questionId: currentQuestion.id,
          answer,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setAnswer('');
        setSuccess('Answer submitted! Next question loaded.');
      } else {
        setSuccess('Interview completed! Thank you for your responses.');
        setTimeout(() => navigate('/applicant/home'), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)' },
    tap: { scale: 0.95 },
  };

  if (loading && !application) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!application || !questions.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {error || 'No questions available for this interview.'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/applicant/home')}
          sx={{ mt: 2, borderRadius: 2 }}
        >
          Return Home
        </Button>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        bgcolor: 'background.default',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            maxWidth: 600,
            width: '100%',
            borderRadius: 3,
            bgcolor: 'background.paper',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,240,245,0.9) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              color: 'primary.main',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Interview Chat - Hunter AI
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Job: {application.job.title} | Application Status: {application.status}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              <ChatBubbleLeftIcon className="h-5 w-5 inline-block mr-2" />
              {currentQuestion.text}
            </Typography>
          </Box>
          <form onSubmit={handleAnswerSubmit}>
            <TextField
              fullWidth
              label="Your Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              multiline
              rows={4}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={motion.button}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  flex: 1,
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : (
                  <>
                    Submit Answer <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
              <Button
                component={motion.button}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                variant="outlined"
                onClick={() => navigate('/applicant/home')}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  flex: 1,
                  borderColor: 'grey.400',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default InterviewChat;
