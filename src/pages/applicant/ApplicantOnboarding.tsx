import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import { ChatBubbleLeftIcon, ArrowRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface ChatMessage {
  sender: 'HunterAI' | 'User';
  text: string;
  options?: string[];
}

const steps = ['Welcome', 'Platform Guide', 'Interview Prep', 'Try a Sample'];

const ApplicantOnBoarding: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [sampleAnswer, setSampleAnswer] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'APPLICANT') {
      navigate('/login');
      return;
    }
    // Initialize with welcome message
    setMessages([
      {
        sender: 'HunterAI',
        text: 'Hi there! I’m Hunter AI, your guide to acing your job applications. Ready to explore how I can help you land your dream job?',
        options: ['Let’s get started!', 'I’m not ready yet.'],
      },
    ]);
  }, [user, navigate]);

  const handleOptionClick = (option: string) => {
    setMessages((prev) => [
      ...prev,
      { sender: 'User', text: option },
      ...getNextMessage(option),
    ]);
    setError('');
  };

  const getNextMessage = (option: string): ChatMessage[] => {
    if (option === 'I’m not ready yet.') {
      return [
        {
          sender: 'HunterAI',
          text: 'No rush at all! Take your time to prepare, and I’ll be right here when you’re ready. Want to try again?',
          options: ['Let’s get started!', 'Exit'],
        },
      ];
    }

    if (option === 'Exit') {
      navigate('/applicant/home');
      return [];
    }

    switch (activeStep) {
      case 0: // Welcome
        setActiveStep(1);
        return [
          {
            sender: 'HunterAI',
            text: 'Awesome! Let’s tour the platform. You can browse jobs, apply with your profile, schedule interviews, and chat with me during AI interviews. Want to learn how to navigate?',
            options: ['Show me how!', 'Skip to interview prep'],
          },
        ];
      case 1: // Platform Guide
        setActiveStep(2);
        return [
          {
            sender: 'HunterAI',
            text: 'Navigating is easy! Use the “Jobs” link to find openings, click “Apply” to submit your profile, and check “Scheduler” for interview times. Now, let’s prep for interviews. Ready?',
            options: ['Let’s prep!', 'Tell me more about applying'],
          },
        ];
      case 2: // Interview Prep
        setActiveStep(3);
        return [
          {
            sender: 'HunterAI',
            text: 'Interviews here are AI-driven, so speak clearly and be concise. Example question: “Tell me about yourself.” A good answer is brief, like: “I’m a software engineer with 2 years of experience in React, passionate about building user-friendly apps.” Want to try a sample interview?',
            options: ['Try a sample', 'Show more examples'],
          },
        ];
      case 3: // Try a Sample
        return [
          {
            sender: 'HunterAI',
            text: 'Great! Here’s a practice question: “Describe a technical challenge you faced.” Type your answer below, and I’ll give feedback!',
          },
        ];
      default:
        return [];
    }
  };

  const handleSampleAnswer = () => {
    if (!sampleAnswer.trim()) {
      setError('Please enter an answer.');
      return;
    }
    setMessages((prev) => [
      ...prev,
      { sender: 'User', text: sampleAnswer },
      {
        sender: 'HunterAI',
        text: sampleAnswer.length > 50
          ? 'Nice work! Your answer has good detail. Try keeping it concise for the real interview.'
          : 'Good start! Add a bit more detail to strengthen your answer.',
      },
      {
        sender: 'HunterAI',
        text: 'You’re all set! Ready to browse jobs or revisit any step?',
        options: ['Browse jobs', 'Restart onboarding', 'Go to home'],
      },
    ]);
    setSampleAnswer('');
    setFeedback('Answer submitted!');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)' },
    tap: { scale: 0.95 },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={40} color="primary" />
      </Box>
    );
  }

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
            maxWidth: 800,
            width: '100%',
            borderRadius: 3,
            bgcolor: 'background.paper',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,240,245,0.9) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
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
            Welcome to Hunter AI Onboarding
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Let Hunter AI guide you through the application and interview process!
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {feedback && <Alert severity="success" sx={{ mb: 3 }}>{feedback}</Alert>}
          <Box
            sx={{
              maxHeight: 400,
              overflowY: 'auto',
              mb: 3,
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 2,
            }}
          >
            <List>
              {messages.map((msg, idx) => (
                <ListItem key={idx} sx={{ flexDirection: msg.sender === 'HunterAI' ? 'row' : 'row-reverse' }}>
                  <Avatar
                    sx={{
                      bgcolor: msg.sender === 'HunterAI' ? 'primary.main' : 'grey.400',
                      mr: msg.sender === 'HunterAI' ? 2 : 0,
                      ml: msg.sender === 'User' ? 2 : 0,
                    }}
                  >
                    {msg.sender === 'HunterAI' ? 'H' : user?.name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: msg.sender === 'HunterAI' ? 'primary.light' : 'grey.300',
                      color: msg.sender === 'HunterAI' ? 'common.white' : 'text.primary',
                      borderRadius: 2,
                    }}
                  >
                    <ListItemText primary={msg.text} />
                    {msg.options && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {msg.options.map((opt) => (
                          <Button
                            key={opt}
                            component={motion.button}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            variant="outlined"
                            size="small"
                            onClick={() => handleOptionClick(opt)}
                            sx={{ borderRadius: 2 }}
                          >
                            {opt}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </Paper>
                </ListItem>
              ))}
            </List>
          </Box>
          {activeStep === 3 && messages[messages.length - 1]?.sender === 'HunterAI' && !messages[messages.length - 1]?.options && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={sampleAnswer}
                onChange={(e) => setSampleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  },
                }}
              />
              <Button
                component={motion.button}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                variant="contained"
                onClick={handleSampleAnswer}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  width: '100%',
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' },
                }}
              >
                Submit Answer
              </Button>
            </Box>
          )}
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              component={motion.button}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              variant="outlined"
              onClick={() => navigate('/applicant/home')}
              startIcon={<HomeIcon className="h-5 w-5" />}
              sx={{ borderRadius: 2, py: 1.5, flex: 1 }}
            >
              Go to Home
            </Button>
            <Button
              component={motion.button}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              variant="contained"
              onClick={() => navigate('/applicant/jobs')}
              endIcon={<ArrowRightIcon className="h-5 w-5" />}
              sx={{
                borderRadius: 2,
                py: 1.5,
                flex: 1,
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' },
              }}
            >
              Browse Jobs
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ApplicantOnBoarding;
