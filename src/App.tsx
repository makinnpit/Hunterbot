import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import theme from './styles/theme';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirmation';
import Profile from './pages/Profile';
import ApplicationForm from './pages/JobApplicationForm';
import ApplicantOnBoarding from './pages/applicant/ApplicantOnboarding';
import InterviewScheduler from './pages/applicant/InterviewScheduler';
import AdminHome from './pages/admin/Dashboard';
import CandidatesList from './pages/admin/CandidatesList';
import InterviewResults from './pages/admin/InterviewResults';
import CreateJob from './pages/admin/CreateJob';
import AdminJobs from './pages/admin/AdminJobs';
import Settings from './pages/admin/Settings'; 

// Types
interface InterviewResultsWrapperProps {
  [key: string]: string | undefined;
  candidateId?: string;
}

interface CreateJobWrapperProps {}

// Wrapper Components
const InterviewResultsWrapper: React.FC = () => {
  const { candidateId } = useParams<InterviewResultsWrapperProps>();
  return <InterviewResults candidateId={Number(candidateId)} />;
};

const CreateJobWrapper: React.FC = () => {
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
    navigate('/admin/home');
  };

  return <CreateJob open={open} onClose={handleClose} />;
};

// Routes Component
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Applicant Routes */}
          <Route path="/applicant/apply/:jobId" element={<ApplicationForm />} />
          <Route path="/applicant/profile" element={<Profile />} />
          <Route path="/applicant/onboarding" element={<ApplicantOnBoarding />} />
          <Route path="/applicant/scheduler" element={<InterviewScheduler />} />

          {/* Admin Routes */}
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/create-job" element={<CreateJobWrapper />} />
          <Route
            path="/admin/candidates"
            element={<CandidatesList onSelectCandidate={(id) => navigate(`/admin/interview/${id}`)} />}
          />
          <Route path="/admin/interview/:candidateId" element={<InterviewResultsWrapper />} />
          <Route path="/admin/settings" element={<Settings />} /> 

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
