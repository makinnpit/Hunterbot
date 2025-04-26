import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Chip,
  Badge,
  Card,
  CardContent,
  LinearProgress,
  Collapse,
  TooltipProps,
  tooltipClasses,
} from '@mui/material';
import { styled } from '@mui/system';
import { 
  ChatBubbleLeftIcon, 
  ArrowRightIcon, 
  HomeIcon, 
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ForwardIcon,
  StarIcon, 
  LightBulbIcon, 
  UserIcon, 
  MicrophoneIcon, 
  StopIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes } from '@emotion/react';
import Confetti from 'react-confetti';

// Add type declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Custom Tooltip for Glassmorphism
const GlassTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
}));

// Gradient Keyframes for Background Animation
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

interface ChatMessage {
  sender: 'HunterAI' | 'User';
  text: string;
  options?: string[];
  isTyping?: boolean;
}

interface JobRecommendation {
  title: string;
  company: string;
  matchScore: number;
}

interface PracticeQuestion {
  question: string;
  category: string;
  idealAnswerLength: number; // in words
}

const practiceQuestions: PracticeQuestion[] = [
  {
    question: "Tell me about yourself.",
    category: "Personal Introduction",
    idealAnswerLength: 150
  },
  {
    question: "What are your greatest strengths?",
    category: "Strengths",
    idealAnswerLength: 100
  },
  {
    question: "Where do you see yourself in 5 years?",
    category: "Career Goals",
    idealAnswerLength: 120
  },
  {
    question: "Why should we hire you?",
    category: "Value Proposition",
    idealAnswerLength: 150
  },
  {
    question: "What is your greatest weakness?",
    category: "Self-Awareness",
    idealAnswerLength: 100
  }
];

const steps = ['Welcome', 'Platform Guide', 'Interview Prep', 'Practice'];

