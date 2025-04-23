import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Grid, InputAdornment, Alert } from '@mui/material';
import { UserIcon, EnvelopeIcon, PhoneIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import axios from 'axios';

const JobApplicationForm: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume: null as File | null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, resume: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.resume || !jobId) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      // Upload resume
      const resumeFormData = new FormData();
      resumeFormData.append('resume', formData.resume);
      const uploadResponse = await axios.post('/api/upload', resumeFormData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const resumeUrl = uploadResponse.data.filePath;

      // Submit application
      const applicationResponse = await axios.post(
        '/api/applications',
        {
          jobId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          resumeUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const applicationId = applicationResponse.data.id;
      navigate(`/applicant/scheduler?applicationId=${applicationId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, bgcolor: 'background.default' }}>
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 600, borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            Job Application
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Please fill out the form below to apply.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ borderRadius: 2, py: 1.5, textTransform: 'none', borderColor: 'grey.400' }}
                  startIcon={<DocumentIcon className="h-5 w-5" />}
                >
                  {formData.resume ? formData.resume.name : 'Upload CV/Resume'}
                  <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default JobApplicationForm;