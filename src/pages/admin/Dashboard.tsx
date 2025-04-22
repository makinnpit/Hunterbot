import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  BriefcaseIcon, 
  UserIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  Bars3Icon,
  ChevronLeftIcon,
  MoonIcon,
  SunIcon,
  ArrowDownTrayIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { Button } from '@mui/material';
import { Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface DashboardProps {
  brandName?: string;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  message: string;
}

interface Job {
  id: number;
  title: string;
  department: string;
  applicants: number;
  status: string;
  posted: string;
}

const Dashboard: React.FC<DashboardProps> = ({ brandName = 'Hunter AI' }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'bot', message: 'Hello! I am Hunter AI assistant. How can I help you today?' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [jobFilter, setJobFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added for loading state

  const jobsPerPage = 5;

  const dashboardData = {
    activeJobs: 12,
    applicantsPerJob: 45,
    candidateStages: {
      applied: 60,
      interviewed: 28,
      shortlisted: 15,
      hired: 8,
    },
    recentActivity: [
      { id: 1, action: 'Posted new job: Frontend Developer', time: '1 day ago', type: 'job', link: '/jobs/1' },
      { id: 2, action: 'Reviewed 5 candidates for Backend Engineer', time: '2 days ago', type: 'review', link: '/candidates?job=backend-engineer' },
      { id: 3, action: 'Scheduled interview with John Smith', time: '3 days ago', type: 'interview', link: '/interviews/123' },
    ],
    upcomingInterviews: [
      { id: 1, candidate: 'Mark Cuizon', position: 'Frontend Developer', time: '10:00 AM', date: '2025-04-21' },
      { id: 2, candidate: 'Arone Titong', position: 'Backend Engineer', time: '2:00 PM', date: '2025-04-21' },
      { id: 3, candidate: 'Michael Jackson', position: 'Data Scientist', time: '11:00 AM', date: '2025-04-22' },
    ],
    performanceMetrics: {
      timeToHire: '24 days',
      interviewToOffer: '5 days',
      offerAcceptance: '85%',
      candidateSatisfaction: '4.8/5',
      totalHires: 45,
      activeInterviews: 12,
      avgInterviewScore: 8.5,
      hiringEfficiency: '92%',
    },
    recentJobs: [
      { id: 1, title: 'Frontend Developer', department: 'Engineering', applicants: 25, status: 'Open', posted: '2025-04-15' },
      { id: 2, title: 'Backend Engineer', department: 'Engineering', applicants: 18, status: 'Open', posted: '2025-04-14' },
      { id: 3, title: 'Data Scientist', department: 'Analytics', applicants: 12, status: 'Closed', posted: '2025-04-10' },
      { id: 4, title: 'Product Manager', department: 'Product', applicants: 8, status: 'Open', posted: '2025-04-12' },
      { id: 5, title: 'UX Designer', department: 'Design', applicants: 15, status: 'Closed', posted: '2025-04-11' },
      { id: 6, title: 'DevOps Engineer', department: 'Engineering', applicants: 20, status: 'Open', posted: '2025-04-13' },
    ],
    notifications: [
      { id: 1, message: 'New application for Frontend Developer role', time: '1 hour ago', link: '/candidates/123' },
      { id: 2, message: 'Interview scheduled with Mark Cuizon', time: '3 hours ago', link: '/interviews/456' },
      { id: 3, message: 'Job posting for Data Scientist closed', time: '5 hours ago', link: '/jobs/3' },
    ],
  };

  const stageChartData = {
    labels: ['Applied', 'Interviewed', 'Shortlisted', 'Hired'],
    datasets: [
      {
        data: [
          dashboardData.candidateStages.applied,
          dashboardData.candidateStages.interviewed,
          dashboardData.candidateStages.shortlisted,
          dashboardData.candidateStages.hired,
        ],
        backgroundColor: ['#0D6EFD', '#10B981', '#F59E0B', '#22D3EE'],
        borderColor: ['#1E293B', '#1E293B', '#1E293B', '#1E293B'],
        borderWidth: 2,
      },
    ],
  };

  const performanceChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Hires',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: '#22D3EE',
        borderColor: '#22D3EE',
        borderWidth: 1,
        tension: 0.4,
      },
    ],
  };

  // Simulate data loading
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Theme Toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSort = (key: keyof Job) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedJobs = [...dashboardData.recentJobs].sort((a, b) => {
      if (key === 'applicants') {
        return direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
      }
      return direction === 'asc'
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    });
    dashboardData.recentJobs = sortedJobs;
  };

  const filteredJobs = dashboardData.recentJobs.filter(job =>
    (jobFilter === 'All' || job.status === jobFilter) &&
    (job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     job.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

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
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', message: chatInput }]);
    const userMessage = chatInput.trim();
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await axios.post(
        process.env.REACT_APP_GEMINI_API_URL!,
        {
          contents: [{
            parts: [{
              text: `You are a helpful HR assistant. Please provide a concise response to: ${userMessage}`
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
      setChatMessages(prev => [...prev, { sender: 'bot', message: botResponse }]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setChatMessages(prev => [...prev, { 
        sender: 'bot', 
        message: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([{ sender: 'bot', message: 'Hello! I am Hunter AI assistant. How can I help you today?' }]);
    setChatInput('');
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

  const cardVariants = {
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

  const chatBubbleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const iconVariants = {
    hover: { scale: 1.1, rotate: 10, transition: { duration: 0.2 } },
    tap: { scale: 0.9 },
    float: {
      y: [-2, 2, -2],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
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

      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#22D3EE] rounded-lg"
      >
        <Bars3Icon className="h-6 w-6 text-[#0F172A]" />
      </motion.button>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 bg-[#1E293B]/90 backdrop-blur-lg z-40 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2"
          >
            <XMarkIcon className="h-6 w-6 text-[#F8FAFC]" />
          </motion.button>
          <div className="space-y-3">
            {['overview', 'analytics', 'activity'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full p-3 text-left rounded-lg flex items-center space-x-2 text-sm font-medium font-inter ${
                  activeTab === tab
                    ? 'bg-[#22D3EE] text-[#0F172A]'
                    : 'text-[#F8FAFC] hover:bg-[#22D3EE]/10'
                }`}
              >
                {tab === 'overview' && <ChartBarIcon className="h-5 w-5" />}
                {tab === 'analytics' && <ArrowTrendingUpIcon className="h-5 w-5" />}
                {tab === 'activity' && <ClockIcon className="h-5 w-5" />}
                <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full p-3 text-left rounded-lg flex items-center space-x-2 text-sm font-medium text-[#F8FAFC] hover:bg-[#22D3EE]/10 font-inter"
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <Navbar
        brandName={brandName}
        userName="Troy Teeples"
        userAvatar="https://randomuser.me/api/portraits/men/1.jpg"
        onSearch={setSearchQuery}
        initialNotifications={dashboardData.notifications}
      />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-screen pt-16">
        {/* Collapsible Sidebar */}
        <div 
          className={`hidden lg:block transition-all duration-300 fixed left-0 top-16 bottom-0 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          } bg-[#1E293B]/90 backdrop-blur-lg border-r border-[#22D3EE]/30 z-30`}
        >
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              {!isSidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                  <h1 className="text-xl font-bold text-[#F8FAFC] font-inter">{brandName}</h1>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-[#22D3EE]/10 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className={`h-5 w-5 text-[#F8FAFC] transition-transform ${
                  isSidebarCollapsed ? 'rotate-180' : ''
                }`} />
              </motion.button>
            </div>
            <div className="space-y-2">
              {['overview', 'analytics', 'activity'].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full p-3 text-left rounded-lg flex items-center ${
                    isSidebarCollapsed ? 'justify-center' : 'space-x-2'
                  } text-sm font-medium font-inter ${
                    activeTab === tab
                      ? 'bg-[#22D3EE] text-[#0F172A]'
                      : 'text-[#F8FAFC] hover:bg-[#22D3EE]/10'
                  } ${isSidebarCollapsed ? 'tooltip' : ''}`}
                  data-tooltip={isSidebarCollapsed ? tab.charAt(0).toUpperCase() + tab.slice(1) : undefined}
                >
                  {tab === 'overview' && <ChartBarIcon className="h-5 w-5" />}
                  {tab === 'analytics' && <ArrowTrendingUpIcon className="h-5 w-5" />}
                  {tab === 'activity' && <ClockIcon className="h-5 w-5" />}
                  {!isSidebarCollapsed && (
                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  )}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-full p-3 text-left rounded-lg flex items-center ${
                  isSidebarCollapsed ? 'justify-center' : 'space-x-2'
                } text-sm font-medium text-[#F8FAFC] hover:bg-[#22D3EE]/10 font-inter ${isSidebarCollapsed ? 'tooltip' : ''}`}
                data-tooltip={isSidebarCollapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : undefined}
              >
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                {!isSidebarCollapsed && (
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div 
          className={`flex-1 p-4 lg:p-8 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          } overflow-y-auto`}
          style={{ height: 'calc(100vh - 64px)' }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-8"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <motion.h1 
                  className="text-4xl sm:text-5xl font-extrabold text-[#F8FAFC] font-inter"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Welcome Back, Troy
                </motion.h1>
                <motion.p 
                  className="text-[#BAE6FD] mt-2 text-base font-inter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Here's what's happening with your recruitment pipeline today.
                </motion.p>
              </div>
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="contained"
                  startIcon={<PlusIcon className="h-5 w-5" />}
                  onClick={() => navigate('/admin/create-job')}
                  className="bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0F172A] px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-inter font-semibold"
                >
                  Post New Job
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon className="h-5 w-5" />}
                  onClick={() => navigate('/admin/schedule')}
                  className="border border-[#22D3EE]/30 text-[#F8FAFC] hover:bg-[#22D3EE]/10 px-4 py-2 rounded-lg transition-all duration-300 font-inter font-semibold"
                >
                  Schedule Interview
                </Button>
              </motion.div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Active Jobs',
                  value: dashboardData.activeJobs,
                  change: '+15%',
                  trend: 'up',
                  icon: BriefcaseIcon,
                  color: 'blue',
                },
                {
                  title: 'Total Candidates',
                  value: dashboardData.candidateStages.applied,
                  change: '+32%',
                  trend: 'up',
                  icon: UserGroupIcon,
                  color: 'purple',
                },
                {
                  title: 'Time to Hire',
                  value: '24 days',
                  change: '-3 days',
                  trend: 'down',
                  icon: ClockIcon,
                  color: 'green',
                },
                {
                  title: 'Hiring Rate',
                  value: '92%',
                  change: '+5%',
                  trend: 'up',
                  icon: ChartBarIcon,
                  color: 'orange',
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  variants={cardVariants}
                  custom={index}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative glowing-border"
                >
                  <div className="relative bg-[#1E293B]/90 rounded-xl p-6 border border-[#22D3EE]/30 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <motion.div
                        className={`p-2 rounded-lg bg-${stat.color}-500/20`}
                        variants={iconVariants}
                        whileHover="hover"
                        whileTap="tap"
                        animate="float"
                      >
                        <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                      </motion.div>
                      <div className={`flex items-center gap-1 text-sm font-inter ${
                        stat.trend === 'up' ? 'text-[#10B981]' : 'text-[#F87171]'
                      }`}>
                        {stat.trend === 'up' ? (
                          <ArrowTrendingUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4" />
                        )}
                        <span>{stat.change}</span>
                      </div>
                    </div>
                    <h3 className="text-[#BAE6FD] text-sm font-medium mb-1 font-inter">{stat.title}</h3>
                    <p className="text-2xl font-bold text-[#F8FAFC] font-inter">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-[#22D3EE]/30 mb-8">
              {['overview', 'analytics', 'activity'].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-3 px-2 text-sm font-semibold capitalize transition-colors font-inter ${
                    activeTab === tab
                      ? 'text-[#22D3EE]'
                      : 'text-[#BAE6FD] hover:text-[#F8FAFC]'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-[#22D3EE] rounded-t-md"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Quick Actions */}
                <motion.div
                  variants={cardVariants}
                  className="bg-[#1E293B]/90 rounded-xl p-6 shadow-md mb-10 border border-[#22D3EE]/30 glowing-border"
                >
                  <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4 font-inter">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: 'Post New Job', icon: PlusIcon, path: '/admin/create-job' },
                      { label: 'Schedule Interview', icon: CalendarIcon, path: '/interviews/schedule' },
                      { label: 'View Reports', icon: ChartBarIcon, path: '/admin/reports' },
                    ].map((action) => (
                      <motion.button
                        key={action.label}
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                        onClick={() => navigate(action.path)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0F172A] rounded-lg transition-all duration-300 shadow-md font-inter font-semibold"
                      >
                        <action.icon className="h-5 w-5 mr-2" />
                        {action.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Candidate Stages Chart */}
                    <motion.div
                      variants={cardVariants}
                      className="bg-[#1E293B]/90 rounded-xl p-6 shadow-md border border-[#22D3EE]/30 glowing-border"
                    >
                      <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4 font-inter">Candidate Stages</h3>
                      {isLoading ? (
                        <div className="h-72 flex items-center justify-center">
                          <svg className="animate-spin h-8 w-8 text-[#22D3EE]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-72">
                          <Doughnut
                            data={stageChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                  labels: {
                                    color: '#BAE6FD',
                                    font: { family: 'Inter', size: 12 },
                                    padding: 20,
                                  },
                                },
                                tooltip: {
                                  backgroundColor: '#1E293B',
                                  titleColor: '#F8FAFC',
                                  bodyColor: '#F8FAFC',
                                  borderColor: '#22D3EE',
                                  borderWidth: 1,
                                  cornerRadius: 8,
                                },
                              },
                              animation: {
                                duration: 1200,
                                easing: 'easeInOutQuart',
                              },
                            }}
                          />
                        </div>
                      )}
                    </motion.div>

                    {/* Recent Jobs Table */}
                    <motion.div
                      variants={cardVariants}
                      className="bg-[#1E293B]/90 rounded-xl p-6 shadow-md border border-[#22D3EE]/30 glowing-border"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-[#F8FAFC] font-inter">Recent Jobs</h3>
                        <div className="flex space-x-2">
                          <select
                            value={jobFilter}
                            onChange={(e) => setJobFilter(e.target.value)}
                            className="p-2 rounded-lg bg-transparent text-[#F8FAFC] border border-[#22D3EE]/30 focus:outline-none focus:ring-2 focus:ring-[#22D3EE] text-sm font-inter"
                          >
                            <option value="All">All</option>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                          </select>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={exportToCSV}
                            className="p-2 bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0F172A] rounded-lg flex items-center space-x-1 text-sm font-inter font-semibold tooltip"
                            data-tooltip="Export to CSV"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            <span>Export</span>
                          </motion.button>
                        </div>
                      </div>
                      {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                          <svg className="animate-spin h-8 w-8 text-[#22D3EE]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        </div>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[#F8FAFC] font-inter">
                              <thead>
                                <tr className="border-b border-[#22D3EE]/30">
                                  <th className="py-3 px-4 text-sm font-medium">
                                    <button onClick={() => handleSort('title')} className="flex items-center">
                                      Title
                                      {sortConfig?.key === 'title' && (
                                        sortConfig.direction === 'asc' ? (
                                          <ArrowUpIcon className="h-4 w-4 ml-1" />
                                        ) : (
                                          <ArrowDownIcon className="h-4 w-4 ml-1" />
                                        )
                                      )}
                                    </button>
                                  </th>
                                  <th className="py-3 px-4 text-sm font-medium">
                                    <button onClick={() => handleSort('department')} className="flex items-center">
                                      Department
                                      {sortConfig?.key === 'department' && (
                                        sortConfig.direction === 'asc' ? (
                                          <ArrowUpIcon className="h-4 w-4 ml-1" />
                                        ) : (
                                          <ArrowDownIcon className="h-4 w-4 ml-1" />
                                        )
                                      )}
                                    </button>
                                  </th>
                                  <th className="py-3 px-4 text-sm font-medium">
                                    <button onClick={() => handleSort('applicants')} className="flex items-center">
                                      Applicants
                                      {sortConfig?.key === 'applicants' && (
                                        sortConfig.direction === 'asc' ? (
                                          <ArrowUpIcon className="h-4 w-4 ml-1" />
                                        ) : (
                                          <ArrowDownIcon className="h-4 w-4 ml-1" />
                                        )
                                      )}
                                    </button>
                                  </th>
                                  <th className="py-3 px-4 text-sm font-medium">Status</th>
                                  <th className="py-3 px-4 text-sm font-medium">Posted</th>
                                  <th className="py-3 px-4 text-sm font-medium">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedJobs.map((job) => (
                                  <motion.tr
                                    key={job.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-b border-[#22D3EE]/30 hover:bg-[#22D3EE]/10 transition-colors"
                                  >
                                    <td className="py-4 px-4 text-sm">{job.title}</td>
                                    <td className="py-4 px-4 text-sm">{job.department}</td>
                                    <td className="py-4 px-4 text-sm">{job.applicants}</td>
                                    <td className="py-4 px-4 text-sm">
                                      <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                          job.status === 'Open'
                                            ? 'bg-[#10B981]/20 text-[#10B981]'
                                            : 'bg-[#F87171]/20 text-[#F87171]'
                                        }`}
                                      >
                                        {job.status}
                                      </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm">{job.posted}</td>
                                    <td className="py-4 px-4 text-sm">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => navigate(`/jobs/${job.id}`)}
                                        className="text-[#22D3EE] hover:text-[#38BDF8] text-sm font-inter"
                                      >
                                        View
                                      </motion.button>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Pagination */}
                          <div className="flex justify-between items-center mt-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="p-2 bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0F172A] rounded-lg disabled:opacity-70 disabled:cursor-not-allowed font-inter font-semibold"
                            >
                              Previous
                            </motion.button>
                            <span className="text-sm text-[#BAE6FD] font-inter">
                              Page {currentPage} of {totalPages}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="p-2 bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0F172A] rounded-lg disabled:opacity-70 disabled:cursor-not-allowed font-inter font-semibold"
                            >
                              Next
                            </motion.button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Upcoming Interviews */}
                    <motion.div
                      variants={cardVariants}
                      className="bg-[#1E293B]/90 rounded-xl p-6 shadow-md border border-[#22D3EE]/30 glowing-border"
                    >
                      <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4 font-inter">Upcoming Interviews</h3>
                      <div className="space-y-4">
                        {dashboardData.upcomingInterviews.map((interview) => (
                          <motion.div
                            key={interview.id}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-[#22D3EE]/10 rounded-lg hover:bg-[#22D3EE]/20 transition-all cursor-pointer"
                            onClick={() => navigate(`/interviews/${interview.id}`)}
                          >
                            <div>
                              <p className="font-medium text-[#F8FAFC] font-inter">{interview.candidate}</p>
                              <p className="text-sm text-[#BAE6FD] font-inter">{interview.position}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-[#F8FAFC] font-inter">{interview.time}</p>
                              <p className="text-xs text-[#BAE6FD] font-inter">{interview.date}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                      variants={cardVariants}
                      className="bg-[#1E293B]/90 rounded-xl p-6 shadow-md border border-[#22D3EE]/30 glowing-border"
                    >
                      <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4 font-inter">Recent Activity</h3>
                      <div className="space-y-4">
                        {dashboardData.recentActivity.map((activity) => (
                          <motion.div key={activity.id} className="flex items-start space-x-3">
                            <motion.div
                              className={`p-2 rounded-lg ${
                                activity.type === 'job'
                                  ? 'bg-blue-500/20'
                                  : activity.type === 'review'
                                  ? 'bg-green-500/20'
                                  : 'bg-yellow-500/20'
                              }`}
                              variants={iconVariants}
                              whileHover="hover"
                              whileTap="tap"
                              animate="float"
                            >
                              {activity.type === 'job' ? (
                                <BriefcaseIcon className="h-5 w-5 text-blue-400" />
                              ) : activity.type === 'review' ? (
                                <UserIcon className="h-5 w-5 text-[#10B981]" />
                              ) : (
                                <CalendarIcon className="h-5 w-5 text-[#F59E0B]" />
                              )}
                            </motion.div>
                            <div>
                              <button
                                onClick={() => navigate(activity.link)}
                                className="text-sm text-[#F8FAFC] hover:text-[#22D3EE] transition-colors font-inter"
                              >
                                {activity.action}
                              </button>
                              <p className="text-xs text-[#BAE6FD] font-inter">{activity.time}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <motion.div
                variants={cardVariants}
                className="bg-[#1E293B]/90 rounded-xl p-6 shadow-md border border-[#22D3EE]/30 glowing-border"
              >
                <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4 font-inter">Hiring Performance</h3>
                {isLoading ? (
                  <div className="h-96 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-[#22D3EE]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </div>
                ) : (
                  <div className="h-96">
                    <Bar
                      data={performanceChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: { color: '#374151' },
                            ticks: { color: '#BAE6FD', font: { family: 'Inter' } },
                          },
                          x: {
                            grid: { color: '#374151' },
                            ticks: { color: '#BAE6FD', font: { family: 'Inter' } },
                          },
                        },
                        plugins: {
                          legend: { labels: { color: '#BAE6FD', font: { family: 'Inter' } } },
                          tooltip: {
                            backgroundColor: '#1E293B',
                            titleColor: '#F8FAFC',
                            bodyColor: '#F8FAFC',
                            borderColor: '#22D3EE',
                            borderWidth: 1,
                            cornerRadius: 8,
                          },
                        },
                        animation: {
                          duration: 1200,
                          easing: 'easeInOutQuart',
                        },
                      }}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <motion.div
                variants={cardVariants}
                className="bg-[#1E293B]/90 rounded-xl p-6 shadow-md border border-[#22D3EE]/30 glowing-border"
              >
                <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4 font-inter">All Recent Activity</h3>
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity) => (
                    <motion.div key={activity.id} className="flex items-start space-x-3">
                      <motion.div
                        className={`p-2 rounded-lg ${
                          activity.type === 'job'
                            ? 'bg-blue-500/20'
                            : activity.type === 'review'
                            ? 'bg-green-500/20'
                            : 'bg-yellow-500/20'
                        }`}
                        variants={iconVariants}
                        whileHover="hover"
                        whileTap="tap"
                        animate="float"
                      >
                        {activity.type === 'job' ? (
                          <BriefcaseIcon className="h-5 w-5 text-blue-400" />
                        ) : activity.type === 'review' ? (
                          <UserIcon className="h-5 w-5 text-[#10B981]" />
                        ) : (
                          <CalendarIcon className="h-5 w-5 text-[#F59E0B]" />
                        )}
                      </motion.div>
                      <div>
                        <button
                          onClick={() => navigate(activity.link)}
                          className="text-sm text-[#F8FAFC] hover:text-[#22D3EE] transition-colors font-inter"
                        >
                          {activity.action}
                        </button>
                        <p className="text-xs text-[#BAE6FD] font-inter">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Performance Metrics */}
            <motion.div
              variants={cardVariants}
              className="bg-[#1E293B]/90 rounded-xl p-6 shadow-md border border-[#22D3EE]/30 glowing-border"
            >
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4 font-inter">Performance Metrics</h3>
              <div className="space-y-4">
                {Object.entries(dashboardData.performanceMetrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-[#BAE6FD] capitalize text-sm font-inter">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-semibold text-[#F8FAFC] text-sm font-inter">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Chatbot */}
      <div
        className={`fixed bottom-6 right-6 sm:w-96 max-w-[90vw] h-[500px] bg-[#1E293B]/90 rounded-xl shadow-xl border border-[#22D3EE]/30 transform transition-transform duration-300 overflow-y-auto z-50 glowing-border ${
          isChatOpen ? 'translate-y-0' : 'translate-y-[calc(100%+24px)]'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[#22D3EE]/30 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-[#22D3EE]" />
              <h3 className="text-sm font-semibold text-[#F8FAFC] font-inter">Hunter AI Assistant</h3>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearChat}
                className="p-1 rounded-lg hover:bg-[#22D3EE]/10 transition-colors text-sm text-[#BAE6FD] font-inter tooltip"
                data-tooltip="Clear Chat"
              >
                Clear
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-[#22D3EE]/10 transition-colors tooltip"
                data-tooltip="Close Chat"
              >
                <XMarkIcon className="h-5 w-5 text-[#F8FAFC]" />
              </motion.button>
            </div>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-3"
          >
            {chatMessages.map((msg, index) => (
              <motion.div
                key={index}
                variants={chatBubbleVariants}
                initial="hidden"
                animate="visible"
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm font-inter ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0F172A]'
                      : 'bg-[#22D3EE]/10 text-[#F8FAFC]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              </motion.div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="p-2 rounded-lg bg-[#22D3EE]/10 text-[#F8FAFC] text-sm font-inter">
                  <span className="inline-block animate-pulse">Typing...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 border-t border-[#22D3EE]/30">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 p-2 text-sm rounded-lg bg-transparent text-[#F8FAFC] border border-[#22D3EE]/30 focus:outline-none focus:ring-2 focus:ring-[#22D3EE] placeholder-[#BAE6FD] font-inter"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isChatLoading}
                className="p-2 bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-4 w-4 text-[#0F172A]" />
              </motion.button>
            </div>
          </form>
        </div>
      </div>

      {/* Chat Toggle Button */}
      {!isChatOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] rounded-full shadow-lg transition-colors z-40 tooltip"
          data-tooltip="Open Chat"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-[#0F172A]" />
        </motion.button>
      )}

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

        .tooltip {
          position: relative;
        }

        .tooltip:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #1E293B;
          color: #F8FAFC;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 50;
          border: 1px solid #22D3EE;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;