const ApplicantOnBoarding: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [sampleAnswer, setSampleAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isVoiceOn, setIsVoiceOn] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommendation[]>([]);
  const [showAskHunter, setShowAskHunter] = useState(false);
  const [hunterQuestion, setHunterQuestion] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Sample tips for the carousel
  const interviewTips = [
    'Speak clearly and at a moderate pace.',
    'Use the STAR method (Situation, Task, Action, Result) for behavioral questions.',
    'Highlight relevant skills and experiences.',
    'Keep answers concise, ideally under 2 minutes.',
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join('');
          setSampleAnswer(transcript);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          setVoiceError(`Voice input error: ${event.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    } else {
      setVoiceError('Voice input is not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        sender: 'HunterAI',
        text: "Hi there! I'm Hunter AI, your next-gen guide to landing your dream job. Ready to explore how I can help you succeed?",
        options: ["Let's get started!", "I'm not ready yet."],
        isTyping: true,
      },
    ]);
  }, []);

  useEffect(() => {
    // Simulate typing animation for Hunter AI messages
    const typingMessages = messages.filter((msg) => msg.isTyping);
    if (typingMessages.length > 0) {
      const timer = setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.isTyping ? { ...msg, isTyping: false } : msg
          )
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  useEffect(() => {
    // Update progress as steps are completed
    setProgress((activeStep / (steps.length - 1)) * 100);
  }, [activeStep]);

  useEffect(() => {
    // Timer for practice questions
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    // Scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOptionClick = (option: string) => {
    setMessages((prev) => [
      ...prev,
      { sender: 'User' as const, text: option },
      ...getNextMessage(option),
    ]);
    setError('');
    updateConfidenceScore(10); // Increase confidence for each interaction
  };

  const updateConfidenceScore = (points: number) => {
    setConfidenceScore((prev) => {
      const newScore = Math.min(prev + points, 100);
      const newBadges: string[] = [];
      if (newScore >= 25 && !badges.includes('Explorer')) newBadges.push('Explorer');
      if (newScore >= 50 && !badges.includes('Achiever')) newBadges.push('Achiever');
      if (newScore >= 75 && !badges.includes('Master')) newBadges.push('Master');
      if (newBadges.length > 0) {
        setBadges((prev) => [...prev, ...newBadges]);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
      }
      return newScore;
    });
  };

  const getNextMessage = (option: string): ChatMessage[] => {
    if (option === "I'm not ready yet.") {
      return [
        {
          sender: 'HunterAI',
          text: "No rush at all! Take your time to prepare, and I'll be right here when you're ready. Want to try again?",
          options: ["Let's get started!", "Exit"],
          isTyping: true,
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
            text: 'Awesome! Lets tour the platform. You can browse jobs, apply with your profile, schedule interviews, and chat with me during AI interviews. Want to learn how to navigate?',
            options: ['Show me how!', 'Skip to interview prep'],
            isTyping: true,
          },
        ];
      case 1: // Platform Guide
        if (option === 'Tell me more about applying') {
          return [
            {
              sender: 'HunterAI',
              text: `Applying is simple! Click "Apply" on a job listing, and we'll use your profile to submit your application. Make sure your profile is complete for better matches. Speaking of which, what's your main skill or experience level (e.g., "React developer, 2 years")?`,
              isTyping: true,
            },
          ];
        }
        setActiveStep(2);
        setJobRecommendations([
          { title: 'Frontend Developer', company: 'TechCorp', matchScore: 85 },
          { title: 'Software Engineer', company: 'Innovate Inc.', matchScore: 78 },
        ]);
        return [
          {
            sender: 'HunterAI',
            text: "Navigating is easy! Use the 'Jobs' link to find openings, click 'Apply' to submit your profile, and check 'Scheduler' for interview times. Now, let's prep for interviews. Ready?",
            options: ['Lets prep!', 'Tell me more about applying'],
            isTyping: true,
          },
        ];
      case 2: // Interview Prep
        setActiveStep(3);
        setIsTimerRunning(true);
        return [
          {
            sender: 'HunterAI',
            text: "Interviews here are AI-driven, so speak clearly and be concise. Example question: 'Tell me about yourself.' A good answer is brief, like: 'I'm a software engineer with 2 years of experience in React, passionate about building user-friendly apps.' Want to try a sample interview?",
            options: ['Try a sample', 'Show more examples'],
            isTyping: true,
          },
        ];
      case 3: // Practice
        if (option === 'Show more examples') {
          return [
            {
              sender: 'HunterAI',
              text: "Here's another example: Question: 'What's your greatest strength?' Answer: 'I excel at problem-solving, which I've honed through debugging complex React applications.' Ready to try a sample now?",
              options: ['Try a sample', 'Show more examples'],
              isTyping: true,
            },
        ]
        }
        return [
          {
            sender: 'HunterAI',
          text: `Great! Here's your practice question: "${practiceQuestions[currentQuestionIndex].question}" (Category: ${practiceQuestions[currentQuestionIndex].category}) Type or speak your answer below, and I'll give feedback! Timer started.`,
            isTyping: true,
          },
        ];
      default:
        return [];
    }
  };

const analyzeSentiment = (text: string): string => {
  const positiveWords = ['great', 'success', 'achieved', 'excellent', 'positive', 'confident'];
  const negativeWords = ['failed', 'struggle', 'difficult', 'problem', 'issue', 'negative'];
  const textLower = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
  const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;

  if (positiveCount > negativeCount) {
    return 'Your answer sounds confident and positive! Keep it up.';
  } else if (negativeCount > positiveCount) {
    return 'Your answer has a slightly negative tone. Try focusing on positive outcomes or solutions.';
  } else {
    return 'Your tone is neutral. Consider adding more positive language to sound more confident.';
  }
};

  const handleSampleAnswer = () => {
    if (!sampleAnswer.trim()) {
      setError('Please enter an answer.');
      return;
    }
    setIsTimerRunning(false);
  setIsListening(false);
  if (recognitionRef.current) {
    recognitionRef.current.stop();
  }

    const wordCount = sampleAnswer.split(/\s+/).length;
    const idealLength = practiceQuestions[currentQuestionIndex].idealAnswerLength;
    const lengthFeedback =
      wordCount < idealLength * 0.7
        ? 'Your answer is a bit short. Try adding more detail!'
        : wordCount > idealLength * 1.3
        ? 'Your answer is a bit long. Try to be more concise!'
        : 'Great length for your answer!';
    const clarityFeedback = sampleAnswer.length > 20 ? 'Your answer is clear and detailed.' : 'Try to elaborate more for better clarity.';
    const keywordFeedback =
      sampleAnswer.toLowerCase().includes('challenge') || sampleAnswer.toLowerCase().includes('team')
        ? 'Good use of relevant keywords!'
        : 'Consider including keywords like "challenge" or "team" to make your answer stronger.';
    const timeTaken = timer > 120 ? 'You took a bit long to answer. Aim for under 2 minutes in a real interview.' : 'Great timing!';
  const sentimentFeedback = analyzeSentiment(sampleAnswer);

    setMessages((prev) => [
      ...prev,
    { sender: 'User' as const, text: sampleAnswer },
      {
      sender: 'HunterAI' as const,
      text: `Feedback:\n- **Length**: ${lengthFeedback}\n- **Clarity**: ${clarityFeedback}\n- **Keywords**: ${keywordFeedback}\n- **Timing**: ${timeTaken}\n- **Tone**: ${sentimentFeedback}`,
        isTyping: true,
      },
      ...(currentQuestionIndex < practiceQuestions.length - 1
        ? [
            {
            sender: 'HunterAI' as const,
            text: "Would you like to try another practice question?",
              options: ['Next question', 'Finish practice'],
              isTyping: true,
            },
          ]
        : [
            {
            sender: 'HunterAI' as const,
            text: "You've completed the practice session! You're all set! Before you go, make sure your profile is complete for better job matches. Ready to browse jobs or revisit any step?",
              options: ['Browse jobs', 'Restart onboarding', 'Go to home', 'Complete my profile'],
              isTyping: true,
            },
          ]),
    ]);
    setSampleAnswer('');
    setFeedback('Answer submitted!');
    setTimer(0);
    updateConfidenceScore(20);
  };

  const handleNextQuestion = () => {
  if (currentQuestionIndex + 1 < practiceQuestions.length) {
    setCurrentQuestionIndex((prev) => prev + 1);
    setTimer(0);
    setIsTimerRunning(true);
    setSampleAnswer('');
    setMessages((prev) => [
      ...prev,
      {
        sender: 'HunterAI',
        text: `Here's your next question: "${practiceQuestions[currentQuestionIndex + 1].question}" (Category: ${practiceQuestions[currentQuestionIndex + 1].category}) Type or speak your answer below!`,
        isTyping: true,
      },
    ]);
  }
  };

  const handleAskHunter = () => {
    if (!hunterQuestion.trim()) {
      setError('Please enter a question for Hunter AI.');
      return;
    }
    const response =
      hunterQuestion.toLowerCase().includes('interview')
        ? 'For interviews, focus on being concise and using the STAR method. Want to practice more?'
        : hunterQuestion.toLowerCase().includes('job')
        ? 'You can find jobs under the "Jobs" tab. I can also recommend some based on your skills—just tell me more!'
      : 'Im here to help! Could you provide more details or ask about interviews or jobs?';
    setMessages((prev) => [
      ...prev,
      { sender: 'User', text: hunterQuestion },
      { sender: 'HunterAI', text: response, isTyping: true },
    ]);
    setHunterQuestion('');
    setShowAskHunter(false);
  };

