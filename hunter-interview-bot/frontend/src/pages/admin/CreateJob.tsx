import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Chip,
  Button,
  Checkbox,
  FormControlLabel,
  Modal,
  Divider,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    description: '',
    skills: [] as string[],
    customQuestions: '',
    questionTemplate: '',
    numQuestions: 5,
    aiScoreThreshold: 80,
    postToLinkedIn: false,
    postToIndeed: false,
    geminiApiKey: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const departments = ['Engineering', 'Marketing', 'Sales', 'Operations', 'HR'];
  const questionTemplates = ['Technical Interview', 'Behavioral Interview', 'General'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSkillAdd = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const handleSkillDelete = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const generateAIQuestions = async () => {
    if (!formData.geminiApiKey) {
      setError('Please provide a Gemini API key');
      return;
    }
    if (!formData.jobTitle) {
      setError('Please enter a job title to generate questions');
      return;
    }

    setLoadingAI(true);
    setError('');
    try {
      const mockQuestions = `1. What experience do you have with ${formData.jobTitle} responsibilities?\n2. How would you handle a challenging project in ${formData.jobTitle}?\n3. Describe a time you improved a process related to ${formData.jobTitle}.`;
      setFormData({ ...formData, customQuestions: mockQuestions });
    } catch (err) {
      setError('Failed to generate AI questions. Please check your API key.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.jobTitle || !formData.department || !formData.description) {
      setError('Job Title, Department, and Description are required');
      return;
    }

    console.log('Creating job:', formData);
    setModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: { xs: 8, sm: 10 },
        px: { xs: 2, sm: 3 },
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Paper
          elevation={12}
          className="hunter-card"
          sx={{
            width: '100%',
            maxWidth: { xs: 500, sm: 600 },
            p: { xs: 3, sm: 4 },
          }}
        >
          <motion.div variants={childVariants}>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                background: 'linear-gradient(45deg, #3b82f6, #9333ea)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
              }}
            >
              Create New Job Listing
            </Typography>
          </motion.div>

          {error && (
            <motion.div variants={childVariants}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div variants={childVariants}>
              <TextField
                fullWidth
                label="Job Title"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                required
                margin="normal"
              />
            </motion.div>
            <motion.div variants={childVariants}>
              <Select
                fullWidth
                name="department"
                value={formData.department}
                onChange={handleSelectChange}
                displayEmpty
                margin="dense"
                sx={{ mt: 2 }}
              >
                <MenuItem value="" disabled>
                  Select Department
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </motion.div>
            <motion.div variants={childVariants}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
                margin="normal"
              />
            </motion.div>
            <motion.div variants={childVariants}>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Skills / Keywords"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSkillAdd()}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={handleSkillAdd}
                        sx={{ color: 'primary.main', textTransform: 'none' }}
                      >
                        Add
                      </Button>
                    ),
                  }}
                />
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onDelete={() => handleSkillDelete(skill)}
                    />
                  ))}
                </Box>
              </Box>
            </motion.div>
            <motion.div variants={childVariants}>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Gemini API Key"
                  name="geminiApiKey"
                  value={formData.geminiApiKey}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <Button
                  component={motion.button}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={generateAIQuestions}
                  disabled={loadingAI}
                  startIcon={<SparklesIcon className="h-5 w-5" />}
                  sx={{
                    mt: 2,
                    color: 'primary.main',
                    textTransform: 'none',
                  }}
                >
                  {loadingAI ? 'Generating...' : 'Generate AI Questions'}
                </Button>
              </Box>
            </motion.div>
            <motion.div variants={childVariants}>
              <TextField
                fullWidth
                label="Custom Questions"
                name="customQuestions"
                value={formData.customQuestions}
                onChange={handleInputChange}
                multiline
                rows={4}
                margin="normal"
              />
            </motion.div>
            <motion.div variants={childVariants}>
              <Select
                fullWidth
                name="questionTemplate"
                value={formData.questionTemplate}
                onChange={handleSelectChange}
                displayEmpty
                margin="dense"
                sx={{ mt: 2 }}
              >
                <MenuItem value="" disabled>
                  Select Question Template (Optional)
                </MenuItem>
                {questionTemplates.map((template) => (
                  <MenuItem key={template} value={template}>
                    {template}
                  </MenuItem>
                ))}
              </Select>
            </motion.div>
            <motion.div variants={childVariants}>
              <TextField
                fullWidth
                label="Number of Interview Questions"
                name="numQuestions"
                type="number"
                value={formData.numQuestions}
                onChange={handleInputChange}
                inputProps={{ min: 1 }}
                margin="normal"
              />
            </motion.div>
            <motion.div variants={childVariants}>
              <TextField
                fullWidth
                label="AI Score Threshold (%)"
                name="aiScoreThreshold"
                type="number"
                value={formData.aiScoreThreshold}
                onChange={handleInputChange}
                inputProps={{ min: 0, max: 100 }}
                margin="normal"
              />
            </motion.div>
            <motion.div variants={childVariants}>
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="postToLinkedIn"
                      checked={formData.postToLinkedIn}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Post to LinkedIn"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="postToIndeed"
                      checked={formData.postToIndeed}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Post to Indeed"
                />
              </Box>
            </motion.div>
            <motion.div variants={childVariants}>
              <Button
                component={motion.button}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                fullWidth
                variant="contained"
                className="hunter-button hunter-button-primary"
                sx={{ mt: 3 }}
              >
                Create Job
              </Button>
            </motion.div>
          </form>
        </Paper>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            maxHeight: '80vh',
            overflowY: 'auto',
            p: { xs: 2, sm: 3 },
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              background: 'linear-gradient(45deg, #3b82f6, #9333ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Job Created Successfully
          </Typography>
          <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
            <strong>Job Title:</strong> {formData.jobTitle}
          </Typography>
          <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
            <strong>Department:</strong> {formData.department}
          </Typography>
          <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
            <strong>Posting:</strong>{' '}
            {formData.postToLinkedIn && formData.postToIndeed
              ? 'LinkedIn, Indeed'
              : formData.postToLinkedIn
              ? 'LinkedIn'
              : formData.postToIndeed
              ? 'Indeed'
              : 'Not posted'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
            Next Steps
          </Typography>
          <Box component="ol" sx={{ pl: 3, color: 'text.primary' }}>
            <li>
              <Typography variant="body2">
                <strong>Job Creation:</strong> Job listing has been created and saved.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>AI Analysis:</strong> HUNTER AI will analyze applications using configured metrics.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Posting:</strong> Job will be posted to selected platforms (if any).
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Candidate Review:</strong> Monitor applications in the Candidates dashboard.
              </Typography>
            </li>
          </Box>
          <Button
            component={motion.button}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => {
              setModalOpen(false);
              navigate('/jobs');
            }}
            fullWidth
            variant="contained"
            className="hunter-button hunter-button-primary"
            sx={{ mt: 2 }}
          >
            Go to Jobs
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default CreateJob;