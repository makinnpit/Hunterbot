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
  Menu,
  MenuItem,
  Container,
  Grid,
  useTheme,
  useMediaQuery,
  Avatar,
  FormControl,
} from '@mui/material';
import { styled } from '@mui/system';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes } from '@emotion/react';
import Confetti from 'react-confetti';
import OnboardingAvatar from '../../components/onboarding/OnboardingAvatar';
import ChatBubble from '../../components/onboarding/ChatBubble';

// Import icons
import { 
  ChatBubbleBottomCenterTextIcon,
  UserIcon, 
  QuestionMarkCircleIcon,
  BriefcaseIcon,
  ChartBarIcon,
  StarIcon, 
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  LightBulbIcon,
  PlayIcon,
  MicrophoneIcon,
  StopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowLeftIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Animation keyframes
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Interface definitions
interface ChatMessage {
  sender: 'HunterAI' | 'User';
  text: string;
  options?: string[];
  isTyping?: boolean;
  avatar?: string;
}

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Add SpeechSynthesis and Recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    mozSpeechRecognition: any;
    msSpeechRecognition: any;
  }
}

// Add interview questions and feedback types
interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tips: string[];
}

interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  dateApplied: string;
  status: 'applied' | 'interviewing' | 'offer' | 'rejected' | 'accepted';
  source: 'linkedin' | 'company' | 'referral' | 'other';
  logo?: string;
}

// Comprehensive AI responses
const aiResponses: Record<string, string> = {
  'career_change': 'Changing careers can be challenging but rewarding. I recommend: 1) Identify transferable skills, 2) Take courses to fill knowledge gaps, 3) Build a network in your target industry, 4) Update your resume to highlight relevant experience, and 5) Prepare specific stories that showcase your adaptability.',
  
  'resume_tips': 'For a standout resume: 1) Tailor it for each job application, 2) Start with a strong summary, 3) Focus on achievements rather than responsibilities, 4) Quantify your impact with numbers, 5) Include relevant keywords, and 6) Keep design clean and professional. I can analyze your resume if you upload it!',
  
  'interview_common': 'Common interview questions include: "Tell me about yourself," "Why do you want this job," "What are your strengths/weaknesses," "Tell me about a challenge you faced," and "Where do you see yourself in 5 years." Each requires strategic preparation - would you like specific advice on any of these?',
  
  'salary_negotiation': 'For successful salary negotiation: 1) Research industry standards, 2) Know your value and be confident, 3) Consider the entire compensation package, 4) Practice your pitch, 5) Start higher than your target, and 6) Be prepared to walk away. The right approach can increase your offer by 10-15%.',
  
  'linkedin_profile': 'Optimize your LinkedIn profile by: 1) Using a professional photo, 2) Crafting a compelling headline, 3) Writing an engaging summary, 4) Detailing your experience with achievements, 5) Adding relevant skills, and 6) Being active on the platform by posting and engaging with content.',
  
  'cover_letter': 'A strong cover letter should: 1) Address the hiring manager by name, 2) Demonstrate knowledge of the company, 3) Highlight relevant experience, 4) Explain why you\'re the perfect fit, 5) Include a call to action, and 6) Maintain a professional but conversational tone.',
  
  'networking': 'Effective networking strategies include: 1) Attend industry events, 2) Join professional groups, 3) Schedule informational interviews, 4) Be active on LinkedIn, 5) Follow up consistently, 6) Focus on building relationships, not just asking for jobs, and 7) Always offer value before requesting help.',
  
  'remote_work': 'To succeed in remote roles: 1) Create a dedicated workspace, 2) Establish a consistent routine, 3) Use tools for productivity and communication, 4) Set clear boundaries, 5) Proactively communicate with your team, and 6) Take breaks to prevent burnout. Would you like tips on finding remote positions?',
  
  'skills_development': 'To develop in-demand skills: 1) Research trending skills in your industry, 2) Take online courses (Coursera, Udemy, LinkedIn Learning), 3) Work on personal projects, 4) Volunteer for challenging assignments, 5) Find a mentor, and 6) Teach others to reinforce your knowledge.',
  
  'gap_explanation': 'When explaining employment gaps: 1) Be honest but strategic, 2) Focus on what you learned or accomplished during the gap, 3) Emphasize your enthusiasm to return, 4) Highlight relevant activities (volunteering, courses, projects), and 5) Keep your explanation brief and positive, then redirect to your qualifications.',
};

// Styled components
const StepCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2, 0),
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  position: 'relative',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.12)',
  },
}));

const GlowBorder = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '4px',
  background: 'linear-gradient(90deg, #6366F1, #EC4899)',
}));

const FloatingElement = styled(motion.div)`
  animation: ${floatAnimation} 4s ease-in-out infinite;
`;

const onboardingSteps: Step[] = [
  {
    title: 'Welcome',
    description: 'Get started with HunterBot',
    icon: <UserIcon style={{ width: 24, height: 24 }} />,
  },
  {
    title: 'AI Assistant',
    description: 'Chat with your AI career advisor',
    icon: <ChatBubbleBottomCenterTextIcon style={{ width: 24, height: 24 }} />,
  },
  {
    title: 'Interview Prep',
    description: 'Practice for your interviews',
    icon: <LightBulbIcon style={{ width: 24, height: 24 }} />,
  },
  {
    title: 'Job Matching',
    description: 'Discover opportunities',
    icon: <BriefcaseIcon style={{ width: 24, height: 24 }} />,
  },
];

// Sample tips for the feature showcase
const features = [
  'AI-powered interview feedback in real time',
  'Personalized job recommendations based on your profile',
  'Smart resume analysis and optimization',
  'Automated application tracking system',
];

// Sample interview questions for different roles
const interviewQuestions: Record<string, InterviewQuestion[]> = {
  'Software Engineer': [
    {
      id: 1,
      question: "Tell me about a challenging technical problem you've solved recently.",
      category: "Problem Solving",
      difficulty: "medium",
      tips: [
        "Structure your answer using the STAR method",
        "Focus on your specific contributions",
        "Explain your thought process and decision-making"
      ]
    },
    {
      id: 2,
      question: "How would you explain a complex technical concept to a non-technical person?",
      category: "Communication",
      difficulty: "medium",
      tips: [
        "Use analogies and simple language",
        "Avoid jargon and technical terms",
        "Check for understanding throughout"
      ]
    },
    {
      id: 3,
      question: "What's your approach to debugging a complex issue?",
      category: "Technical Skills",
      difficulty: "hard",
      tips: [
        "Describe your systematic approach",
        "Mention tools and techniques you use",
        "Include how you prevent similar issues in the future"
      ]
    }
  ],
  'Product Manager': [
    {
      id: 1,
      question: "How do you prioritize features in a product roadmap?",
      category: "Product Strategy",
      difficulty: "hard",
      tips: [
        "Discuss frameworks like RICE or MoSCoW",
        "Explain how you balance user needs with business goals",
        "Include stakeholder management in your answer"
      ]
    },
    {
      id: 2,
      question: "Tell me about a time when you had to make a decision with incomplete information.",
      category: "Decision Making",
      difficulty: "medium",
      tips: [
        "Show your analytical process",
        "Explain how you mitigated risks",
        "Discuss the outcome and what you learned"
      ]
    }
  ],
  'Data Scientist': [
    {
      id: 1,
      question: "Explain a complex data problem you solved and the approach you took.",
      category: "Technical Skills",
      difficulty: "hard",
      tips: [
        "Structure your response clearly",
        "Focus on your methodology and why you chose it",
        "Include how you communicated results to stakeholders"
      ]
    },
    {
      id: 2,
      question: "How do you ensure your data analysis is free from bias?",
      category: "Ethics",
      difficulty: "medium",
      tips: [
        "Discuss bias detection methods",
        "Explain validation techniques",
        "Include examples from past projects if possible"
      ]
    }
  ]
};

// Sample job applications
const sampleJobApplications: JobApplication[] = [
  {
    id: "job1",
    companyName: "TechCorp",
    position: "Senior Software Engineer",
    dateApplied: "2023-07-15",
    status: "interviewing",
    source: "linkedin",
    logo: "TC"
  },
  {
    id: "job2",
    companyName: "DataViz Inc",
    position: "Data Scientist",
    dateApplied: "2023-07-10",
    status: "applied",
    source: "linkedin",
    logo: "DV"
  },
  {
    id: "job3",
    companyName: "ProductLab",
    position: "Product Manager",
    dateApplied: "2023-07-05",
    status: "offer",
    source: "referral",
    logo: "PL"
  }
];

// Add dashboard styled components
const Sidebar = styled(Box)(({ theme }) => ({
  width: 260,
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
  zIndex: 100,
  transition: 'transform 0.3s ease',
  overflow: 'auto',
}));

const MainContent = styled(Box)(({ theme }) => ({
  marginLeft: 260,
  width: 'calc(100% - 260px)',
  minHeight: '100vh',
  padding: theme.spacing(2, 3),
  transition: 'margin 0.3s ease, width 0.3s ease',
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    width: '100%',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  borderRadius: 12,
  border: '1px solid rgba(99, 102, 241, 0.1)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
}));

