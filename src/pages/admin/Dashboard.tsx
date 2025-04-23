import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  BriefcaseIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CalendarIcon, 
  XMarkIcon, 
  Bars3Icon, 
  ArrowDownTrayIcon, 
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathRoundedSquareIcon,
  SunIcon,
  MoonIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  PlayIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { Button, Menu, MenuItem, Tooltip as MuiTooltip } from '@mui/material';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, doc, getDoc, query, where, updateDoc } from 'firebase/firestore';
import { debounce } from 'lodash';
import { TypeAnimation } from 'react-type-animation';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';


// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

interface DashboardProps {
  brandName?: string;
}

interface Job {
  id: string;
  title: string;
  department: string;
  applicants: number;
  status: string;
  posted: string;
  screeningProgress?: number;
}

interface Interview {
  id: number;
  candidate: string;
  position: string;
  time: string;
  date: string;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  link: string;
}

interface Stats {
  timeToHire: string;
  hiringRate: string;
  interviewConversionRate?: string; // Added for expanded Key Metrics
}

interface HunterMessage {
  sender: 'hunter' | 'user';
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface ChatFeature {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

interface ActionResponse {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action?: () => void;
}

interface Insight {
  id: string;
  message: string;
  action: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ brandName = 'Hunter AI' }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<{
    activeJobs: number;
    totalCandidates: number;
    timeToHire: string;
    hiringRate: string;
    interviewConversionRate?: string; // Added for expanded Key Metrics
    recentJobs: Job[];
    upcomingInterviews: Interview[];
    notifications: Notification[];
  }>({
    activeJobs: 0,
    totalCandidates: 0,
    timeToHire: '',
    hiringRate: '',
    interviewConversionRate: '0%', // Default value
    recentJobs: [],
    upcomingInterviews: [],
    notifications: [],
  });
  const [jobFilter, setJobFilter] = useState<'All' | 'active' | 'archived'>('All');
  const [interviewFilter, setInterviewFilter] = useState<'Today' | 'This Week' | 'All'>('Today');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElInterview, setAnchorElInterview] = useState<null | HTMLElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
  );
  const [isJobsExpanded, setIsJobsExpanded] = useState(true);
  const [isInterviewsExpanded, setIsInterviewsExpanded] = useState(true);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null); // For Key Metrics details

  // Hunter AI state
  const [hunterMessages, setHunterMessages] = useState<HunterMessage[]>([
    { 
      sender: 'hunter', 
      message: 'Hello, Troy! Welcome to your Recruitment Dashboard. How can I help you today?',
      type: 'success'
    }
  ]);
  const [hunterInput, setHunterInput] = useState('');
  const [hunterMode, setHunterMode] = useState<'welcome' | 'funFact' | 'trivia' | 'game'>('welcome');
  const [triviaAnswer, setTriviaAnswer] = useState<string | null>(null);
  const [gameJob, setGameJob] = useState<Job | null>(null);
  const hunterMessagesRef = useRef<HTMLDivElement>(null);
  const [isHunterLoading, setIsHunterLoading] = useState(false);

  // New states for interactive features
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState<Insight[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  const stageChartData = {
    labels: ['Applied', 'Interviewed', 'Shortlisted', 'Hired'],
    datasets: [
      {
        data: [60, 28, 15, 8],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#A855F7'],
        borderColor: theme === 'dark' ? ['#1F2937', '#1F2937', '#1F2937', '#1F2937'] : ['#E5E7EB', '#E5E7EB', '#E5E7EB', '#E5E7EB'],
        borderWidth: 2,
      },
    ],
  };

  const hiringRateComparisonData = {
    labels: ['This Month', 'Last Month'],
    datasets: [
      {
        label: 'Hiring Rate (%)',
        data: [parseFloat(dashboardData.hiringRate) || 0, parseFloat(dashboardData.hiringRate) * 0.8 || 0],
        backgroundColor: ['#3B82F6', '#A855F7'],
        borderColor: ['#2563EB', '#9333EA'],
        borderWidth: 1,
      },
    ],
  };

  // Sparkline data for Key Metrics trends (simulated)
  const sparklineData = (baseValue: number) => ({
    labels: Array(7).fill('').map((_, i) => `Day ${i + 1}`),
    datasets: [
      {
        data: Array(7).fill(0).map(() => baseValue * (0.8 + Math.random() * 0.4)),
        borderColor: '#3B82F6',
        fill: false,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  });

  const trends = {
    activeJobs: { change: 10, direction: 'up' },
    totalCandidates: { change: -5, direction: 'down' },
    timeToHire: { change: 3, direction: 'down' },
    interviewConversionRate: { change: 2, direction: 'up' },
  };

  // Theme toggle
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Generate AI-driven insights
  const generateInsights = () => {
    const newInsights: Insight[] = [];

    const lowApplicantJobs = dashboardData.recentJobs.filter(job => job.applicants < 5);
    if (lowApplicantJobs.length > 0) {
      newInsights.push({
        id: 'low-applicants',
        message: `You have ${lowApplicantJobs.length} jobs with low applicant turnout. Consider reposting or revising them.`,
        action: () => navigate('/admin/jobs'),
      });
    }

    if (dashboardData.upcomingInterviews.length > 0) {
      newInsights.push({
        id: 'upcoming-interviews',
        message: `You have ${dashboardData.upcomingInterviews.length} interviews scheduled today. Prepare your questions!`,
        action: () => navigate('/admin/schedule'),
      });
    }

    if (parseInt(dashboardData.timeToHire) > 30) {
      newInsights.push({
        id: 'high-time-to-hire',
        message: `Your average time to hire is ${dashboardData.timeToHire}. Let's streamline the process.`,
        action: () => navigate('/admin/reports'),
      });
    }

    setInsights(newInsights);
  };

  const handleHunterAction = debounce((action: string, context?: any) => {
    let response: ActionResponse = {
      message: '',
      type: 'info'
    };

    switch (action) {
      case 'page_load':
        response = {
          message: `Welcome back, Troy! You have ${dashboardData.activeJobs} active jobs and ${dashboardData.upcomingInterviews.length} upcoming interviews. How can I help you today?`,
          type: 'success',
          action: () => setHunterMode('welcome')
        };
        break;
      case 'filter_jobs':
        response = {
          message: `I see you're filtering by ${context.filter} jobs. Would you like some tips on managing these positions?`,
          type: 'info',
          action: () => setHunterMode('welcome')
        };
        break;
      case 'export_csv':
        response = {
          message: 'Your data has been exported successfully! Would you like to analyze the trends?',
          type: 'success',
          action: () => setHunterMode('welcome')
        };
        break;
      case 'refresh_data':
        response = {
          message: 'Data refreshed! I noticed some interesting patterns. Would you like to hear about them?',
          type: 'success',
          action: () => setHunterMode('welcome')
        };
        break;
      case 'navigate_create_job':
        response = {
          message: 'Creating a new job? I can help you write an effective job description. Would you like some tips?',
          type: 'info',
          action: () => setHunterMode('welcome')
        };
        break;
      case 'navigate_schedule':
        response = {
          message: 'Scheduling interviews? I can help you find the best time slots. Would you like to see some suggestions?',
          type: 'info',
          action: () => setHunterMode('welcome')
        };
        break;
      case 'export_chart':
        response = {
          message: 'Chart exported successfully! Would you like to share it with your team?',
          type: 'success',
          action: () => setHunterMode('welcome')
        };
        break;
      case 'view_job_details':
        response = {
          message: `Viewing job details for ${context.jobTitle}. Would you like assistance with screening candidates for this role?`,
          type: 'info',
          action: () => setHunterMode('welcome')
        };
        break;
      default:
        response = {
          message: 'I\'m not sure what you\'d like to do. Would you like to try a fun fact or play a game?',
          type: 'warning',
          action: () => setHunterMode('welcome')
        };
    }

    setHunterMessages(prev => [...prev, { 
      sender: 'hunter', 
      message: response.message,
      type: response.type
    }]);

    if (response.action) {
      response.action();
    }
  }, 1000);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const activeJobsQuery = query(collection(db, 'createjobs'), where('status', '==', 'active'));
        const activeJobsSnapshot = await getDocs(activeJobsQuery);
        const activeJobs = activeJobsSnapshot.docs.length;

        const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
        const totalCandidates = candidatesSnapshot.docs.length;

        const statsDoc = await getDoc(doc(db, 'stats', 'current'));
        const statsData = statsDoc.exists() ? statsDoc.data() as Stats : {
          timeToHire: '0 days',
          hiringRate: '0%',
          interviewConversionRate: '0%', // Added for expanded Key Metrics
        };

        const allJobsSnapshot = await getDocs(collection(db, 'createjobs'));
        const recentJobs = allJobsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.jobTitle || 'Untitled Job',
            department: data.company || 'Unknown Department',
            applicants: data.candidates?.length || 0,
            status: data.status || 'active',
            posted: data.createdAt?.toDate().toISOString().split('T')[0] || 'Unknown',
            screeningProgress: Math.floor(Math.random() * 100),
          };
        });

        const interviewsSnapshot = await getDocs(collection(db, 'interviews'));
        const upcomingInterviews = interviewsSnapshot.docs.map(doc => ({
          id: doc.data().id,
          candidate: doc.data().candidate,
          position: doc.data().position,
          time: doc.data().time,
          date: doc.data().date,
        }));

        const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
        const notifications = notificationsSnapshot.docs.map(doc => ({
          id: doc.data().id,
          message: doc.data().message,
          time: doc.data().time,
          link: doc.data().link,
        }));

        setDashboardData({
          activeJobs,
          totalCandidates,
          ...statsData,
          recentJobs,
          upcomingInterviews,
          notifications,
        });
        setToast({ message: 'Data loaded successfully', type: 'success' });

        handleHunterAction('page_load');
        generateInsights();
      } catch (error) {
        console.error('Error fetching Firestore data:', error);
        setToast({ message: 'Failed to load data', type: 'error' });
        setHunterMessages(prev => [...prev, {
          sender: 'hunter',
          message: 'Troy, I had trouble loading the data. Want me to try again?'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Scroll to bottom of Hunter messages
  useEffect(() => {
    if (hunterMessagesRef.current) {
      hunterMessagesRef.current.scrollTop = hunterMessagesRef.current.scrollHeight;
    }
  }, [hunterMessages]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Export chart as PNG
  const exportChart = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, 'candidate-stages.png');
          setToast({ message: 'Chart exported as PNG', type: 'success' });
          handleHunterAction('export_chart');
        }
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['ID,Title,Department,Applicants,Status,Posted'];
    const rows = filteredJobs.map(job =>
      `${job.id},${job.title},${job.department},${job.applicants},${job.status},${job.posted}`
    );
    const csvContent = [...headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'recent_jobs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: 'Jobs exported successfully', type: 'success' });
    handleHunterAction('export_csv');
  };

  // Job filter logic
  const filteredJobs = jobFilter === 'All'
    ? dashboardData.recentJobs
    : dashboardData.recentJobs.filter(job => job.status === jobFilter);

  // Interview filter logic
  const today = new Date().toISOString().split('T')[0];
  const filteredInterviews = interviewFilter === 'All'
    ? dashboardData.upcomingInterviews
    : interviewFilter === 'Today'
    ? dashboardData.upcomingInterviews.filter(interview => interview.date === today)
    : dashboardData.upcomingInterviews.filter(interview => {
        const interviewDate = new Date(interview.date);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(now.setDate(now.getDate() + 6));
        return interviewDate >= weekStart && interviewDate <= weekEnd;
      });

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (filter: 'All' | 'active' | 'archived') => {
    setJobFilter(filter);
    setAnchorEl(null);
    handleHunterAction('filter_jobs', { filter });
  };

  const handleInterviewFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElInterview(event.currentTarget);
  };

  const handleInterviewFilterClose = (filter: 'Today' | 'This Week' | 'All') => {
    setInterviewFilter(filter);
    setAnchorElInterview(null);
  };

  // Drag-and-drop handler for interviews
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const reorderedInterviews = Array.from(dashboardData.upcomingInterviews);
    const [movedInterview] = reorderedInterviews.splice(result.source.index, 1);
    reorderedInterviews.splice(result.destination.index, 0, movedInterview);

    setDashboardData(prev => ({
      ...prev,
      upcomingInterviews: reorderedInterviews,
    }));

    try {
      const interviewRef = doc(db, 'interviews', movedInterview.id.toString());
      await updateDoc(interviewRef, { order: result.destination.index });
      setToast({ message: 'Interview rescheduled successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating interview order:', error);
      setToast({ message: 'Failed to reschedule interview', type: 'error' });
    }
  };

  // Hunter AI interactions
  const funFacts = [
    'Did you know the average job posting receives 250 applications?',
    'Fun fact: 47% of candidates say the interview process reflects how a company treats its employees!',
    'Heres a stat: 60% of job seekers have quit an application process because it was too long!',
  ];

  const triviaQuestions = [
    {
      question: 'Whats the most common interview question? A) Tell me about yourself, B) Whats your salary expectation?',
      answer: 'A) Tell me about yourself',
    },
    {
      question: 'What percentage of resumes are rejected due to typos? A) 30%, B) 77%?',
      answer: 'B) 77%',
    },
  ];

  const handleFunFact = async () => {
    setIsHunterLoading(true);
    try {
      const response = await axios.post(
        process.env.REACT_APP_GEMINI_API_URL!,
        {
          contents: [{
            parts: [{
              text: 'Generate a concise, interesting HR-related fun fact.'
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.REACT_APP_GEMINI_API_KEY
          }
        }
      );
      const fact = response.data.candidates[0].content.parts[0].text;
      setHunterMessages(prev => [...prev, { sender: 'hunter', message: fact, type: 'success' }]);
    } catch (error) {
      console.error('Error fetching fun fact:', error);
      const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
      setHunterMessages(prev => [...prev, { sender: 'hunter', message: randomFact, type: 'success' }]);
    } finally {
      setIsHunterLoading(false);
      setHunterMode('funFact');
    }
  };

  const handleTrivia = () => {
    const randomQuestion = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
    setHunterMessages(prev => [...prev, { sender: 'hunter', message: randomQuestion.question, type: 'info' }]);
    setTriviaAnswer(randomQuestion.answer);
    setHunterMode('trivia');
  };

  const handleGame = () => {
    const job = dashboardData.recentJobs[Math.floor(Math.random() * dashboardData.recentJobs.length)];
    setGameJob(job);
    setHunterMessages(prev => [...prev, { 
      sender: 'hunter', 
      message: `Let's play a game, Troy! Guess the number of applicants for the "${job.title}" position. Enter your guess below!`,
      type: 'info'
    }]);
    setHunterMode('game');
  };

  const handleHunterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hunterInput.trim()) return;

    setHunterMessages(prev => [...prev, { sender: 'user', message: hunterInput.trim(), type: 'info' }]);
    const userInput = hunterInput.trim();
    setHunterInput('');
    setIsHunterLoading(true);

    try {
      if (hunterMode === 'trivia' && triviaAnswer) {
        const isCorrect = userInput.toLowerCase().includes(triviaAnswer.toLowerCase().split(')')[1].trim());
        setHunterMessages(prev => [...prev, { 
          sender: 'hunter', 
          message: isCorrect ? 'Correct! Great job, Troy! Want to try another one?' : `Nice try, but the answer was ${triviaAnswer}. Want to play again?`,
          type: 'success'
        }]);
        setTriviaAnswer(null);
        setHunterMode('welcome');
      } else if (hunterMode === 'game' && gameJob) {
        const guess = parseInt(userInput, 10);
        if (isNaN(guess)) {
          setHunterMessages(prev => [...prev, { sender: 'hunter', message: 'Please enter a number, Troy!', type: 'warning' }]);
        } else {
          const actual = gameJob.applicants;
          const message = guess === actual
            ? `Spot on, Troy! "${gameJob.title}" has exactly ${actual} applicants! Want to play again?`
            : guess < actual
            ? `Good guess, but "${gameJob.title}" has ${actual} applicants—higher than your guess! Try again?`
            : `Nice try, but "${gameJob.title}" has ${actual} applicants—lower than your guess! Another round?`;
          setHunterMessages(prev => [...prev, { sender: 'hunter', message, type: 'success' }]);
          setGameJob(null);
          setHunterMode('welcome');
        }
      } else {
        const context = {
          activeJobs: dashboardData.activeJobs,
          totalCandidates: dashboardData.totalCandidates,
          upcomingInterviews: dashboardData.upcomingInterviews.length,
          jobFilter,
          userName: 'Troy',
          insights: insights.map(i => i.message),
        };
        const response = await axios.post(
          process.env.REACT_APP_GEMINI_API_URL!,
          {
            contents: [{
              parts: [{
                text: `You are Hunter AI, a helpful and entertaining HR assistant on a recruitment dashboard. The current admin is Troy. Dashboard context: ${JSON.stringify(context)}. Respond to: "${userInput}" in a friendly, concise, and context-aware manner, offering relevant suggestions or entertainment options (e.g., fun facts, trivia, games).`
              }]
            }]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': process.env.REACT_APP_GEMINI_API_KEY
            }
          }
        );
        const botResponse = response.data.candidates[0].content.parts[0].text;
        setHunterMessages(prev => [...prev, { sender: 'hunter', message: botResponse, type: 'success' }]);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setHunterMessages(prev => [...prev, { 
        sender: 'hunter', 
        message: 'Sorry, Troy, I hit a snag. Lets try something else—want to hear a fun fact?',
        type: 'warning'
      }]);
      setHunterMode('welcome');
    } finally {
      setIsHunterLoading(false);
    }
  };

  const chatFeatures: ChatFeature[] = [
    {
      id: 'fun-fact',
      icon: <LightBulbIcon className="w-5 h-5" />,
      label: 'Fun Fact',
      action: handleFunFact
    },
    {
      id: 'trivia',
      icon: <QuestionMarkCircleIcon className="w-5 h-5" />,
      label: 'Trivia',
      action: handleTrivia
    },
    {
      id: 'game',
      icon: <PlayIcon className="w-5 h-5" />,
      label: 'Play Game',
      action: handleGame
    },
    {
      id: 'schedule',
      icon: <CalendarIcon className="w-5 h-5" />,
      label: 'Schedule Help',
      action: () => handleHunterAction('navigate_schedule')
    },
    {
      id: 'job-tips',
      icon: <BriefcaseIcon className="w-5 h-5" />,
      label: 'Job Tips',
      action: () => handleHunterAction('navigate_create_job')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, rotate: 2 },
    tap: { scale: 0.95 },
  };

  const messageVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  // Update greeting based on time of day
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, [currentTime]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Get top performing jobs
  const topJobs = dashboardData.recentJobs
    .sort((a, b) => b.applicants - a.applicants)
    .slice(0, 3);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} flex flex-col`}>
      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-blue-600 rounded-full shadow-lg"
        aria-label="Open mobile menu"
      >
        <Bars3Icon className="h-6 w-6 text-white" />
      </motion.button>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-gray-100/95'} z-40 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6 pt-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-20 right-4 p-2"
            aria-label="Close mobile menu"
          >
            <XMarkIcon className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
          </motion.button>
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigate('/admin/create-job');
                setIsMobileMenuOpen(false);
                handleHunterAction('navigate_create_job');
              }}
              className={`w-full p-4 text-left rounded-lg flex items-center space-x-3 text-base font-medium ${theme === 'dark' ? 'text-white bg-blue-600/20 hover:bg-blue-600/30' : 'text-gray-900 bg-blue-200/50 hover:bg-blue-200/70'}`}
            >
              <PlusIcon className="h-5 w-5 text-blue-400" />
              <span>Post New Job</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigate('/admin/schedule');
                setIsMobileMenuOpen(false);
                handleHunterAction('navigate_schedule');
              }}
              className={`w-full p-4 text-left rounded-lg flex items-center space-x-3 text-base font-medium ${theme === 'dark' ? 'text-white bg-blue-600/20 hover:bg-blue-600/30' : 'text-gray-900 bg-blue-200/50 hover:bg-blue-200/70'}`}
            >
              <CalendarIcon className="h-5 w-5 text-blue-400" />
              <span>Schedule Interview</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigate('/admin/jobs');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full p-4 text-left rounded-lg flex items-center space-x-3 text-base font-medium ${theme === 'dark' ? 'text-white bg-blue-600/20 hover:bg-blue-600/30' : 'text-gray-900 bg-blue-200/50 hover:bg-blue-200/70'}`}
            >
              <BriefcaseIcon className="h-5 w-5 text-blue-400" />
              <span>View Jobs</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigate('/admin/candidates');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full p-4 text-left rounded-lg flex items-center space-x-3 text-base font-medium ${theme === 'dark' ? 'text-white bg-blue-600/20 hover:bg-blue-600/30' : 'text-gray-900 bg-blue-200/50 hover:bg-blue-200/70'}`}
            >
              <UserGroupIcon className="h-5 w-5 text-blue-400" />
              <span>View Candidates</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <Navbar
        brandName={brandName}
        userName="Troy Teeples"
        userAvatar="https://randomuser.me/api/portraits/men/1.jpg"
        onSearch={() => {}}
        initialNotifications={dashboardData.notifications}
        theme={theme}
      />

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : ''
          } text-white text-sm`}
        >
          {toast.message}
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto" style={{ paddingTop: '80px' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-8 overflow-hidden"
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold tracking-tight bg-clip-text text-transparent ${theme === 'dark' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
                <TypeAnimation
                  sequence={[
                    'Welcome back, Troy!',
                    1000,
                    'Ready to find the best talent?',
                    1000,
                    'Let\'s make some great hires!',
                    1000,
                    'Your recruitment journey starts here.',
                    1000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </h1>
              <p className={`mt-1 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Recruitment Dashboard • April 23, 2025
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="contained"
                startIcon={<PlusIcon className="h-5 w-5" />}
                onClick={() => {
                  navigate('/admin/create-job');
                  handleHunterAction('navigate_create_job');
                }}
                sx={{
                  bgcolor: '#3B82F6',
                  background: '#3B82F6',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { background: '#2563EB' },
                }}
                aria-label="Post new job"
              >
                New Job
              </Button>
              <Button
                variant="outlined"
                startIcon={<CalendarIcon className="h-5 w-5" />}
                onClick={() => {
                  navigate('/admin/schedule');
                  handleHunterAction('navigate_schedule');
                }}
                sx={{
                  borderColor: '#3B82F6',
                  color: '#3B82F6',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { bgcolor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)' },
                }}
                aria-label="Schedule interview"
              >
                Schedule
              </Button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsLoading(true);
                  setDashboardData({
                    activeJobs: 0,
                    totalCandidates: 0,
                    timeToHire: '',
                    hiringRate: '',
                    interviewConversionRate: '0%',
                    recentJobs: [],
                    upcomingInterviews: [],
                    notifications: [],
                  });
                  handleHunterAction('refresh_data');
                  setTimeout(() => setIsLoading(false), 1000);
                }}
                className={`p-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg hover:bg-opacity-80 transition-colors`}
                aria-label="Refresh data"
              >
                <ArrowPathRoundedSquareIcon className="h-5 w-5 text-blue-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg hover:bg-opacity-80 transition-colors`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Interactive Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-6">
                {['overview', 'analytics', 'candidates', 'interviews'].map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    } whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm capitalize transition-colors`}
                  >
                    {tab}
                  </motion.button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Candidate Stages Chart */}
              <motion.div
                variants={cardVariants}
                className={`p-6 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                } shadow-md hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Candidate Stages</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportChart}
                    className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-500 transition-colors"
                    aria-label="Export chart"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span>Export</span>
                  </motion.button>
                </div>
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse space-y-4 w-full">
                      <div className={`h-40 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}></div>
                      <div className={`h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2 mx-auto`}></div>
                    </div>
                  </div>
                ) : (
                  <div ref={chartRef} className="h-64">
                    <Doughnut
                      data={stageChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
                              font: { family: 'Inter', size: 12 },
                              padding: 20,
                            },
                          },
                          tooltip: {
                            backgroundColor: theme === 'dark' ? '#1F2937' : '#F3F4F6',
                            titleColor: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                            bodyColor: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                            borderColor: '#3B82F6',
                            borderWidth: 1,
                            cornerRadius: 8,
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </motion.div>

              {/* Hiring Rate Comparison */}
              <motion.div
                variants={cardVariants}
                className={`p-6 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                } shadow-md hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Hiring Rate Comparison</h3>
                </div>
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse space-y-4 w-full">
                      <div className={`h-40 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}></div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64">
                    <Bar
                      data={hiringRateComparisonData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Hiring Rate (%)',
                              color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
                            },
                            ticks: {
                              color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
                            },
                            grid: {
                              color: theme === 'dark' ? '#374151' : '#E5E7EB',
                            },
                          },
                          x: {
                            ticks: {
                              color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
                            },
                            grid: {
                              color: theme === 'dark' ? '#374151' : '#E5E7EB',
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            backgroundColor: theme === 'dark' ? '#1F2937' : '#F3F4F6',
                            titleColor: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                            bodyColor: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </motion.div>

              {/* Hunter AI */}
              <motion.div
                variants={cardVariants}
                className={`p-6 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                } shadow-md hover:shadow-lg transition-shadow`}
              >
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Hunter AI</h3>
                <div className={`p-6 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gray-50 border border-gray-200'
                } shadow-inner h-[400px] flex flex-col`}>
                  {/* Chat Messages */}
                  <div 
                    ref={hunterMessagesRef}
                    className="flex-1 overflow-y-auto scrollbar-thin mb-4 space-y-4"
                  >
                    <AnimatePresence>
                      {hunterMessages.map((msg, index) => (
                        <motion.div
                          key={index}
                          variants={messageVariants}
                          initial="hidden"
                          animate="visible"
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                        >
                          {msg.sender === 'hunter' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                              <img 
                                src="https://api.dicebear.com/7.x/bottts/svg?seed=Hunter" 
                                alt="Hunter AI" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <motion.div
                            initial={{ x: msg.sender === 'user' ? 20 : -20 }}
                            animate={{ x: 0 }}
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.sender === 'user'
                                ? theme === 'dark'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-500 text-white'
                                : theme === 'dark'
                                ? 'bg-gray-700 text-gray-200'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                          </motion.div>
                          {msg.sender === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center overflow-hidden">
                              <img 
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Troy" 
                                alt="User" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isHunterLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start items-end gap-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                          <img 
                            src="https://api.dicebear.com/7.x/bottts/svg?seed=Hunter" 
                            alt="Hunter AI" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Chat Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {chatFeatures.map((feature) => (
                      <motion.button
                        key={feature.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={feature.action}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } transition-colors`}
                      >
                        {feature.icon}
                        <span>{feature.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleHunterSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={hunterInput}
                      onChange={(e) => setHunterInput(e.target.value)}
                      placeholder="Ask Hunter AI..."
                      className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-white placeholder-gray-400 border border-gray-600'
                          : 'bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={!hunterInput.trim() || isHunterLoading}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        !hunterInput.trim() || isHunterLoading
                          ? theme === 'dark'
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : theme === 'dark'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      } transition-colors`}
                    >
                      Send
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Key Metrics (Moved to Right Column) */}
              <motion.div
                variants={cardVariants}
                className={`p-6 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                } shadow-md hover:shadow-lg transition-shadow sticky top-24`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Key Metrics</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                    className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    } transition-colors`}
                  >
                    {isStatsExpanded ? (
                      <ArrowUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ArrowDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </motion.button>
                </div>
                <div className={`space-y-4 transition-all duration-300 ${
                  isStatsExpanded ? 'max-h-[600px]' : 'max-h-[300px] overflow-hidden'
                }`}>
                  {[
                    { 
                      title: 'Active Jobs', 
                      value: dashboardData.activeJobs, 
                      icon: BriefcaseIcon, 
                      trend: trends.activeJobs,
                      tooltip: 'Number of currently active job postings',
                      details: 'This metric reflects the total number of job postings that are currently open and accepting applications.',
                      sparkline: sparklineData(dashboardData.activeJobs),
                    },
                    { 
                      title: 'Total Candidates', 
                      value: dashboardData.totalCandidates, 
                      icon: UserGroupIcon, 
                      trend: trends.totalCandidates,
                      tooltip: 'Total candidates across all jobs',
                      details: 'This shows the total number of candidates who have applied to all active and past job postings.',
                      sparkline: sparklineData(dashboardData.totalCandidates),
                    },
                    { 
                      title: 'Time to Hire', 
                      value: dashboardData.timeToHire, 
                      icon: ClockIcon,
                      trend: trends.timeToHire,
                      tooltip: 'Average days to hire a candidate',
                      details: 'This metric indicates the average number of days it takes to hire a candidate from the date of application.',
                      sparkline: sparklineData(parseInt(dashboardData.timeToHire) || 0),
                    },
                    { 
                      title: 'Hiring Rate', 
                      value: dashboardData.hiringRate, 
                      icon: ChartBarIcon,
                      tooltip: 'Percentage of applicants hired',
                      details: 'This percentage represents the ratio of hired candidates to the total number of applicants.',
                      sparkline: sparklineData(parseFloat(dashboardData.hiringRate) || 0),
                    },
                    { 
                      title: 'Interview Conversion Rate', 
                      value: dashboardData.interviewConversionRate || '0%', 
                      icon: ArrowTrendingUpIcon,
                      trend: trends.interviewConversionRate,
                      tooltip: 'Percentage of interviews leading to hires',
                      details: 'This metric shows the percentage of interviewed candidates who were successfully hired.',
                      sparkline: sparklineData(parseFloat(dashboardData.interviewConversionRate || '0') || 0),
                    },
                  ].map((stat) => (
                    <MuiTooltip key={stat.title} title={stat.tooltip} arrow>
                      <motion.div
                        variants={cardVariants}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => setExpandedMetric(expandedMetric === stat.title ? null : stat.title)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <stat.icon className="h-6 w-6 text-blue-400" />
                            <div>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{stat.title}</p>
                              <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                              {stat.trend && (
                                <p className={`text-xs flex items-center gap-1 ${
                                  stat.trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {stat.trend.direction === 'up' ? (
                                    <ArrowUpIcon className="h-3 w-3" />
                                  ) : (
                                    <ArrowDownIcon className="h-3 w-3" />
                                  )}
                                  {stat.trend.change}% vs last week
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="h-10 w-20">
                            <Line
                              data={stat.sparkline}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                  x: { display: false },
                                  y: { display: false },
                                },
                                plugins: {
                                  legend: { display: false },
                                  tooltip: { enabled: false },
                                },
                              }}
                            />
                          </div>
                        </div>
                        {expandedMetric === stat.title && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 p-3 bg-opacity-50 rounded-md"
                          >
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{stat.details}</p>
                          </motion.div>
                        )}
                      </motion.div>
                    </MuiTooltip>
                  ))}
                </div>
              </motion.div>

              {/* Top Job Performers Widget */}
              <motion.div
                variants={cardVariants}
                className={`p-6 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                } shadow-md hover:shadow-lg transition-shadow`}
              >
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Top Job Performers</h3>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className={`h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4 mb-2`}></div>
                        <div className={`h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2`}></div>
                      </div>
                    ))}
                  </div>
                ) : topJobs.length === 0 ? (
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No jobs available to display.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {topJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 ${theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'} rounded-lg flex items-center justify-between transition-colors`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-blue-400">{index + 1}.</span>
                            <div>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                {job.title}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {job.department} • {job.applicants} Applicants
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Screening Progress
                            </p>
                            <div className="w-full bg-gray-300 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-400 h-2 rounded-full progress-bar"
                                style={{ width: `${job.screeningProgress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            navigate(`/admin/jobs/${job.id}`);
                            handleHunterAction('view_job_details', { jobTitle: job.title });
                          }}
                          className="text-blue-400 hover:text-blue-500 transition-colors"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Quick Insights Widget */}
              <motion.div
                variants={cardVariants}
                className={`p-6 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                } shadow-md hover:shadow-lg transition-shadow`}
              >
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Quick Insights</h3>
                {insights.length === 0 ? (
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No insights available at the moment.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {insights.map((insight) => (
                      <motion.div
                        key={insight.id}
                        whileHover={{ scale: 1.01 }}
                        className={`p-3 ${theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'} rounded-lg transition-colors`}
                      >
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{insight.message}</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={insight.action}
                          className="text-blue-400 hover:text-blue-500 text-sm mt-1 transition-colors"
                        >
                          Take Action
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body.dark {
          background: #111827;
        }
        body.light {
          background: #F3F4F6;
        }

        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #3B82F6 transparent;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? '#1F2937' : '#E5E7EB'};
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #3B82F6;
          border-radius: 3px;
        }

        .progress-bar {
          transition: width 0.5s ease-in-out;
        }

        .draggable-item:hover {
          cursor: grab;
        }
        .draggable-item:active {
          cursor: grabbing;
        }

        .MuiTooltip-tooltip {
          background-color: ${theme === 'dark' ? '#1F2937' : '#F3F4F6'} !important;
          color: ${theme === 'dark' ? '#F3F4F6' : '#1F2937'} !important;
          border: 1px solid #3B82F6 !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          font-size: 12px !important;
        }
        .MuiTooltip-arrow {
          color: #3B82F6 !important;
        }

        @media (max-width: 640px) {
          .grid-cols-1 {
            grid-template-columns: 1fr;
          }
          .text-3xl {
            font-size: 1.5rem;
            line-height: 2rem;
          }
          .text-lg {
            font-size: 1.125rem;
            line-height: 1.75rem;
          }
          .h-64 {
            height: 14rem;
          }
          .h-10 {
            height: 2rem;
          }
          .w-20 {
            width: 4rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;