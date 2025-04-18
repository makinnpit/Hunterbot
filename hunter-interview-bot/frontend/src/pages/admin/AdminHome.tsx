import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Grid, Paper, Divider } from '@mui/material';
import { PlusIcon, BriefcaseIcon, UserIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Create New Job', icon: PlusIcon, path: '/jobs/create' },
    { label: 'Jobs', icon: BriefcaseIcon, path: '/jobs' },
    { label: 'Candidate', icon: UserIcon, path: '/candidates' },
    { label: 'Report', icon: ChartBarIcon, path: '/reports' },
  ];

  return (
    <AppBar
      position="fixed"
      sx={{
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
        <Typography
          variant="h6"
          sx={{
            background: 'linear-gradient(45deg, #3b82f6, #9333ea)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          HUNTER AI
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
          {navItems.map((item) => (
            <Button
              key={item.label}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              startIcon={<item.icon className="h-4 w-4" />}
              sx={{
                textTransform: 'none',
                color: 'text.primary',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const Dashboard: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const dashboardData = {
    activeJobs: 12,
    applicantsPerJob: 45,
    candidateStages: {
      interviewed: 28,
      shortlisted: 15,
      hired: 8,
    },
    notifications: [
      { id: 1, message: 'New application for Software Engineer role', time: '2 hours ago' },
      { id: 2, message: 'AI analysis completed for Data Scientist candidates', time: '4 hours ago' },
    ],
  };

  return (
    <Box sx={{ pt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 }, minHeight: '100vh' }}>
      <Navbar />
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            background: 'linear-gradient(45deg, #3b82f6, #9333ea)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
          }}
        >
          Dashboard Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={cardVariants}>
              <Paper className="hunter-card" sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" color="text.secondary">
                  Active Job Posts
                </Typography>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {dashboardData.activeJobs}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={cardVariants}>
              <Paper className="hunter-card" sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" color="text.secondary">
                  Applicants/Job
                </Typography>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {dashboardData.applicantsPerJob}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={cardVariants}>
              <Paper className="hunter-card" sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" color="text.secondary">
                  Candidate Stages
                </Typography>
                <Typography color="text.primary">
                  Interviewed: {dashboardData.candidateStages.interviewed}
                </Typography>
                <Typography color="text.primary">
                  Shortlisted: {dashboardData.candidateStages.shortlisted}
                </Typography>
                <Typography color="text.primary">
                  Hired: {dashboardData.candidateStages.hired}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={cardVariants}>
              <Paper className="hunter-card" sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Notifications
                </Typography>
                {dashboardData.notifications.map((notification) => (
                  <Box key={notification.id} sx={{ mb: 1 }}>
                    <Typography color="text.primary" variant="body2">
                      {notification.message}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      {notification.time}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                  </Box>
                ))}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default Dashboard;