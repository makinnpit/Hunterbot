import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import theme from './styles/theme';

// Pages
import ApplicationForm from './pages/JobApplicationForm';
import ApplicantOnBoarding from './pages/applicant/ApplicantOnboarding';
import AdminHome from './pages/admin/Dashboard';
import CandidatesList from './pages/admin/CandidatesList';
import CreateJob from './pages/admin/CreateJob';
import AdminJobs from './pages/admin/AdminJobs';
import Settings from './pages/admin/Settings';

// Types
interface InterviewResultsWrapperProps {
  [key: string]: string | undefined;
  candidateId?: string;
}

interface CreateJobWrapperProps {}



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

          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Applicant Routes */}
          <Route path="/applicant/apply/:jobId" element={<ApplicationForm />} />
          <Route path="/applicant/onboarding" element={<ApplicantOnBoarding />} />

          {/* Admin Routes */}
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/create-job" element={<CreateJobWrapper />} />
          <Route
            path="/admin/candidates"
            element={<CandidatesList onSelectCandidate={(id) => navigate(`/admin/interview/${id}`)} />}
          />
          <Route path="/admin/settings" element={<Settings />} /> 

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/admin/home" replace />} />
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