const toggleVoiceInput = () => {
  if (!recognitionRef.current) {
    setVoiceError('Voice input is not supported in this browser.');
    return;
  }

  if (isListening) {
    recognitionRef.current.stop();
    setIsListening(false);
  } else {
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setVoiceError('');
    } catch (err) {
      setVoiceError('Failed to start voice input. Please try again.');
      setIsListening(false);
    }
  }
};

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)' },
    tap: { scale: 0.95 },
  };

  const avatarVariants = {
    hover: { scale: 1.2, rotate: 10, transition: { duration: 0.3 } },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        bgcolor: isDarkMode ? '#0f172a' : '#e0e7ff',
        background: isDarkMode
          ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
          : 'linear-gradient(135deg, #a5b4fc 0%, #e0e7ff 100%)',
        animation: `${gradientShift} 15s ease infinite`,
        backgroundSize: '200% 200%',
        position: 'relative',
      }}
    >
    {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Paper
          elevation={12}
          sx={{
            p: 4,
            maxWidth: 900,
            width: '100%',
            borderRadius: 4,
            bgcolor: 'transparent',
            background: isDarkMode
              ? 'rgba(30, 58, 138, 0.2)'
              : 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
          }}
        >
        {/* Progress Dashboard */}
        <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 3, mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#f3f4f6' }}>
              Progress Dashboard
            </Typography>
            <IconButton onClick={() => setDashboardOpen((prev) => !prev)} sx={{ color: '#f3f4f6' }}>
              {dashboardOpen ? 'Hide' : 'Show'}
            </IconButton>
          </Box>
          <Collapse in={dashboardOpen}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#d1d5db', mb: 1 }}>
                  Steps Completed: {activeStep + 1}/{steps.length}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 8, borderRadius: 2, bgcolor: '#4b5563', '& .MuiLinearProgress-bar': { bgcolor: '#8b5cf6' } }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#d1d5db', mb: 1 }}>
                  Confidence Score: {confidenceScore}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={confidenceScore}
                  sx={{ height: 8, borderRadius: 2, bgcolor: '#4b5563', '& .MuiLinearProgress-bar': { bgcolor: '#ec4899' } }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['Explorer', 'Achiever', 'Master'].map((badge) => (
                  <GlassTooltip key={badge} title={`Earned at ${badge === 'Explorer' ? 25 : badge === 'Achiever' ? 50 : 75} points`}>
                    <Chip
                      label={badge}
                      sx={{
                        bgcolor: badges.includes(badge) ? '#8b5cf6' : '#4b5563',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        opacity: badges.includes(badge) ? 1 : 0.5,
                      }}
                    />
                  </GlassTooltip>
                ))}
              </Box>
            </Box>
          </Collapse>
        </Card>

          {/* Header with Progress and Mode Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress
                variant="determinate"
                value={progress}
                size={60}
                thickness={5}
                sx={{ color: '#8b5cf6' }}
              />
              <Typography variant="h6" sx={{ color: '#f3f4f6', fontWeight: 'bold' }}>
                Progress: {Math.round(progress)}%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDarkMode}
                    onChange={() => setIsDarkMode((prev) => !prev)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8b5cf6',
                        '& + .MuiSwitch-track': { backgroundColor: '#6d28d9' },
                      },
                    }}
                  />
                }
                label="Dark Mode"
                sx={{ color: '#f3f4f6' }}
              />
              <IconButton
                onClick={() => setIsVoiceOn((prev) => !prev)}
                sx={{ color: '#f3f4f6' }}
              aria-label={isVoiceOn ? 'Turn off voice narration' : 'Turn on voice narration'}
              >
              {isVoiceOn ? <SpeakerWaveIcon className="h-6 w-6" /> : <SpeakerXMarkIcon className="h-6 w-6" />}
              </IconButton>
            </Box>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: activeStep >= index ? '#8b5cf6' : '#9ca3af',
                      fontWeight: activeStep === index ? 'bold' : 'normal',
                    },
                    '& .MuiStepIcon-root': {
                      color: activeStep >= index ? '#8b5cf6' : '#4b5563',
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Title */}
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            Welcome to Hunter AI Onboarding
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4, color: '#d1d5db' }}
          >
            Let Hunter AI, your next-gen assistant, guide you to your dream job!
          </Typography>

          {/* Confidence Score and Badges */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Badge badgeContent={confidenceScore} color="primary">
              <StarIcon className="h-8 w-8 text-[#8b5cf6]" />
            </Badge>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {badges.map((badge) => (
                <Chip
                  key={badge}
                  label={badge}
                  sx={{
                    bgcolor: '#8b5cf6',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Error and Feedback Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {feedback && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {feedback}
            </Alert>
          )}
        {voiceError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {voiceError}
          </Alert>
        )}

          {/* Chat Area */}
          <Box
            sx={{
              maxHeight: 400,
              overflowY: 'auto',
              mb: 3,
              p: 3,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(5px)',
            }}
          >
            <List>
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListItem sx={{ flexDirection: msg.sender === 'HunterAI' ? 'row' : 'row-reverse' }}>
                      <motion.div variants={avatarVariants} whileHover="hover">
                        <Avatar
                          sx={{
                            bgcolor: msg.sender === 'HunterAI' ? '#8b5cf6' : '#4b5563',
                            mr: msg.sender === 'HunterAI' ? 2 : 0,
                            ml: msg.sender === 'User' ? 2 : 0,
                            boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)',
                          }}
                        aria-label={msg.sender === 'HunterAI' ? 'Hunter AI avatar' : 'User avatar'}
                        >
                          {msg.sender === 'HunterAI' ? 'H' : 'U'}
                        </Avatar>
                      </motion.div>
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          bgcolor:
                            msg.sender === 'HunterAI'
                              ? 'rgba(139, 92, 246, 0.2)'
                              : 'rgba(75, 85, 99, 0.2)',
                          color: '#f3f4f6',
                          borderRadius: 3,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {msg.isTyping ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.5 }}
                            >
                              .
                            </motion.div>
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                            >
                              .
                            </motion.div>
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.5, delay: 0.4 }}
                            >
                              .
                            </motion.div>
                          </Box>
                        ) : (
                          <>
                            <ListItemText primary={msg.text} />
                            {msg.options && (
                              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                                    sx={{
                                      borderRadius: 2,
                                      borderColor: '#8b5cf6',
                                      color: '#f3f4f6',
                                      '&:hover': {
                                        borderColor: '#ec4899',
                                        bgcolor: 'rgba(236, 72, 153, 0.1)',
                                      },
                                    }}
                                  aria-label={`Select option: ${opt}`}
                                  >
                                    {opt}
                                  </Button>
                                ))}
                              </Box>
                            )}
                          </>
                        )}
                      </Paper>
                    </ListItem>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </List>
          </Box>

          {/* Job Recommendations (Platform Guide Step) */}
          {activeStep === 1 && jobRecommendations.length > 0 && (
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 3, mb: 3, p: 2 }}>
              <Typography variant="h6" sx={{ color: '#f3f4f6', mb: 2 }}>
                Recommended Jobs for You
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {jobRecommendations.map((job) => (
                  <Card
                    key={job.title}
                    sx={{
                      bgcolor: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: 2,
                      p: 2,
                      flex: 1,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: '#f3f4f6' }}>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#d1d5db', mb: 1 }}>
                      {job.company}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8b5cf6' }}>
                      Match Score: {job.matchScore}%
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Card>
          )}

        {/* Interview Tips (Custom Carousel Implementation) */}
          {activeStep === 2 && (
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 3, mb: 3, p: 2 }}>
              <Typography variant="h6" sx={{ color: '#f3f4f6', mb: 2 }}>
                Quick Interview Tips
              </Typography>
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
              <motion.div
                animate={{ x: ['0%', '-100%', '0%'] }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                style={{ display: 'flex', gap: 16 }}
              >
                {[...interviewTips, ...interviewTips].map((tip, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f3f4f6',
                      minWidth: '100%',
                    }}
                  >
                    <LightBulbIcon className="h-6 w-6 mr-2 text-[#8b5cf6]" />
                    <Typography variant="body1">{tip}</Typography>
                  </Box>
                ))}
              </motion.div>
            </Box>
            </Card>
          )}

        {/* Practice Question Input with Voice Input and Timer */}
          {activeStep === 3 &&
            messages[messages.length - 1]?.sender === 'HunterAI' &&
            !messages[messages.length - 1]?.options && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1" sx={{ color: '#f3f4f6' }}>
                    Time Elapsed: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#d1d5db' }}>
                    Ideal Length: {practiceQuestions[currentQuestionIndex].idealAnswerLength} words
                  </Typography>
                </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={sampleAnswer}
                  onChange={(e) => setSampleAnswer(e.target.value)}
                  placeholder="Type or speak your answer here..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      color: '#f3f4f6',
                      '&:hover fieldset': { borderColor: '#8b5cf6' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                    },
                    '& .MuiInputLabel-root': { color: '#9ca3af' },
                  }}
                  aria-label="Practice answer input"
                />
                <IconButton
                  onClick={toggleVoiceInput}
                  sx={{
                    bgcolor: isListening ? '#ec4899' : '#8b5cf6',
                    color: '#fff',
                    '&:hover': { bgcolor: isListening ? '#f43f5e' : '#7c3aed' },
                    animation: isListening ? 'pulse 1s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                      '100%': { transform: 'scale(1)' },
                    },
                  }}
                  aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                >
                  {isListening ? <StopIcon className="h-6 w-6" /> : <MicrophoneIcon className="h-6 w-6" />}
                </IconButton>
              </Box>
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
                    bgcolor: '#8b5cf6',
                    '&:hover': {
                      bgcolor: '#7c3aed',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                    },
                  }}
                aria-label="Submit practice answer"
                >
                  Submit Answer
                </Button>
              </Box>
            )}

          {/* Navigation Buttons */}
          <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              component={motion.button}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              variant="outlined"
              onClick={() => setShowSkipDialog(true)}
            startIcon={<ForwardIcon className="h-5 w-5" />}
              sx={{
                borderRadius: 2,
                py: 1.5,
                flex: 1,
                borderColor: '#ec4899',
                color: '#f3f4f6',
                '&:hover': { borderColor: '#f43f5e', bgcolor: 'rgba(244, 63, 94, 0.1)' },
              }}
            aria-label="Skip onboarding"
            >
              Skip Onboarding
            </Button>
            <Button
              component={motion.button}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              variant="outlined"
              onClick={() => navigate('/applicant/home')}
              startIcon={<HomeIcon className="h-5 w-5" />}
              sx={{
                borderRadius: 2,
                py: 1.5,
                flex: 1,
                borderColor: '#8b5cf6',
                color: '#f3f4f6',
                '&:hover': { borderColor: '#7c3aed', bgcolor: 'rgba(139, 92, 246, 0.1)' },
              }}
            aria-label="Go to home"
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
                bgcolor: '#8b5cf6',
                '&:hover': {
                  bgcolor: '#7c3aed',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                },
              }}
            aria-label="Browse jobs"
            >
              Browse Jobs
            </Button>
          </Box>

          {/* Ask Hunter AI Floating Button */}
          <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <GlassTooltip title="Ask Hunter AI anything!">
              <IconButton
                component={motion.button}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setShowAskHunter(true)}
                sx={{
                  bgcolor: '#8b5cf6',
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                  '&:hover': { bgcolor: '#7c3aed' },
                }}
              aria-label="Ask Hunter AI"
              >
                <ChatBubbleLeftIcon className="h-6 w-6" />
              </IconButton>
          </GlassTooltip>
          </Box>

          {/* Ask Hunter AI Dialog */}
          <Dialog open={showAskHunter} onClose={() => setShowAskHunter(false)}>
            <DialogTitle sx={{ bgcolor: '#1e3a8a', color: '#f3f4f6' }}>
              Ask Hunter AI
            </DialogTitle>
            <DialogContent sx={{ bgcolor: '#1e3a8a', color: '#f3f4f6' }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={hunterQuestion}
                onChange={(e) => setHunterQuestion(e.target.value)}
                placeholder="Ask me anything about jobs or interviews!"
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: '#f3f4f6',
                    '&:hover fieldset': { borderColor: '#8b5cf6' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  },
                }}
              aria-label="Ask Hunter AI input"
              />
            </DialogContent>
            <DialogActions sx={{ bgcolor: '#1e3a8a' }}>
              <Button onClick={() => setShowAskHunter(false)} sx={{ color: '#f3f4f6' }}>
                Cancel
              </Button>
              <Button
                onClick={handleAskHunter}
                sx={{ bgcolor: '#8b5cf6', color: '#fff', '&:hover': { bgcolor: '#7c3aed' } }}
              aria-label="Submit question to Hunter AI"
              >
                Ask
              </Button>
            </DialogActions>
          </Dialog>

          {/* Skip Onboarding Confirmation Dialog */}
          <Dialog open={showSkipDialog} onClose={() => setShowSkipDialog(false)}>
            <DialogTitle sx={{ bgcolor: '#1e3a8a', color: '#f3f4f6' }}>
              Skip Onboarding?
            </DialogTitle>
            <DialogContent sx={{ bgcolor: '#1e3a8a', color: '#f3f4f6' }}>
              <Typography>
                Are you sure you want to skip onboarding? You can always restart it later from your dashboard.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ bgcolor: '#1e3a8a' }}>
              <Button onClick={() => setShowSkipDialog(false)} sx={{ color: '#f3f4f6' }}>
                Cancel
              </Button>
              <Button
                onClick={() => navigate('/applicant/home')}
                sx={{ bgcolor: '#8b5cf6', color: '#fff', '&:hover': { bgcolor: '#7c3aed' } }}
              aria-label="Confirm skip onboarding"
              >
                Skip
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ApplicantOnBoarding;