const EnhancedOnboarding: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [progress, setProgress] = useState(0);
  const isDarkMode = false;
  const [showConfetti, setShowConfetti] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('welcome');
  
  // New state for voice interactions and job applications
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [jobApplications, setJobApplications] = useState<JobApplication[]>(sampleJobApplications);
  const [showVoiceFeedback, setShowVoiceFeedback] = useState(false);
  const [answerScore, setAnswerScore] = useState<number>(0);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [linkedJobsShown, setLinkedJobsShown] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  // Initialize chat
  useEffect(() => {
    // Welcome message
    setMessages([
      {
        sender: 'HunterAI',
        text: 'Welcome to HunterBot! I\'m your AI career assistant. I\'ll help you land your dream job by preparing you for interviews, matching you with opportunities, and optimizing your applications.',
        options: ['Tell me more', 'How can you help me?', 'Show me a demo'],
        avatar: 'H',
      },
    ]);
    
    // Animate progress bar
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = Math.min(oldProgress + 1, 100);
        if (newProgress === 100) {
          clearInterval(timer);
          // Add badge when onboarding completes
          if (!badges.includes('Onboarded')) {
            setBadges([...badges, 'Onboarded']);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          }
        }
        return newProgress;
      });
    }, 50);
    
    return () => clearInterval(timer);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initialize speech recognition
  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || 
                             window.webkitSpeechRecognition || 
                             window.mozSpeechRecognition || 
                             window.msSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        setCurrentAnswer(transcript);
      };
      
      recognition.onend = () => {
        if (isListening) {
          recognition.start();
        }
      };
      
      setSpeechRecognition(recognition);
    }
  }, []);
  
  // Start/stop listening
  const toggleListening = () => {
    setIsListening(!isListening);
  };
  
  // Select role for interview prep
  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    
    if (interviewQuestions[role] && interviewQuestions[role].length > 0) {
      const randomIndex = Math.floor(Math.random() * interviewQuestions[role].length);
      setCurrentQuestion(interviewQuestions[role][randomIndex]);
      
      // Speak the question
      speakText(interviewQuestions[role][randomIndex].question);
    }
  };
  
  // Speak text using the Web Speech API
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Use a more natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google') || 
        voice.name.includes('Female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Enhanced interview feedback functionality
  const submitAnswer = () => {
    if (!currentAnswer.trim()) return;
    
    setIsListening(false);
    setShowVoiceFeedback(true);
    
    // Calculate a score based on length, keywords, and structure
    const answerWords = currentAnswer.trim().split(/\s+/).length;
    let score = Math.min(100, answerWords / 2);
    
    // Enhanced keyword analysis based on role and question
    let goodKeywords = ['example', 'experience', 'specific', 'result', 'learned', 'accomplished'];
    
    // Add role-specific keywords
    if (selectedRole === 'Software Engineer') {
      goodKeywords = [...goodKeywords, 'code', 'develop', 'test', 'debug', 'solution', 'algorithm', 'efficiency'];
    } else if (selectedRole === 'Product Manager') {
      goodKeywords = [...goodKeywords, 'user', 'stakeholder', 'requirement', 'roadmap', 'prioritize', 'data', 'metric'];
    } else if (selectedRole === 'Data Scientist') {
      goodKeywords = [...goodKeywords, 'analysis', 'model', 'algorithm', 'dataset', 'statistical', 'insight', 'pattern'];
    }
    
    // Check for keywords
    goodKeywords.forEach(keyword => {
      if (currentAnswer.toLowerCase().includes(keyword)) {
        score += 5;
      }
    });
    
    // Check for answer structure
    if (currentAnswer.length > 100 && currentAnswer.includes(',')) {
      score += 10; // Good length and has some structure
    }
    
    // Check for specificity (if includes numbers)
    const hasNumbers = /\d/.test(currentAnswer);
    if (hasNumbers) {
      score += 5;
    }
    
    // Cap score at 100
    score = Math.min(100, score);
    setAnswerScore(Math.round(score));
    
    // Generate enhanced feedback
    const feedbackText = generateFeedback(score, currentAnswer, currentQuestion);
    setFeedback(feedbackText);
    
    // Speak the feedback
    setTimeout(() => {
      speakText(feedbackText);
    }, 1000);
    
    // Add a "Practice Completed" badge if it doesn't exist
    if (!badges.includes('Practice Completed')) {
      setBadges([...badges, 'Practice Completed']);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };
  
  // Enhanced feedback generation
  const generateFeedback = (score: number, answer: string, question: InterviewQuestion | null): string => {
    if (!question) return "I couldn't analyze your answer. Let's try again.";
    
    const words = answer.trim().split(/\s+/).length;
    
    let feedback = '';
    let strengths = [];
    let improvements = [];
    
    // Generate score-based initial feedback
    if (score >= 85) {
      feedback = "Excellent answer! ";
      strengths.push("You provided a comprehensive response with good structure");
      strengths.push("You used specific examples to illustrate your points");
    } else if (score >= 70) {
      feedback = "Good answer! ";
      strengths.push("You addressed the question well");
      improvements.push("Consider adding more specific examples for greater impact");
    } else if (score >= 50) {
      feedback = "Solid effort! ";
      strengths.push("You touched on some important points");
      improvements.push("Your answer could be more comprehensive");
      improvements.push("Try structuring your response using the STAR method");
    } else {
      feedback = "Thanks for your answer. ";
      improvements.push("Your response needs more depth and structure");
      improvements.push("Consider preparing key points before answering similar questions");
      improvements.push("Practice using the STAR method (Situation, Task, Action, Result)");
    }
    
    // Add specific feedback on length
    if (words < 30) {
      improvements.push("Your answer was quite brief. Aim for at least 60-90 seconds of speaking time");
    } else if (words > 200) {
      improvements.push("Your answer was comprehensive, but consider being more concise for some interviews");
    }
    
    // Add role-specific feedback
    if (selectedRole === 'Software Engineer' && !answer.toLowerCase().includes('code')) {
      improvements.push("Consider mentioning specific coding approaches or technical solutions");
    } else if (selectedRole === 'Product Manager' && !answer.toLowerCase().includes('user')) {
      improvements.push("As a Product Manager, emphasize user-centric thinking in your responses");
    } else if (selectedRole === 'Data Scientist' && !answer.toLowerCase().includes('data')) {
      improvements.push("Include more references to how you analyze data and derive insights");
    }
    
    // Add tips from the question
    const tip = question.tips[Math.floor(Math.random() * question.tips.length)];
    improvements.push(tip);
    
    // Format final feedback
    let formattedFeedback = feedback;
    
    if (strengths.length > 0) {
      formattedFeedback += "\n\nStrengths:\n• " + strengths.join("\n• ");
    }
    
    if (improvements.length > 0) {
      formattedFeedback += "\n\nAreas for improvement:\n• " + improvements.join("\n• ");
    }
    
    return formattedFeedback;
  };
  
  // Next question
  const handleNextQuestion = () => {
    if (!selectedRole || !interviewQuestions[selectedRole]) return;
    
    // Filter out the current question
    const filteredQuestions = currentQuestion 
      ? interviewQuestions[selectedRole].filter(q => q.id !== currentQuestion.id)
      : interviewQuestions[selectedRole];
    
    if (filteredQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      setCurrentQuestion(filteredQuestions[randomIndex]);
      
      // Reset states
      setCurrentAnswer('');
      setFeedback('');
      setShowVoiceFeedback(false);
      
      // Speak the new question
      setTimeout(() => {
        speakText(filteredQuestions[randomIndex].question);
      }, 500);
    }
  };
  
  // Show LinkedIn jobs
  const showLinkedInJobs = () => {
    setLinkedJobsShown(true);
    setActiveStep(3);
  };
  
  // Update handleOptionClick to use comprehensive answers
  const handleOptionClick = (option: string) => {
    const userMessage: ChatMessage = {
      sender: 'User',
      text: option,
      avatar: localStorage.getItem('userName')?.charAt(0) || 'U',
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Handle special navigation options first
    if (option === 'Start practice' || option === 'Interview practice') {
      goToStep(2);
      return;
    } else if (option === 'Job matching' || option === 'Find me jobs') {
      goToStep(3);
      return;
    } else if (option === 'Software Engineer' || option === 'Product Manager' || option === 'Data Scientist') {
      goToStep(2);
      setTimeout(() => handleRoleSelect(option), 100);
      return;
    } else if (option === 'Connect LinkedIn') {
      handleLinkedInConnect();
      return;
    } else if (option === 'Add manually') {
      setNewJobDialogOpen(true);
      return;
    } else if (option === 'Show recommendations' && resumeFile) {
      // Show resume recommendations
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'HunterAI',
            text: 'Based on my analysis of your resume, here are some recommendations to improve it:\n\n1. Add more quantifiable achievements\n2. Use action verbs at the beginning of your bullet points\n3. Tailor your skills section to match job descriptions\n4. Remove outdated experience older than 10 years\n5. Add a professional summary at the top',
            options: ['Update my resume', 'Analyze for specific job'],
            avatar: 'H',
          },
        ]);
      }, 500);
      return;
    }
    
    // Add typing indicator
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'HunterAI',
          text: '',
          isTyping: true,
          avatar: 'H',
        },
      ]);
      
      // Remove typing indicator and add response
      setTimeout(() => {
        setMessages((prev) => {
          const filtered = prev.filter((m) => !m.isTyping);
          let response: ChatMessage = {
            sender: 'HunterAI',
            text: '',
            avatar: 'H',
          };
          
          // Check for keyword matches first
          const lowerOption = option.toLowerCase();
          let foundResponse = false;
          
          // Look for keywords in the question
          if (lowerOption.includes('career change') || lowerOption.includes('switch careers')) {
            response.text = aiResponses['career_change'];
            response.options = ['Tell me more about transferable skills', 'How to explain career change to employers', 'Resume for career change'];
            foundResponse = true;
          } else if (lowerOption.includes('resume') || lowerOption.includes('cv')) {
            response.text = aiResponses['resume_tips'];
            response.options = ['Resume templates', 'ATS optimization', 'Common resume mistakes'];
            foundResponse = true;
          } else if (lowerOption.includes('common interview') || lowerOption.includes('interview question')) {
            response.text = aiResponses['interview_common'];
            response.options = ['How to answer strengths/weaknesses', 'Behavioral questions', 'Technical interviews'];
            foundResponse = true;
          } else if (lowerOption.includes('salary') || lowerOption.includes('negotiation') || lowerOption.includes('compensation')) {
            response.text = aiResponses['salary_negotiation'];
            response.options = ['Negotiation phrases to use', 'When to negotiate', 'Benefits beyond salary'];
            foundResponse = true;
          } else if (lowerOption.includes('linkedin') || lowerOption.includes('profile')) {
            response.text = aiResponses['linkedin_profile'];
            response.options = ['LinkedIn headline examples', 'Connection strategies', 'Content creation tips'];
            foundResponse = true;
          } else if (lowerOption.includes('cover letter')) {
            response.text = aiResponses['cover_letter'];
            response.options = ['Cover letter template', 'Common mistakes', 'When is it optional'];
            foundResponse = true;
          } else if (lowerOption.includes('network') || lowerOption.includes('networking')) {
            response.text = aiResponses['networking'];
            response.options = ['Virtual networking', 'Cold outreach templates', 'Following up without being pushy'];
            foundResponse = true;
          } else if (lowerOption.includes('remote') || lowerOption.includes('work from home') || lowerOption.includes('wfh')) {
            response.text = aiResponses['remote_work'];
            response.options = ['Finding remote jobs', 'Remote interview tips', 'Remote work tools'];
            foundResponse = true;
          } else if (lowerOption.includes('skill') || lowerOption.includes('learn') || lowerOption.includes('develop')) {
            response.text = aiResponses['skills_development'];
            response.options = ['Most in-demand skills', 'Free learning resources', 'Certification value'];
            foundResponse = true;
          } else if (lowerOption.includes('gap') || lowerOption.includes('break') || lowerOption.includes('time off')) {
            response.text = aiResponses['gap_explanation'];
            response.options = ['Sample explanations', 'Resume strategies for gaps', 'Addressing gaps in interviews'];
            foundResponse = true;
          }
          
          // If no keyword match, use the predefined flow
          if (!foundResponse) {
            // Different responses based on option selected
            switch (option) {
              case 'Tell me more':
                response.text = 'HunterBot uses advanced AI to help with your job search. I can provide personalized feedback on your interview responses, suggest job matches based on your skills, and help you optimize your resume and applications.';
                response.options = ['Show me how it works', 'I need interview help', 'Find me jobs'];
                break;
                
              case 'How can you help me?':
                response.text = 'I can help in several ways! I can provide practice interview questions with personalized feedback, recommend jobs that match your profile, help you optimize your resume, and track your applications. What would you like help with first?';
                response.options = ['Interview practice', 'Job matching', 'Resume help'];
                break;
                
              case 'Show me a demo':
                response.text = 'Great! Let me show you how our AI interview practice works. I\'ll ask you questions, analyze your responses, and provide feedback on content, delivery, and confidence. Would you like to start a practice session now?';
                response.options = ['Start practice', 'Show other features'];
                break;
                
              case 'Show other features':
                response.text = 'HunterBot offers several powerful features to help with your job search: 1) AI-powered interview feedback, 2) Personalized job recommendations, 3) Smart resume analysis, and 4) Automated application tracking. Which would you like to explore?';
                response.options = ['Interview feedback', 'Job recommendations', 'Resume analysis', 'Application tracking'];
                break;
                
              default:
                // If no predefined answer, give a general response
                response.text = `I understand you're asking about "${option}". While I don't have specific information on that exact query, I'm here to help with your career journey. What specific aspect would you like to know more about?`;
                response.options = ['Interview preparation', 'Job recommendations', 'Career advice'];
            }
          }
          
          return [...filtered, response];
        });
      }, 1500);
    }, 500);
  };
  
  // Handle user input submission
  const handleSendMessage = () => {
    if (userInput.trim()) {
      handleOptionClick(userInput);
    }
  };
  
  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Add resume analysis functionality
  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setResumeFile(event.target.files[0]);
      
      // Add a "Resume Uploaded" badge if it doesn't exist
      if (!badges.includes('Resume Uploaded')) {
        setBadges([...badges, 'Resume Uploaded']);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      // Add feedback message in chat
      const userMessage: ChatMessage = {
        sender: 'User',
        text: `I've uploaded my resume: ${event.target.files[0].name}`,
        avatar: localStorage.getItem('userName')?.charAt(0) || 'U',
      };
      
      setMessages((prev) => [...prev, userMessage]);
      
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'HunterAI',
            text: "I've analyzed your resume and found several ways to improve it. Would you like to see my recommendations?",
            options: ['Show recommendations', 'Not now'],
            avatar: 'H',
          },
        ]);
      }, 2000);
    }
  };

  // Function to connect with LinkedIn
  const handleLinkedInConnect = () => {
    // Simulate LinkedIn connection
    showLinkedInJobs();
    
    // Add a "LinkedIn Connected" badge if it doesn't exist
    if (!badges.includes('LinkedIn Connected')) {
      setBadges([...badges, 'LinkedIn Connected']);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  // Handle navigation to dashboard
  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };
  
  // Render chat interface
  const renderChatSection = () => (
    <StepCard elevation={3}>
      <GlowBorder />
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <OnboardingAvatar type="bot" letter="H" size="medium" pulseEffect />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            HunterAI Assistant
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Your personal career advisor
          </Typography>
        </Box>
      </Box>
      
      <Box
        sx={{
          height: 400,
          mb: 3,
          borderRadius: 3,
          overflow: 'auto',
          background: 'rgba(0, 0, 0, 0.02)',
          border: '1px solid rgba(99, 102, 241, 0.1)',
          p: 2,
        }}
      >
        {messages.map((message, index) => (
          <ChatBubble
            key={index}
            message={message}
            onOptionClick={handleOptionClick}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          variant="outlined"
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
            } 
          }}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!userInput.trim()}
          sx={{ borderRadius: '12px', minWidth: '50px' }}
        >
          <ArrowRightIcon style={{ width: 20, height: 20 }} />
        </Button>
      </Box>
    </StepCard>
  );
  
  // Render welcome section with enhanced UI and working buttons
  const renderWelcomeSection = () => (
    <StepCard elevation={3}>
      <GlowBorder />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <FloatingElement>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0 rgba(99, 102, 241, 0.3)', '0 0 20px rgba(99, 102, 241, 0.6)', '0 0 0 rgba(99, 102, 241, 0.3)'] 
                }}
                transition={{ duration: 2, repeat: Infinity, type: 'tween' }}
              >
                <OnboardingAvatar
                  type="bot"
                  letter="H"
                  size="large"
                  pulseEffect
                />
              </motion.div>
            </Box>
          </FloatingElement>
          
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1F2937' }}>
            Welcome to HunterBot
          </Typography>
          <Typography variant="body1" sx={{ color: '#4B5563', mb: 3, maxWidth: 600, mx: 'auto' }}>
            Your AI-powered career assistant that helps you land your dream job
          </Typography>
          
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              width: '80%', 
              mx: 'auto',
              mb: 3, 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #6366F1, #EC4899)',
                borderRadius: 4
              }
            }} 
          />
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
            {badges.map((badge, index) => (
              <Chip
                key={index}
                label={badge}
                sx={{ 
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '12px',
                  fontWeight: 500,
                  p: 0.5,
                  color: '#4F46E5'
                }}
                icon={<StarIcon style={{ width: 16, height: 16, color: '#EC4899' }} />}
              />
            ))}
          </Box>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {onboardingSteps.map((step, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                      '& .step-indicator': {
                        width: '100%',
                      },
                    },
                  }}
                  onClick={() => setActiveStep(index)}
                >
                  <Box
                    className="step-indicator"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '4px',
                      width: activeStep === index ? '100%' : '0%',
                      background: 'linear-gradient(90deg, #6366F1, #EC4899)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                          color: '#6366F1',
                        }}
                      >
                        {step.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4B5563' }}>
                          {step.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1F2937' }}>
            Key Features
          </Typography>
          <List disablePadding>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem
                  button
                  onClick={() => {
                    // Navigate to appropriate feature based on index
                    if (index === 0) setActiveStep(2); // Interview feedback
                    if (index === 1) setActiveStep(3); // Job recommendations
                    if (index === 2) document.getElementById('resume-upload')?.click(); // Resume analysis - open file dialog
                    if (index === 3) setActiveStep(3); // Application tracking
                  }}
                  sx={{
                    py: 1.5,
                    px: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.1)',
                      transform: 'translateX(5px)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                            color: '#6366F1',
                          }}
                        >
                          <ChartBarIcon style={{ width: 16, height: 16 }} />
                        </Box>
                        <Typography sx={{ color: '#1F2937' }}>{feature}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </motion.div>
            ))}
          </List>
          
          {/* Add resume upload functionality */}
          <input
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            id="resume-upload"
            type="file"
            onChange={handleResumeUpload}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              component="label"
              htmlFor="resume-upload"
              startIcon={<PlusIcon style={{ width: 16, height: 16 }} />}
              sx={{ borderRadius: 8, mr: 2, px: 3 }}
            >
              Upload Resume
            </Button>
            <Button
              variant="outlined"
              onClick={handleLinkedInConnect}
              sx={{ borderRadius: 8, px: 3 }}
            >
              Connect LinkedIn
            </Button>
          </Box>
        </Box>
      </motion.div>
    </StepCard>
  );
  
  // Render interview prep section with improved UI
  const renderInterviewPrepSection = () => (
    <StepCard elevation={3}>
      <GlowBorder />
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <OnboardingAvatar type="bot" letter="H" size="medium" pulseEffect={isSpeaking} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
              AI Interview Coach
            </Typography>
            <Typography variant="body2" sx={{ color: '#4B5563' }}>
              Practice interviews with voice feedback
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={isListening ? "Stop Listening" : "Start Listening"}>
            <IconButton 
              onClick={toggleListening} 
              color={isListening ? "error" : "primary"}
              sx={{ 
                border: '1px solid',
                borderColor: isListening ? 'error.main' : 'primary.main',
                backgroundColor: isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)'
              }}
            >
              {isListening ? (
                <StopIcon style={{ width: 20, height: 20 }} />
              ) : (
                <MicrophoneIcon style={{ width: 20, height: 20 }} />
              )}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Next Question">
            <IconButton 
              onClick={handleNextQuestion}
              disabled={!selectedRole}
              sx={{ 
                border: '1px solid',
                borderColor: 'primary.main',
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
              }}
            >
              <ArrowRightIcon style={{ width: 20, height: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {!selectedRole ? (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1F2937' }}>Select a role to practice for:</Typography>
          <Grid container spacing={2}>
            {Object.keys(interviewQuestions).map((role) => (
              <Grid item xs={12} sm={4} key={role}>
                <Card 
                  onClick={() => handleRoleSelect(role)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937' }}>{role}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {interviewQuestions[role].length} practice questions
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <>
          {currentQuestion && (
            <Box sx={{ mb: 4 }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  position: 'relative',
                  borderRadius: 2,
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  backgroundColor: 'rgba(99, 102, 241, 0.05)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip 
                    label={currentQuestion.category} 
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      color: 'primary.main'
                    }}
                  />
                  <Chip 
                    label={currentQuestion.difficulty} 
                    size="small"
                    sx={{ 
                      backgroundColor: 
                        currentQuestion.difficulty === 'easy' ? 'rgba(16, 185, 129, 0.2)' :
                        currentQuestion.difficulty === 'medium' ? 'rgba(245, 158, 11, 0.2)' :
                        'rgba(239, 68, 68, 0.2)',
                      color: 
                        currentQuestion.difficulty === 'easy' ? '#10B981' :
                        currentQuestion.difficulty === 'medium' ? '#F59E0B' :
                        '#EF4444'
                    }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1F2937' }}>
                  {currentQuestion.question}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    startIcon={<SpeakerWaveIcon style={{ width: 16, height: 16 }} />}
                    onClick={() => speakText(currentQuestion.question)}
                    variant="outlined"
                  >
                    Read Question
                  </Button>
                </Box>
              </Paper>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#1F2937' }}>
                  Your Answer {isListening && <span style={{ color: '#EF4444' }}>(Recording...)</span>}
                </Typography>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    minHeight: 120,
                    borderRadius: 2,
                    border: isListening ? '2px solid #EF4444' : '1px solid rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'background.paper'
                  }}
                >
                  <Typography sx={{ color: '#1F2937' }}>
                    {currentAnswer || (
                      <span style={{ color: '#6B7280', fontStyle: 'italic' }}>
                        {isListening ? 'Speak your answer...' : 'Click the microphone icon to start speaking'}
                      </span>
                    )}
                  </Typography>
                </Paper>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Button 
                  variant="outlined"
                  onClick={() => {
                    setSelectedRole('');
                    setCurrentQuestion(null);
                    setCurrentAnswer('');
                    setFeedback('');
                    setShowVoiceFeedback(false);
                  }}
                  startIcon={<ArrowLeftIcon style={{ width: 16, height: 16 }} />}
                >
                  Change Role
                </Button>
                <Button 
                  variant="contained"
                  disabled={!currentAnswer.trim() || isListening}
                  onClick={submitAnswer}
                  endIcon={<LightBulbIcon style={{ width: 16, height: 16 }} />}
                >
                  Get Feedback
                </Button>
              </Box>
              
              <Collapse in={showVoiceFeedback}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    backgroundColor: 'rgba(99, 102, 241, 0.05)'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
                      AI Feedback
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                        Score:
                      </Typography>
                      <Box 
                        sx={{ 
                          width: 45, 
                          height: 45, 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: '2px solid',
                          borderColor: 
                            answerScore >= 85 ? '#10B981' :
                            answerScore >= 70 ? '#F59E0B' :
                            '#EF4444',
                          color: 
                            answerScore >= 85 ? '#10B981' :
                            answerScore >= 70 ? '#F59E0B' :
                            '#EF4444',
                          fontWeight: 'bold'
                        }}
                      >
                        {answerScore}
                      </Box>
                    </Box>
                  </Box>
                  <Typography sx={{ mb: 2, color: '#1F2937', whiteSpace: 'pre-line' }}>{feedback}</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      size="small" 
                      startIcon={<SpeakerWaveIcon style={{ width: 16, height: 16 }} />}
                      onClick={() => speakText(feedback)}
                      variant="outlined"
                    >
                      Read Feedback
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<ArrowPathIcon style={{ width: 16, height: 16 }} />}
                      onClick={handleNextQuestion}
                      variant="contained"
                    >
                      Next Question
                    </Button>
                  </Box>
                </Paper>
              </Collapse>
            </Box>
          )}
        </>
      )}
    </StepCard>
  );
  
  // Add new job application
  const addJobApplication = () => {
    const newJob: JobApplication = {
      id: `job${jobApplications.length + 1}`,
      companyName: "New Company",
      position: "Position Title",
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'applied',
      source: 'linkedin',
      logo: "NC"
    };
    
    setJobApplications([...jobApplications, newJob]);
  };

  // Change application status
  const updateApplicationStatus = (id: string, newStatus: JobApplication['status']) => {
    setJobApplications(prevJobs => 
      prevJobs.map(job => 
        job.id === id ? { ...job, status: newStatus } : job
      )
    );
    
    // Add badge for first offer if applicable
    if (newStatus === 'offer' && !badges.includes('First Offer')) {
      setBadges([...badges, 'First Offer']);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  // Filter job applications
  const [jobFilter, setJobFilter] = useState<JobApplication['status'] | 'all'>('all');

  // Filtered job applications
  const filteredJobs = jobFilter === 'all'
    ? jobApplications
    : jobApplications.filter(job => job.status === jobFilter);

  // Add new job dialog
  const [newJobDialogOpen, setNewJobDialogOpen] = useState(false);
  const [newJobData, setNewJobData] = useState({
    companyName: '',
    position: '',
    dateApplied: new Date().toISOString().split('T')[0],
    source: 'linkedin' as JobApplication['source']
  });

  // Handle new job submission
  const handleAddNewJob = () => {
    if (newJobData.companyName && newJobData.position) {
      const newJob: JobApplication = {
        id: `job${jobApplications.length + 1}`,
        companyName: newJobData.companyName,
        position: newJobData.position,
        dateApplied: newJobData.dateApplied,
        status: 'applied',
        source: newJobData.source,
        logo: newJobData.companyName.substring(0, 2).toUpperCase()
      };
      
      setJobApplications([...jobApplications, newJob]);
      setNewJobDialogOpen(false);
      setNewJobData({
        companyName: '',
        position: '',
        dateApplied: new Date().toISOString().split('T')[0],
        source: 'linkedin' as JobApplication['source']
      });
    }
  };

  // Render job matching section with enhanced functionality
  const renderJobMatchingSection = () => (
    <StepCard elevation={3}>
      <GlowBorder />
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <OnboardingAvatar type="bot" letter="H" size="medium" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
              Job Applications
            </Typography>
            <Typography variant="body2" sx={{ color: '#4B5563' }}>
              Track your application progress
            </Typography>
          </Box>
        </Box>
        
        <Button 
          variant="contained" 
          size="small"
          startIcon={<PlusIcon style={{ width: 16, height: 16 }} />}
          onClick={() => setNewJobDialogOpen(true)}
        >
          Add Application
        </Button>
      </Box>
      
      {!linkedJobsShown && (
        <Box sx={{ mb: 4, textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1F2937' }}>Connect with LinkedIn</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Import your job applications and connections from LinkedIn to track your progress
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="16" height="16" />}
            onClick={handleLinkedInConnect}
          >
            Connect with LinkedIn
          </Button>
        </Box>
      )}
      
      {linkedJobsShown && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937' }}>
              Your Applications
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label="All" 
                color={jobFilter === 'all' ? "primary" : "default"} 
                variant={jobFilter === 'all' ? "filled" : "outlined"}
                onClick={() => setJobFilter('all')}
              />
              <Chip 
                label="Applied" 
                variant={jobFilter === 'applied' ? "filled" : "outlined"}
                color={jobFilter === 'applied' ? "primary" : "default"}
                onClick={() => setJobFilter('applied')}
              />
              <Chip 
                label="Interviewing" 
                variant={jobFilter === 'interviewing' ? "filled" : "outlined"}
                color={jobFilter === 'interviewing' ? "primary" : "default"}
                onClick={() => setJobFilter('interviewing')}
              />
              <Chip 
                label="Offers" 
                variant={jobFilter === 'offer' ? "filled" : "outlined"}
                color={jobFilter === 'offer' ? "primary" : "default"}
                onClick={() => setJobFilter('offer')}
              />
            </Box>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            {filteredJobs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#4B5563', mb: 2 }}>
                  No applications found with this filter
                </Typography>
                <Button 
                  variant="outlined"
                  onClick={() => setJobFilter('all')}
                >
                  Show All Applications
                </Button>
              </Box>
            ) : (
              filteredJobs.map((job) => (
                <Paper
                  key={job.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: job.source === 'linkedin' ? '#0077B5' : 'primary.main',
                      width: 40,
                      height: 40
                    }}>
                      {job.logo}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                        {job.position}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.companyName} • Applied on {new Date(job.dateApplied).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Menu
                      id={`status-menu-${job.id}`}
                      anchorEl={null}
                      keepMounted
                      open={false}
                    >
                      <MenuItem onClick={() => updateApplicationStatus(job.id, 'applied')}>Applied</MenuItem>
                      <MenuItem onClick={() => updateApplicationStatus(job.id, 'interviewing')}>Interviewing</MenuItem>
                      <MenuItem onClick={() => updateApplicationStatus(job.id, 'offer')}>Offer</MenuItem>
                      <MenuItem onClick={() => updateApplicationStatus(job.id, 'rejected')}>Rejected</MenuItem>
                      <MenuItem onClick={() => updateApplicationStatus(job.id, 'accepted')}>Accepted</MenuItem>
                    </Menu>
                    
                    <FormControl variant="outlined" size="small">
                      <select
                        value={job.status}
                        onChange={(e) => updateApplicationStatus(job.id, e.target.value as JobApplication['status'])}
                        style={{ 
                          padding: '5px 10px',
                          borderRadius: '4px',
                          border: '1px solid rgba(0, 0, 0, 0.2)',
                          backgroundColor: 
                            job.status === 'offer' ? 'rgba(16, 185, 129, 0.2)' :
                            job.status === 'interviewing' ? 'rgba(99, 102, 241, 0.2)' :
                            job.status === 'applied' ? 'rgba(245, 158, 11, 0.2)' :
                            job.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                            'rgba(99, 102, 241, 0.2)',
                          color:
                            job.status === 'offer' ? '#10B981' :
                            job.status === 'interviewing' ? '#6366F1' :
                            job.status === 'applied' ? '#F59E0B' :
                            job.status === 'rejected' ? '#EF4444' :
                            '#6366F1',
                          fontWeight: 'bold'
                        }}
                      >
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                        <option value="accepted">Accepted</option>
                      </select>
                    </FormControl>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
          
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowPathIcon style={{ width: 16, height: 16 }} />}
              onClick={() => {
                // Simulate refreshing applications
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 1500);
              }}
            >
              Refresh Applications
            </Button>
          </Box>
        </>
      )}
      
      {/* New Job Application Dialog */}
      <Dialog open={newJobDialogOpen} onClose={() => setNewJobDialogOpen(false)}>
        <DialogTitle>Add New Job Application</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Company Name"
            fullWidth
            variant="outlined"
            value={newJobData.companyName}
            onChange={(e) => setNewJobData({ ...newJobData, companyName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Position"
            fullWidth
            variant="outlined"
            value={newJobData.position}
            onChange={(e) => setNewJobData({ ...newJobData, position: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Date Applied"
            type="date"
            fullWidth
            variant="outlined"
            value={newJobData.dateApplied}
            onChange={(e) => setNewJobData({ ...newJobData, dateApplied: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#4B5563' }}>Source</Typography>
            <select
              value={newJobData.source}
              onChange={(e) => setNewJobData({ ...newJobData, source: e.target.value as JobApplication['source'] })}
              style={{ 
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 0, 0, 0.2)'
              }}
            >
              <option value="linkedin">LinkedIn</option>
              <option value="company">Company Website</option>
              <option value="referral">Referral</option>
              <option value="other">Other</option>
            </select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewJobDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddNewJob} 
            variant="contained"
            disabled={!newJobData.companyName || !newJobData.position}
          >
            Add Application
          </Button>
        </DialogActions>
      </Dialog>
    </StepCard>
  );
  
  // Function to navigate between steps
  const goToStep = (step: number) => {
    setActiveStep(step);
    
    // If the step is interview prep and no role selected, set progress message
    if (step === 2 && !selectedRole) {
      setMessages((prev) => [
        ...prev.filter(m => !m.isTyping),
        {
          sender: 'HunterAI',
          text: 'Ready to practice your interview skills? Select a role to get started with personalized questions and AI feedback.',
          options: ['Software Engineer', 'Product Manager', 'Data Scientist'],
          avatar: 'H',
        },
      ]);
    }
    
    // If the step is job matching, show appropriate message
    if (step === 3 && !linkedJobsShown) {
      setMessages((prev) => [
        ...prev.filter(m => !m.isTyping),
        {
          sender: 'HunterAI',
          text: 'Let\'s manage your job applications. Connect your LinkedIn account or add applications manually to track your progress.',
          options: ['Connect LinkedIn', 'Add manually', 'Show me how it works'],
          avatar: 'H',
        },
      ]);
    }
  };

  // Enhance ChatBubble component - Add this function if not already present
  const handleMessageLink = (option: string) => {
    if (option === 'Start practice' || option === 'Interview practice') {
      goToStep(2);
    } else if (option === 'Job matching' || option === 'Find me jobs') {
      goToStep(3);
    } else if (option === 'Software Engineer' || option === 'Product Manager' || option === 'Data Scientist') {
      goToStep(2);
      handleRoleSelect(option);
    } else if (option === 'Connect LinkedIn') {
      handleLinkedInConnect();
    } else if (option === 'Add manually') {
      setNewJobDialogOpen(true);
    } else {
      handleOptionClick(option);
    }
  };

  // Main return with improved navigation
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        backgroundSize: '400% 400%',
        animation: `${gradientShift} 15s ease infinite`,
        color: '#111827',
      }}
    >
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && (
        <Sidebar>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <OnboardingAvatar type="bot" letter="H" size="medium" pulseEffect />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
              HunterBot
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3, borderColor: 'rgba(0, 0, 0, 0.1)' }} />
          
          <Typography variant="body2" sx={{ color: '#4B5563', mb: 2, fontWeight: 500 }}>
            ONBOARDING
          </Typography>
          
          <List disablePadding sx={{ mb: 3 }}>
            {onboardingSteps.map((step, index) => (
              <ListItem
                key={index}
                button
                onClick={() => goToStep(index)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  background: activeStep === index ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: activeStep === index ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    background: 'rgba(99, 102, 241, 0.05)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: activeStep === index ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.05)',
                          color: activeStep === index ? 'primary.main' : '#6B7280',
                        }}
                      >
                        {step.icon}
                      </Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: activeStep === index ? 600 : 400,
                          color: activeStep === index ? 'primary.main' : '#1F2937',
                        }}
                      >
                        {step.title}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          <Typography variant="body2" sx={{ color: '#4B5563', mb: 2, fontWeight: 500 }}>
            ACCOUNT
          </Typography>
          
          <List disablePadding sx={{ mb: 'auto' }}>
            <ListItem
              button
              onClick={() => navigate('/profile')}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.05)',
                },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        color: 'primary.main',
                      }}
                    >
                      <UserIcon style={{ width: 18, height: 18 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: '#1F2937' }}>Profile</Typography>
                  </Box>
                }
              />
            </ListItem>
            
            <ListItem
              button
              onClick={() => navigate('/help')}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.05)',
                },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        color: 'primary.main',
                      }}
                    >
                      <QuestionMarkCircleIcon style={{ width: 18, height: 18 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: '#1F2937' }}>Help</Typography>
                  </Box>
                }
              />
            </ListItem>
          </List>
          
          <Divider sx={{ my: 3, borderColor: 'rgba(0, 0, 0, 0.1)' }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              HunterBot v1.0
            </Typography>
          </Box>
        </Sidebar>
      )}
      
      {/* Main Content */}
      <MainContent sx={{ ml: { xs: 0, md: '260px' }, width: { xs: '100%', md: 'calc(100% - 260px)' } }}>
        {/* Mobile Header */}
        {isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
              p: 2,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <OnboardingAvatar type="bot" letter="H" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                HunterBot
              </Typography>
            </Box>
            
            <IconButton
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              sx={{ color: '#111827' }}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon style={{ width: 24, height: 24 }} />
              ) : (
                <Bars3Icon style={{ width: 24, height: 24 }} />
              )}
            </IconButton>
          </Box>
        )}
        
        {/* Mobile Menu */}
        {isMobile && (
          <Collapse in={isMobileMenuOpen} sx={{ mb: 3 }}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <List disablePadding>
                {onboardingSteps.map((step, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => {
                      setActiveStep(index);
                      setIsMobileMenuOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      background: activeStep === index ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {step.icon}
                          <Typography>{step.title}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
                  <Typography variant="body2">HunterBot v1.0</Typography>
                </Box>
              </List>
            </Paper>
          </Collapse>
        )}
        
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {onboardingSteps[activeStep].title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {onboardingSteps[activeStep].description}
          </Typography>
        </Box>
        
        {/* Stats Cards - Only on Welcome page */}
        {activeStep === 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Profile Completion
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 1 }}>
                    {progress}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #6366F1, #EC4899)',
                        borderRadius: 3
                      }
                    }} 
                  />
                </Box>
              </StatsCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Interview Practice
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 1 }}>
                    0 Sessions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ArrowRightIcon style={{ width: 14, height: 14 }} />
                    Start practicing
                  </Typography>
                </Box>
              </StatsCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Applications
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 1 }}>
                    {jobApplications.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ArrowRightIcon style={{ width: 14, height: 14 }} />
                    View applications
                  </Typography>
                </Box>
              </StatsCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    AI Assistant
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 1 }}>
                    Ready
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ArrowRightIcon style={{ width: 14, height: 14 }} />
                    Ask a question
                  </Typography>
                </Box>
              </StatsCard>
            </Grid>
          </Grid>
        )}
        
        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeStep === 0 && renderWelcomeSection()}
            {activeStep === 1 && renderChatSection()}
            {activeStep === 2 && renderInterviewPrepSection()}
            {activeStep === 3 && renderJobMatchingSection()}
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => prev - 1)}
            startIcon={<ArrowLeftIcon style={{ width: 16, height: 16 }} />}
            sx={{ borderRadius: 2 }}
          >
            Previous
          </Button>
          
          <Button
            variant="contained"
            disabled={activeStep === onboardingSteps.length - 1}
            onClick={() => setActiveStep((prev) => prev + 1)}
            endIcon={<ArrowRightIcon style={{ width: 16, height: 16 }} />}
            sx={{ borderRadius: 2 }}
          >
            Continue
          </Button>
        </Box>
      </MainContent>
    </Box>
  );
};

export default EnhancedOnboarding; 