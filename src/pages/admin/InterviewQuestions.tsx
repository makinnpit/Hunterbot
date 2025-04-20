import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PencilIcon,
  TrashIcon,
  DocumentPlusIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface Job {
  id: string;
  title: string;
}

interface Question {
  id: string;
  text: string;
  createdAt: string;
  jobId: string;
  job: { title: string };
}

const InterviewQuestions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !['RECRUITER', 'ADMIN'].includes(user.role)) {
      navigate('/login');
      return;
    }
    fetchQuestions();
    fetchJobs();
  }, [user, navigate]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/questions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setQuestions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setJobs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load jobs.');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditText(question.text);
  };

  const handleSaveEdit = async (questionId: string) => {
    if (!editText.trim()) {
      setError('Question text cannot be empty.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await axios.put(
        `/api/questions/${questionId}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, text: editText } : q
        )
      );
      setEditingQuestionId(null);
      setEditText('');
      setSuccess('Question updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update question.');
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditText('');
    setError('');
  };

  const handleOpenDeleteDialog = (questionId: string) => {
    setQuestionToDelete(questionId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setQuestionToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/api/questions/${questionToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete));
      setSuccess('Question deleted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete question.');
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const filteredQuestions = questions.filter(
    (q) =>
      (q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.job.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedJobId || q.jobId === selectedJobId)
  );

  const groupedQuestions = filteredQuestions.reduce((acc, q) => {
    const jobTitle = q.job.title;
    if (!acc[jobTitle]) acc[jobTitle] = [];
    acc[jobTitle].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)' },
    tap: { scale: 0.95 },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        bgcolor: 'background.default',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            maxWidth: 800,
            width: '100%',
            borderRadius: 3,
            bgcolor: 'background.paper',
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,240,245,0.9) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              color: 'primary.main',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Interview Questions - Hunter AI
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Manage your AI-generated interview questions
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Search questions or jobs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
              }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Job</InputLabel>
              <Select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                label="Filter by Job"
                sx={{
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                }}
              >
                <MenuItem value="">
                  <em>All Jobs</em>
                </MenuItem>
                {jobs.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress size={40} color="primary" />
            </Box>
          ) : (
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {Object.keys(groupedQuestions).length === 0 ? (
                <Typography color="text.secondary" align="center">
                  No questions found. Generate some first!
                </Typography>
              ) : (
                Object.entries(groupedQuestions).map(([jobTitle, jobQuestions]) => (
                  <Box key={jobTitle} sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', mb: 2 }}
                    >
                      {jobTitle}
                    </Typography>
                    <List>
                      {jobQuestions.map((question) => (
                        <ListItem
                          key={question.id}
                          sx={{
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {editingQuestionId === question.id ? (
                            <Box sx={{ flex: 1 }}>
                              <TextField
                                fullWidth
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                sx={{ mb: 1 }}
                              />
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  component={motion.button}
                                  variants={buttonVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleSaveEdit(question.id)}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Save
                                </Button>
                                <Button
                                  component={motion.button}
                                  variants={buttonVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                  variant="outlined"
                                  size="small"
                                  onClick={handleCancelEdit}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            <>
                              <ListItemText
                                primary={question.text}
                                secondary={`Created: ${new Date(
                                  question.createdAt
                                ).toLocaleDateString()}`}
                              />
                              <IconButton
                                onClick={() => handleEdit(question)}
                                sx={{ mr: 1 }}
                              >
                                <PencilIcon className="h-5 w-5" />
                              </IconButton>
                              <IconButton
                                onClick={() =>
                                  handleOpenDeleteDialog(question.id)
                                }
                              >
                                <TrashIcon className="h-5 w-5" />
                              </IconButton>
                            </>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))
              )}
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
            <Button
              component={motion.button}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              variant="contained"
              startIcon={<DocumentPlusIcon className="h-5 w-5" />}
              onClick={() => navigate('/recruiter/question-generator')}
              sx={{
                borderRadius: 2,
                py: 1.5,
                flex: 1,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              Generate Questions
            </Button>
            <Button
              component={motion.button}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              variant="outlined"
              startIcon={<HomeIcon className="h-5 w-5" />}
              onClick={() => navigate('/recruiter/home')}
              sx={{ borderRadius: 2, py: 1.5, flex: 1 }}
            >
              Go to Home
            </Button>
          </Box>
        </Paper>
      </motion.div>
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this question? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            component={motion.button}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleDelete}
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewQuestions;