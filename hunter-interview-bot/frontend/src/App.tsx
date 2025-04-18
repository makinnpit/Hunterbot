import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import theme from './styles/theme.ts';
import InterviewScheduler from './pages/applicant/InterviewScheduler.tsx';

// Public Pages
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';

// Applicant Pages
import ApplicationForm from './pages/JobApplicationForm.tsx';
import ResetPasswordConfirm from './pages/ResetPasswordConfirmation.tsx';
import Profile from './pages/Profile.tsx';
import ApplicantOnBoarding from './pages/applicant/ApplicantOnboarding.tsx';

// Admin Pages
import JobsManagement from './pages/admin/JobsManagement.tsx';
import CandidatesList from './pages/admin/CandidatesList.tsx';
import InterviewResults from './pages/admin/InterviewResults.tsx';
import AdminHome from './pages/admin/AdminHome.tsx';
import CreateJob from './pages/admin/CreateJob.tsx';

// Admin login credentials
export const ADMIN_CREDENTIALS = {
  id: '1',
  email: 'admin@hunterai.com',
  password: 'admin123',
  role: 'ADMIN' as const,
  name: 'Admin User'
};

// Mock auth context for public access
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockAuthContext = {
    user: ADMIN_CREDENTIALS,
    isAuthenticated: true,
    loading: false,
    error: null,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
    resetPassword: async () => {},
  };

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

const InterviewResultsWrapper: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  return <InterviewResults candidateId={Number(candidateId)} />;
};

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="hunter-app">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Applicant Routes - Public */}
            <Route path="/applicant/apply/:jobId" element={<ApplicationForm />} />
            <Route path="/applicant/profile" element={<Profile />} />
            <Route path="/applicant/onboarding" element={<ApplicantOnBoarding />} />
            <Route path="/applicant/scheduler" element={<InterviewScheduler />} />

            {/* Admin Routes - Public */}
            <Route path="/admin/jobs" element={<JobsManagement />} />
            <Route path="/admin/jobs/create" element={<CreateJob />} />
            <Route path="/admin/home" element={<AdminHome />} />
            <Route
              path="/admin/candidates"
              element={<CandidatesList onSelectCandidate={(id) => navigate(`/admin/interview/${id}`)} />}
            />
            <Route path="/admin/interview/:candidateId" element={<InterviewResultsWrapper />} />

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MockAuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </MockAuthProvider>
    </ThemeProvider>
  );
};

export default App;