import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, Typography, Button, Grid, Alert, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Application } from '../../types';

interface Schedule {
  id: string;
  applicationId: string;
  userId: string;
  jobId: string;
  date: string; // ISO string, e.g., "2025-05-01T10:00:00Z"
}

const InterviewScheduler: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [applicationId, setApplicationId] = useState<string>('');
  const [application, setApplication] = useState<Application | null>(null);
  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [adminApplications, setAdminApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const params = new URLSearchParams(location.search);
    const appId = params.get('applicationId');
    if (appId && user.role === 'APPLICANT') {
      setApplicationId(appId);
      fetchApplication(appId);
    } else if (user.role === 'ADMIN') {
      fetchAllApplications();
    }
  }, [user, location, navigate]);

  const fetchApplication = async (appId: string) => {
    try {
      const response = await axios.get(`/api/applications/${appId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setApplication(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load application.');
    }
  };

  const fetchAllApplications = async () => {
    try {
      const response = await axios.get('/api/applications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAdminApplications(response.data.filter((app: Application) => app.status === 'PENDING' || app.status === 'REVIEWED'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applications.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!date || !timeSlot || (!applicationId && user?.role !== 'ADMIN')) {
      setError('Please select an application and a date/time.');
      setLoading(false);
      return;
    }

    try {
      const selectedApplicationId = user?.role === 'ADMIN' ? applicationId : application?.id;
      if (!selectedApplicationId) {
        throw new Error('No application selected.');
      }

      const dateTime = new Date(`${date}T${timeSlot}:00Z`).toISOString();
      const response = await axios.post(
        '/api/schedules',
        {
          applicationId: selectedApplicationId,
          userId: application?.userId || user?.id,
          jobId: application?.jobId,
          date: dateTime,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      await axios.patch(
        `/api/applications/${selectedApplicationId}`,
        { status: 'INTERVIEW_SCHEDULED' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccess('Interview scheduled successfully!');
      setTimeout(() => {
        if (user?.role === 'APPLICANT') {
          navigate('/applicant/interview');
        } else {
          navigate('/admin/dashboard');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots (e.g., 9:00 AM to 5:00 PM, every 30 minutes)
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', borderRadius: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon className="h-6 w-6" /> Schedule Interview
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {user?.role === 'ADMIN' && (
                <Grid item xs={12}>
                  <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <InputLabel>Application</InputLabel>
                    <Select
                      value={applicationId}
                      onChange={(e) => {
                        setApplicationId(e.target.value);
                        const selectedApp = adminApplications.find((app) => app.id === e.target.value);
                        setApplication(selectedApp || null);
                      }}
                      label="Application"
                    >
                      <MenuItem value="">Select an application</MenuItem>
                      {adminApplications.map((app) => (
                        <MenuItem key={app.id} value={app.id}>
                          {app.name} - Job ID: {app.jobId}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {user?.role === 'APPLICANT' && application && (
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Application for Job ID: {application.jobId}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Interview Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  <InputLabel>Time Slot</InputLabel>
                  <Select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    label="Time Slot"
                  >
                    <MenuItem value="">Select a time slot</MenuItem>
                    {timeSlots.map((slot) => (
                      <MenuItem key={slot} value={slot}>
                        {slot}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ borderRadius: 2, py: 1.5, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                >
                  {loading ? 'Scheduling...' : 'Schedule Interview'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default InterviewScheduler;
