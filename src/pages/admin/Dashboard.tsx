import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Cog6ToothIcon,
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
      hiringEfficiency: '92%'
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
        backgroundColor: ['#0D6EFD', '#10B981', '#F59E0B', '#22D3EE'], // Blue, Green, Amber, Cyan
        borderColor: ['var(--card-background)', 'var(--card-background)', 'var(--card-background)', 'var(--card-background)'],
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
        backgroundColor: '#0D6EFD', // Blue
        borderColor: '#0D6EFD',
        borderWidth: 1,
        tension: 0.4,
      },
    ],
  };

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const chatBubbleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-[var(--background)] relative" style={{ overflowX: 'hidden' }}>
      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--accent-primary)] rounded-lg"
      >
        <Bars3Icon className="h-6 w-6 text-white" />
      </motion.button>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 bg-[var(--card-background)]/95 backdrop-blur-lg z-40 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2"
          >
            <XMarkIcon className="h-6 w-6 text-[var(--text-primary)]" />
          </motion.button>
          <div className="space-y-2">
            {['overview', 'analytics', 'activity'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full p-3 text-left rounded-lg flex items-center space-x-2 text-sm font-medium ${
                  activeTab === tab
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--text-primary)] hover:bg-gray-700/50'
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
              className="w-full p-3 text-left rounded-lg flex items-center space-x-2 text-sm font-medium text-[var(--text-primary)] hover:bg-gray-700/50"
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-start)]/5 to-[var(--gradient-end)]/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(13,110,253,0.05)_0%,transparent_70%)] pointer-events-none" />

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
          } bg-[var(--card-background)]/95 backdrop-blur-lg border-r border-gray-700/50 z-30`}
        >
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              {!isSidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">{brandName}</h1>
              </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className={`h-5 w-5 text-[var(--text-primary)] transition-transform ${
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
                  } text-sm font-medium ${
                    activeTab === tab
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'text-[var(--text-primary)] hover:bg-gray-700/50'
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
                } text-sm font-medium text-[var(--text-primary)] hover:bg-gray-700/50 ${isSidebarCollapsed ? 'tooltip' : ''}`}
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
          } overflow-y-auto no-scrollbar`}
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
                  className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
                  initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Welcome Back, Troy
                </motion.h1>
                <motion.p 
                  className="text-[var(--text-secondary)] mt-2"
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
                  className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-dark)] text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Post New Job
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon className="h-5 w-5" />}
                  onClick={() => navigate('/admin/schedule')}
                  className="border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  Schedule Interview
                </Button>
                  </motion.div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Active Jobs',
                  value: dashboardData.activeJobs,
                  change: '+15%',
                  trend: 'up',
                  icon: BriefcaseIcon,
                  color: 'blue'
                },
                {
                  title: 'Total Candidates',
                  value: dashboardData.candidateStages.applied,
                  change: '+32%',
                  trend: 'up',
                  icon: UserGroupIcon,
                  color: 'purple'
                },
                {
                  title: 'Time to Hire',
                  value: '24 days',
                  change: '-3 days',
                  trend: 'down',
                  icon: ClockIcon,
                  color: 'green'
                },
                {
                  title: 'Hiring Rate',
                  value: '92%',
                  change: '+5%',
                  trend: 'up',
                  icon: ChartBarIcon,
                  color: 'orange'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  variants={cardVariants}
                  custom={index}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent rounded-xl transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
                  <div className="relative bg-[var(--card-background)] rounded-xl p-6 border border-[var(--glass-border)] shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                        <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        stat.trend === 'up' ? 'text-[var(--success)]' : 'text-[var(--error)]'
                      }`}>
                        {stat.trend === 'up' ? (
                          <ArrowTrendingUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4" />
                        )}
                        <span>{stat.change}</span>
              </div>
            </div>
                    <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-1">{stat.title}</h3>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
          </div>
                </motion.div>
              ))}
        </div>

          {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-700 mb-8">
            {['overview', 'analytics', 'activity'].map((tab) => (
                <motion.button
                key={tab}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab)}
                  className={`relative pb-3 px-2 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab
                      ? 'text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent-primary)] rounded-t-md"
                    />
                  )}
                </motion.button>
            ))}
          </div>

          {/* Quick Stats */}
          {activeTab === 'overview' && (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {[
                    {
                      title: 'Active Jobs',
                      value: dashboardData.activeJobs,
                      icon: BriefcaseIcon,
                      trend: '+2 this week',
                      color: 'blue', // Using blue for consistency
                      details: ['Engineering: 5', 'Analytics: 3', 'Product: 4'],
                    },
                    {
                      title: 'Total Candidates',
                      value: Object.values(dashboardData.candidateStages).reduce((a, b) => a + b, 0),
                      icon: UserGroupIcon,
                      trend: '+15 this week',
                      color: 'green',
                      details: [
                        `Applied: ${dashboardData.candidateStages.applied}`,
                        `Interviewed: ${dashboardData.candidateStages.interviewed}`,
                        `Shortlisted: ${dashboardData.candidateStages.shortlisted}`,
                        `Hired: ${dashboardData.candidateStages.hired}`,
                      ],
                    },
                    {
                      title: 'Time to Hire',
                      value: dashboardData.performanceMetrics.timeToHire,
                      icon: ClockIcon,
                      trend: '-2 days from last month',
                      color: 'yellow',
                      details: ['Average: 24 days', 'Fastest: 18 days (Engineering)', 'Slowest: 30 days (Analytics)'],
                    },
                    {
                      title: 'Offer Acceptance',
                      value: dashboardData.performanceMetrics.offerAcceptance,
                      icon: ChartBarIcon,
                      trend: '+5% from last month',
                      color: 'cyan', // Using cyan instead of purple
                      details: ['Total Offers: 20', 'Accepted: 17', 'Declined: 3'],
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      variants={cardVariants}
                      custom={index}
                      className="group relative"
                    >
                      <div className={`relative bg-[var(--card-background)] rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-700/50 overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/10 to-transparent opacity-50 group-hover:opacity-75 transition-opacity`} />
                        <div className="relative flex items-center justify-between">
                      <div>
                            <p className="text-sm font-medium text-[var(--text-secondary)]">{stat.title}</p>
                            <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{stat.value}</p>
                      </div>
                          <div className={`p-3 bg-${stat.color}-500/20 rounded-lg group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-[var(--success)]">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                          <span>{stat.trend}</span>
                    </div>
                  </div>
                      <div className="absolute inset-0 bg-[var(--card-background)] rounded-2xl p-6 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <p className="text-sm font-medium text-[var(--text-secondary)]">{stat.title} Breakdown</p>
                    <ul className="mt-2 text-sm text-[var(--text-primary)] space-y-1">
                          {stat.details.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                    </ul>
                  </div>
                </motion.div>
                  ))}
              </div>

              {/* Quick Actions */}
              <motion.div
                variants={cardVariants}
                  className="bg-[var(--card-background)] rounded-2xl p-6 shadow-md mb-10 border border-gray-700/50"
              >
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
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
                        className="flex items-center px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[#0B5ED7] transition-colors shadow-md hover:shadow-lg"
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
                      className="bg-[var(--card-background)] rounded-2xl p-6 shadow-md border border-gray-700/50"
                  >
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Candidate Stages</h3>
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
                                color: 'var(--text-secondary)',
                                font: { family: 'var(--font-family)', size: 12 },
                                  padding: 20,
                              },
                            },
                            tooltip: {
                              backgroundColor: 'var(--card-background)',
                              titleColor: 'var(--text-primary)',
                              bodyColor: 'var(--text-primary)',
                              borderColor: 'var(--accent-primary)',
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
                  </motion.div>

                  {/* Recent Jobs Table */}
                  <motion.div
                    variants={cardVariants}
                      className="bg-[var(--card-background)] rounded-2xl p-6 shadow-md border border-gray-700/50"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Jobs</h3>
                        <div className="flex space-x-2">
                          <select
                            value={jobFilter}
                            onChange={(e) => setJobFilter(e.target.value)}
                            className="p-2 rounded-lg bg-[var(--input-background)] text-[var(--text-primary)] border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-sm"
                          >
                            <option value="All">All</option>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                          </select>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={exportToCSV}
                            className="p-2 bg-[var(--accent-secondary)] text-white rounded-lg flex items-center space-x-1 text-sm"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            <span>Export</span>
                          </motion.button>
                        </div>
                      </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[var(--text-primary)]">
                        <thead>
                          <tr className="border-b border-gray-700">
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
                                className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                              >
                                <td className="py-4 px-4 text-sm">{job.title}</td>
                                <td className="py-4 px-4 text-sm">{job.department}</td>
                                <td className="py-4 px-4 text-sm">{job.applicants}</td>
                                <td className="py-4 px-4 text-sm">
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                    job.status === 'Open'
                                      ? 'bg-[var(--success)]/20 text-[var(--success)]'
                                      : 'bg-[var(--error)]/20 text-[var(--error)]'
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
                                    className="text-[var(--accent-primary)] hover:text-[#0B5ED7] text-sm"
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
                          className="p-2 bg-[var(--accent-primary)] text-white rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                          Previous
                        </motion.button>
                        <span className="text-sm text-[var(--text-secondary)]">
                          Page {currentPage} of {totalPages}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 bg-[var(--accent-primary)] text-white rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                          Next
                        </motion.button>
                      </div>
                  </motion.div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Upcoming Interviews */}
                  <motion.div
                    variants={cardVariants}
                      className="bg-[var(--card-background)] rounded-2xl p-6 shadow-md border border-gray-700/50"
                  >
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Upcoming Interviews</h3>
                    <div className="space-y-4">
                      {dashboardData.upcomingInterviews.map((interview) => (
                          <motion.div
                          key={interview.id}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-600/50 transition-all cursor-pointer"
                          onClick={() => navigate(`/interviews/${interview.id}`)}
                        >
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{interview.candidate}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{interview.position}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-[var(--text-primary)]">{interview.time}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{interview.date}</p>
                          </div>
                          </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div
                    variants={cardVariants}
                      className="bg-[var(--card-background)] rounded-2xl p-6 shadow-md border border-gray-700/50"
                  >
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {dashboardData.recentActivity.map((activity) => (
                          <motion.div key={activity.id} className="flex items-start space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              activity.type === 'job'
                                ? 'bg-blue-500/20'
                                : activity.type === 'review'
                                ? 'bg-green-500/20'
                                : 'bg-yellow-500/20'
                            }`}
                          >
                            {activity.type === 'job' ? (
                              <BriefcaseIcon className="h-5 w-5 text-blue-400" />
                            ) : activity.type === 'review' ? (
                              <UserIcon className="h-5 w-5 text-[var(--success)]" />
                            ) : (
                              <CalendarIcon className="h-5 w-5 text-[var(--warning)]" />
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => navigate(activity.link)}
                              className="text-sm text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                            >
                              {activity.action}
                            </button>
                            <p className="text-xs text-[var(--text-secondary)]">{activity.time}</p>
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
                className="bg-[var(--card-background)] rounded-2xl p-6 shadow-md border border-gray-700/50"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Hiring Performance</h3>
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
                        ticks: { color: 'var(--text-secondary)', font: { family: 'var(--font-family)' } },
                      },
                      x: {
                        grid: { color: '#374151' },
                        ticks: { color: 'var(--text-secondary)', font: { family: 'var(--font-family)' } },
                      },
                    },
                    plugins: {
                      legend: { labels: { color: 'var(--text-secondary)', font: { family: 'var(--font-family)' } } },
                      tooltip: {
                        backgroundColor: 'var(--card-background)',
                        titleColor: 'var(--text-primary)',
                        bodyColor: 'var(--text-primary)',
                        borderColor: 'var(--accent-primary)',
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
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <motion.div
              variants={cardVariants}
                className="bg-[var(--card-background)] rounded-2xl p-6 shadow-md border border-gray-700/50"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">All Recent Activity</h3>
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                    <motion.div key={activity.id} className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        activity.type === 'job'
                          ? 'bg-blue-500/20'
                          : activity.type === 'review'
                          ? 'bg-green-500/20'
                          : 'bg-yellow-500/20'
                      }`}
                    >
                      {activity.type === 'job' ? (
                        <BriefcaseIcon className="h-5 w-5 text-blue-400" />
                      ) : activity.type === 'review' ? (
                        <UserIcon className="h-5 w-5 text-[var(--success)]" />
                      ) : (
                        <CalendarIcon className="h-5 w-5 text-[var(--warning)]" />
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => navigate(activity.link)}
                        className="text-sm text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                      >
                        {activity.action}
                      </button>
                      <p className="text-xs text-[var(--text-secondary)]">{activity.time}</p>
                    </div>
                    </motion.div>
                ))}
              </div>
            </motion.div>
          )}

            {/* Performance Metrics and Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <motion.div
                variants={cardVariants}
                className="bg-[var(--card-background)] rounded-2xl p-6 shadow-md border border-gray-700/50"
              >
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  {Object.entries(dashboardData.performanceMetrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-[var(--text-secondary)] capitalize text-sm">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-semibold text-[var(--text-primary)] text-sm">{value}</span>
                    </div>
                  ))}
                </div>
        </motion.div>

              <motion.div
                variants={cardVariants}
                className="bg-[var(--card-background)] rounded-2xl p-6 shadow-md border border-gray-700/50"
              >
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'job' ? 'bg-blue-500/20' :
                        activity.type === 'review' ? 'bg-green-500/20' :
                        'bg-yellow-500/20'
                      }`}>
                        {activity.type === 'job' ? <BriefcaseIcon className="h-5 w-5 text-blue-400" /> :
                         activity.type === 'review' ? <UserIcon className="h-5 w-5 text-[var(--success)]" /> :
                         <CalendarIcon className="h-5 w-5 text-[var(--warning)]" />}
      </div>
                      <div>
                        <p className="text-sm text-[var(--text-primary)]">{activity.action}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Chatbot */}
      <div
        className={`fixed bottom-6 right-6 sm:w-96 max-w-[90vw] h-[500px] bg-[var(--card-background)] rounded-2xl shadow-xl border border-gray-700/50 transform transition-transform duration-300 overflow-y-auto no-scrollbar z-50 ${
          isChatOpen ? 'translate-y-0' : 'translate-y-[calc(100%+24px)]'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-[var(--accent-primary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Hunter AI Assistant</h3>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearChat}
                className="p-1 rounded-lg hover:bg-gray-700/50 transition-colors text-sm text-[var(--text-secondary)]"
              >
                Clear
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-[var(--text-primary)]" />
              </motion.button>
            </div>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar"
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
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-gray-700/50 text-[var(--text-primary)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              </motion.div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="p-2 rounded-lg bg-gray-700/50 text-[var(--text-primary)] text-sm">
                  <span className="inline-block animate-pulse">Typing...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 p-2 text-sm rounded-lg bg-[var(--input-background)] text-[var(--text-primary)] border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] placeholder-gray-400"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isChatLoading}
                className="p-2 bg-[var(--accent-primary)] rounded-lg hover:bg-[#0B5ED7] transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-4 w-4 text-white" />
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
          className="fixed bottom-6 right-6 p-3 bg-[var(--accent-primary)] rounded-full shadow-lg hover:bg-[#0B5ED7] transition-colors z-40"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
        </motion.button>
      )}
    </div>
  );
};

export default Dashboard;