import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  CircularProgress,
  Modal,
  Chip,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  InputAdornment,
  SelectChangeEvent,
  TextFieldProps,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Badge,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  CpuChipIcon,
  CommandLineIcon,
  LightBulbIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  StarIcon,
  ShieldCheckIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
}

interface Template {
  id: string;
  name: string;
  content: string;
}

interface Company {
  name: string;
  jobs: string[];
}

interface GeneratedQuestion {
  category: string;
  question: string;
  difficulty: string;
  complexity: number;
  estimatedTime: number;
  keyPoints: string[];
}

interface FormData {
  jobTitle: string;
  deadline: string;
  language: string;
  timezone: string;
  description: string;
  customQuestions: string;
  skills: string[];
  experience: string;
  salary: string;
  location: string;
  remote: boolean;
  assessment: boolean;
  candidates: string[];
  newSkill: string;
  newCandidate: string;
  interviewRounds: number;
  codingChallenge: boolean;
  systemDesign: boolean;
  pairProgramming: boolean;
  company: string;
}

const steps = ['Setup', 'Questions', 'Customization', 'Invite Candidate'];

const companies: Company[] = [
  {
    name: 'Outrank Strategy',
    jobs: [
      'SEO Specialist',
      'Content Strategist',
      'Digital Marketing Manager',
      'PPC Specialist',
      'Social Media Manager',
      'Web Analytics Specialist',
      'Technical SEO Expert',
      'Content Writer',
      'Link Building Specialist',
      'SEO Project Manager'
    ]
  },
  {
    name: 'Google',
    jobs: ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer']
  },
  {
    name: 'Microsoft',
    jobs: ['Software Developer', 'Cloud Architect', 'ML Engineer', 'Program Manager', 'Full Stack Developer']
  },
  {
    name: 'Amazon',
    jobs: ['SDE', 'Solutions Architect', 'Technical Program Manager', 'Research Scientist', 'Frontend Engineer']
  },
  {
    name: 'Meta',
    jobs: ['Software Engineer', 'Product Designer', 'Data Engineer', 'Research Engineer', 'Security Engineer']
  },
  {
    name: 'Apple',
    jobs: ['iOS Developer', 'Machine Learning Engineer', 'Systems Engineer', 'Software Architect', 'QA Engineer']
  }
];

const questionTypes = [
  { value: 'technical', label: 'Technical', icon: CodeBracketIcon },
  { value: 'behavioral', label: 'Behavioral', icon: UserIcon },
  { value: 'system-design', label: 'System Design', icon: CpuChipIcon },
  { value: 'coding', label: 'Coding', icon: CommandLineIcon },
  { value: 'problem-solving', label: 'Problem Solving', icon: LightBulbIcon },
];

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner', color: '#10B981' },
  { value: 'intermediate', label: 'Intermediate', color: '#F59E0B' },
  { value: 'advanced', label: 'Advanced', color: '#EF4444' },
  { value: 'expert', label: 'Expert', color: '#8B5CF6' },
];

const CreateJobModal: React.FC<CreateJobModalProps> = ({ open, onClose }): JSX.Element => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    jobTitle: '',
    deadline: '',
    language: '',
    timezone: '',
    description: '',
    customQuestions: '',
    skills: [],
    experience: '',
    salary: '',
    location: '',
    remote: false,
    assessment: false,
    candidates: [],
    newSkill: '',
    newCandidate: '',
    interviewRounds: 1,
    codingChallenge: false,
    systemDesign: false,
    pairProgramming: false,
    company: '',
  });
  const [error, setError] = useState<string | undefined>(undefined);
  const [loadingAI, setLoadingAI] = useState(false);
  const [questionType, setQuestionType] = useState('technical');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficultyLevel, setDifficultyLevel] = useState('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Template[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const templateInputRef = useRef<HTMLInputElement>(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [availableJobs, setAvailableJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(['technical']);
  const [questionComplexity, setQuestionComplexity] = useState<number>(3);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const languages = ['English', 'Spanish', 'French', 'German'];
  const timezones = ['UTC', 'EST', 'PST', 'CET'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Principal'];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCompanyChange = (e: SelectChangeEvent<string>) => {
    const company = e.target.value;
    setSelectedCompany(company);
    const jobs = companies.find(c => c.name === company)?.jobs || [];
    setAvailableJobs(jobs);
    setFormData({ ...formData, jobTitle: '', company });
  };

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationProgress((prev) => (prev >= 100 ? 0 : prev + 10));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const generateQuestionsWithGemini = async (
    jobTitle: string,
    questionTypes: string[],
    difficultyLevel: string,
    count: number,
    complexity: number
  ): Promise<GeneratedQuestion[]> => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      const prompt = `You are an expert interviewer. Generate ${count} interview questions for a ${jobTitle} position.
      
Format your response as a valid JSON array ONLY, with no additional text. Example format:
[
  {
    "category": "Social Media Strategy",
    "question": "Describe your experience developing and implementing a social media content calendar. What metrics did you use to measure success?",
    "difficulty": "${difficultyLevel}",
    "complexity": ${complexity},
    "estimatedTime": 10,
    "keyPoints": [
      "Content planning and organization",
      "Platform-specific strategies",
      "Analytics and KPI tracking",
      "Team collaboration process"
    ]
  }
]

Requirements:
- Generate exactly ${count} questions
- Focus on ${questionTypes.join(', ')} aspects
- Match the specified difficulty level: ${difficultyLevel}
- Complexity should be between 1-5
- Include 3-4 key points for each question
- Estimated time should be realistic (5-15 minutes)
- Questions should be detailed and specific to ${jobTitle} role

Keep the response in strict JSON format.`;

      const response = await axios.post(
        process.env.REACT_APP_GEMINI_API_URL || '',
        {
          model: process.env.REACT_APP_GEMINI_MODEL,
          contents: [{
            role: "user",
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.REACT_APP_GEMINI_API_KEY
          }
        }
      );

      console.log('Gemini API Response:', response.data);

      let parsedQuestions: GeneratedQuestion[] = [];
      
      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const generatedText = response.data.candidates[0].content.parts[0].text.trim();
        try {
          // Remove any potential markdown formatting or extra text
          const jsonStart = generatedText.indexOf('[');
          const jsonEnd = generatedText.lastIndexOf(']') + 1;
          const jsonString = generatedText.slice(jsonStart, jsonEnd);
          
          const parsed = JSON.parse(jsonString);
          
          if (!Array.isArray(parsed)) {
            throw new Error('Response is not an array');
          }

          parsedQuestions = parsed.map((item: any) => ({
            category: String(item.category || 'General'),
            question: String(item.question || ''),
            difficulty: String(item.difficulty || difficultyLevel),
            complexity: Number(item.complexity || complexity),
            estimatedTime: Number(item.estimatedTime || 5),
            keyPoints: Array.isArray(item.keyPoints) ? item.keyPoints.map(String) : []
          }));

          // Validate the generated questions
          if (parsedQuestions.length === 0) {
            throw new Error('No questions were generated');
          }

          if (parsedQuestions.some(question => !question.question || question.question.trim() === '')) {
            throw new Error('Some questions are empty');
          }

          setGenerationProgress(100);
          return parsedQuestions;
        } catch (parseError) {
          console.error('Parse error:', parseError, 'Generated text:', generatedText);
          throw new Error('Failed to parse generated questions. Please try again.');
        }
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error: unknown) {
      console.error('Question generation error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to generate questions. Please try again.');
      }
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuestionTypeChange = (event: React.MouseEvent<HTMLElement>, newTypes: string[]) => {
    setSelectedQuestionTypes(newTypes);
  };

  const handleComplexityChange = (event: Event, newValue: number | number[]) => {
    setQuestionComplexity(newValue as number);
  };

  const handlePreview = () => {
    setPreviewData({
      jobTitle: formData.jobTitle,
      company: selectedCompany,
      description: formData.description,
      requirements: formData.skills,
      questions: questions,
      interviewProcess: {
        rounds: formData.interviewRounds,
        codingChallenge: formData.codingChallenge,
        systemDesign: formData.systemDesign,
        pairProgramming: formData.pairProgramming,
      },
    });
    setShowPreview(true);
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      // Validate required fields
      if (!formData.jobTitle || !formData.deadline || !formData.language || !formData.timezone) {
        setError('Please fill in all required fields');
        return;
      }

      setIsLoading(true);
      setError(undefined); // Clear any previous errors

      try {
        // Start progress indication
        setIsGenerating(true);
        setGenerationProgress(10);

        const generatedQuestions = await generateQuestionsWithGemini(
          formData.jobTitle,
          selectedQuestionTypes,
          difficultyLevel,
          questionCount,
          questionComplexity
        );

        // Update progress
        setGenerationProgress(50);

        // Format questions with categories and key points
        const formattedQuestions = generatedQuestions.map((q, index) => 
          `Question ${index + 1}:\n` +
          `[${q.category}] (${q.difficulty} Level, Complexity: ${q.complexity}/5)\n\n` +
          `${q.question}\n\n` +
          `Estimated Time: ${q.estimatedTime} minutes\n\n` +
          `Key Points to Look For:\n${q.keyPoints.map(point => `• ${point}`).join('\n')}\n` +
          `${'─'.repeat(50)}\n`
        ).join('\n');

        // Update progress
        setGenerationProgress(80);

        // Update state with generated questions
        setQuestions(generatedQuestions.map(q => q.question));
        setFormData(prev => ({
          ...prev,
          customQuestions: formattedQuestions
        }));

        // Complete progress
        setGenerationProgress(100);
        
        // Move to next step
        setActiveStep(prevStep => prevStep + 1);
      } catch (error: unknown) {
        console.error('Question generation error:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to generate questions. Please try again.');
        }
      } finally {
        setIsLoading(false);
        setIsGenerating(false);
      }
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep: number) => prevStep - 1);
  };

  const handleSaveTemplate = () => {
    const newTemplate = {
      id: Date.now().toString(),
      name: `Template ${generatedQuestions.length + 1}`,
      content: formData.customQuestions
    };
    setGeneratedQuestions([...generatedQuestions, newTemplate]);
    setTemplateName('');
  };

  const handleRenameTemplate = (template: Template) => {
    setEditingTemplateId(template.id);
    setTemplateName(template.name);
    setTimeout(() => templateInputRef.current?.focus(), 100);
  };

  const handleSaveTemplateName = (template: Template) => {
    if (templateName.trim()) {
      setGeneratedQuestions(generatedQuestions.map(t => 
        t.id === template.id ? { ...t, name: templateName.trim() } : t
      ));
    }
    setEditingTemplateId(null);
    setTemplateName('');
  };

  const handleAddSkill = () => {
    if (formData.newSkill && !formData.skills.includes(formData.newSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.newSkill],
        newSkill: ''
      });
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const handleAddCandidate = () => {
    if (formData.newCandidate && !formData.candidates.includes(formData.newCandidate)) {
      setFormData({
        ...formData,
        candidates: [...formData.candidates, formData.newCandidate],
        newCandidate: ''
      });
    }
  };

  const handleRemoveCandidate = (candidate: string) => {
    setFormData({
      ...formData,
      candidates: formData.candidates.filter(c => c !== candidate)
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      // Here you would typically make an API call to save the job
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setSuccessMessage('Job created successfully!');
      setTimeout(() => {
        onClose();
        navigate('/admin/jobs');
      }, 2000);
    } catch (error) {
      setError('Failed to create job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestions = () => (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Generated Interview Questions
      </Typography>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
        >
          <Box component="div">
            {error}
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setError(undefined);
                handleNext();
              }}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Box>
        </Alert>
      )}
      {questions.length > 0 && (
        <Box>
          {questions.map((question: string, index: number) => (
            <TextField
              key={index}
              fullWidth
              multiline
              rows={2}
              value={question}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const newQuestions = [...questions];
                newQuestions[index] = e.target.value;
                setQuestions(newQuestions);
              }}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        const newQuestions = questions.filter((_: string, i: number) => i !== index);
                        setQuestions(newQuestions);
                      }}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          ))}
          <Button
            startIcon={<PlusCircleIcon className="h-5 w-5" />}
            onClick={() => setQuestions([...questions, ''])}
            sx={{ mt: 1 }}
          >
            Add Question
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Modal 
      open={open} 
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box 
        sx={{
          width: '90%',
          maxWidth: 1000,
          maxHeight: '90vh',
          bgcolor: '#1f2937',
          borderRadius: 2,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Typography variant="h6" sx={{ color: '#f3f4f6' }}>
            {steps[activeStep]}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#9ca3af' }}>
            <XMarkIcon className="h-6 w-6" />
          </IconButton>
        </Box>

        <Box sx={{ 
          p: 3, 
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#374151',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#4b5563',
            borderRadius: '4px',
            '&:hover': {
              background: '#6b7280',
            },
          },
        }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: '#9ca3af',
                      '&.Mui-active': { color: '#8b5cf6' },
                      '&.Mui-completed': { color: '#10b981' }
                    },
                    '& .MuiStepIcon-root': {
                      color: '#4b5563',
                      '&.Mui-active': { color: '#8b5cf6' },
                      '&.Mui-completed': { color: '#10b981' }
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {successMessage && (
            <Alert 
              severity="success" 
              sx={{ mb: 2 }}
              icon={<CheckCircleIcon className="h-5 w-5" />}
            >
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              icon={<ExclamationCircleIcon className="h-5 w-5" />}
            >
              {error}
              <Button
                color="inherit"
                size="small"
                onClick={() => setError(undefined)}
                sx={{ ml: 2 }}
              >
                Dismiss
              </Button>
            </Alert>
          )}

          {activeStep === 0 && (
            <Box sx={{ mt: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: '#374151', borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BuildingOfficeIcon className="h-5 w-5 text-[#8b5cf6] mr-2" />
                        <Typography variant="h6" sx={{ color: '#f3f4f6' }}>
                          Company & Role
                        </Typography>
                      </Box>
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel sx={{ color: '#9ca3af' }}>Company *</InputLabel>
                        <Select
                          value={selectedCompany}
                          onChange={handleCompanyChange}
                          required
                          sx={{
                            bgcolor: '#1f2937',
                            borderRadius: 2,
                            '& .MuiSelect-select': { color: '#f3f4f6' }
                          }}
                        >
                          {companies.map((company) => (
                            <MenuItem key={company.name} value={company.name}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  sx={{ width: 24, height: 24, mr: 1 }}
                                  src={`/logos/${company.name.toLowerCase()}.png`}
                                >
                                  {company.name[0]}
                                </Avatar>
                                {company.name}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel sx={{ color: '#9ca3af' }}>Job Title *</InputLabel>
                        <Select
                          value={formData.jobTitle}
                          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                          required
                          disabled={!selectedCompany}
                          sx={{
                            bgcolor: '#1f2937',
                            borderRadius: 2,
                            '& .MuiSelect-select': { color: '#f3f4f6' }
                          }}
                        >
                          {availableJobs.map((job) => (
                            <MenuItem key={job} value={job}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <BriefcaseIcon className="h-5 w-5 text-[#8b5cf6] mr-2" />
                                {job}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: '#374151', borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarIcon className="h-5 w-5 text-[#8b5cf6] mr-2" />
                        <Typography variant="h6" sx={{ color: '#f3f4f6' }}>
                          Timeline & Location
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        label="Deadline *"
                        name="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        required
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#1f2937',
                            borderRadius: 2,
                            '& fieldset': { borderColor: '#4b5563' }
                          }
                        }}
                      />

                      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: '#9ca3af' }}>Language *</InputLabel>
                          <Select
                            name="language"
                            value={formData.language}
                            onChange={handleSelectChange}
                            displayEmpty
                            sx={{
                              bgcolor: '#1f2937',
                              borderRadius: 2,
                              '& .MuiSelect-select': { color: '#f3f4f6' }
                            }}
                          >
                            {languages.map((lang) => (
                              <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel sx={{ color: '#9ca3af' }}>Timezone *</InputLabel>
                          <Select
                            name="timezone"
                            value={formData.timezone}
                            onChange={handleSelectChange}
                            displayEmpty
                            sx={{
                              bgcolor: '#1f2937',
                              borderRadius: 2,
                              '& .MuiSelect-select': { color: '#f3f4f6' }
                            }}
                          >
                            {timezones.map((tz) => (
                              <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ bgcolor: '#374151', borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DocumentTextIcon className="h-5 w-5 text-[#8b5cf6] mr-2" />
                        <Typography variant="h6" sx={{ color: '#f3f4f6' }}>
                          Job Description
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        multiline
                        rows={6}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#1f2937',
                            borderRadius: 2,
                            '& fieldset': { borderColor: '#4b5563' }
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 1 && (
            <Box sx={{ mt: 4 }}>
              <Card sx={{ bgcolor: '#374151', borderRadius: 2, mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-[#8b5cf6] mr-2" />
                    <Typography variant="h6" sx={{ color: '#f3f4f6' }}>
                      Question Generation Settings
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ color: '#9ca3af', mb: 1 }}>
                      Question Types
                    </Typography>
                    <ToggleButtonGroup
                      value={selectedQuestionTypes}
                      onChange={handleQuestionTypeChange}
                      aria-label="question types"
                      sx={{ flexWrap: 'wrap', gap: 1 }}
                    >
                      {questionTypes.map((type) => (
                        <ToggleButton
                          key={type.value}
                          value={type.value}
                          sx={{
                            color: '#f3f4f6',
                            borderColor: '#4b5563',
                            '&.Mui-selected': {
                              bgcolor: '#8b5cf6',
                              color: '#ffffff',
                            },
                          }}
                        >
                          <type.icon className="h-5 w-5 mr-2" />
                          {type.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ color: '#9ca3af', mb: 1 }}>
                      Difficulty Level
                    </Typography>
                    <ToggleButtonGroup
                      value={difficultyLevel}
                      exclusive
                      onChange={(e, value) => setDifficultyLevel(value)}
                      aria-label="difficulty level"
                      sx={{ flexWrap: 'wrap', gap: 1 }}
                    >
                      {difficultyLevels.map((level) => (
                        <ToggleButton
                          key={level.value}
                          value={level.value}
                          sx={{
                            color: '#f3f4f6',
                            borderColor: '#4b5563',
                            '&.Mui-selected': {
                              bgcolor: level.color,
                              color: '#ffffff',
                            },
                          }}
                        >
                          {level.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ color: '#9ca3af', mb: 1 }}>
                      Question Complexity
                    </Typography>
                    <Slider
                      value={questionComplexity}
                      onChange={handleComplexityChange}
                      min={1}
                      max={5}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                      sx={{
                        color: '#8b5cf6',
                        '& .MuiSlider-markLabel': { color: '#9ca3af' },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      startIcon={isGenerating ? <CircularProgress size={20} /> : <SparklesIcon className="h-5 w-5" />}
                      onClick={async () => {
                        try {
                          setError(undefined);
                          const generated = await generateQuestionsWithGemini(
                            formData.jobTitle,
                            selectedQuestionTypes,
                            difficultyLevel,
                            questionCount,
                            questionComplexity
                          );
                          
                          setQuestions(generated.map(q => q.question));
                          setFormData({
                            ...formData,
                            customQuestions: generated.map(q => 
                              `[${q.category}] (${q.difficulty}, Complexity: ${q.complexity}/5)\n${q.question}\n\nKey Points:\n${q.keyPoints.join('\n')}`
                            ).join('\n\n')
                          });
                          
                        } catch (err) {
                          setError('Failed to generate questions. Please try again.');
                        }
                      }}
                      disabled={isGenerating || !formData.jobTitle}
                      sx={{
                        bgcolor: '#8b5cf6',
                        color: '#ffffff',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#7c3aed' }
                      }}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Questions'}
                    </Button>

                    {isGenerating && (
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={generationProgress}
                          sx={{ color: '#8b5cf6', mr: 2 }}
                        />
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                          Generating questions... {generationProgress}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {questions.length > 0 && (
                <Card sx={{ bgcolor: '#374151', borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DocumentTextIcon className="h-5 w-5 text-[#8b5cf6] mr-2" />
                      <Typography variant="h6" sx={{ color: '#f3f4f6' }}>
                        Generated Questions
                      </Typography>
                    </Box>
                    <Box>
                      {questions.map((question, index) => (
                        <Card
                          key={index}
                          sx={{
                            mb: 2,
                            bgcolor: '#1f2937',
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#2d3748' }
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ color: '#9ca3af' }}>
                                Question {index + 1}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const newQuestions = questions.filter((_, i) => i !== index);
                                  setQuestions(newQuestions);
                                }}
                                sx={{ color: '#9ca3af' }}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </IconButton>
                            </Box>
                            <TextField
                              fullWidth
                              multiline
                              value={question}
                              onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[index] = e.target.value;
                                setQuestions(newQuestions);
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  color: '#f3f4f6',
                                  '& fieldset': { borderColor: '#4b5563' }
                                }
                              }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#f3f4f6' }}>
                Job Requirements & Details
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{ color: '#9ca3af' }}>Experience Level</InputLabel>
                <Select
                  value={formData.experience}
                  onChange={handleSelectChange}
                  name="experience"
                  sx={{
                    bgcolor: '#374151',
                    borderRadius: 2,
                    '& .MuiSelect-select': { color: '#f3f4f6' }
                  }}
                >
                  {experienceLevels.map((level) => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Salary Range"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#374151',
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#4b5563' }
                  },
                  '& .MuiInputLabel-root': { color: '#9ca3af' }
                }}
              />

              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#374151',
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#4b5563' }
                  },
                  '& .MuiInputLabel-root': { color: '#9ca3af' }
                }}
              />

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Add Required Skills"
                  name="newSkill"
                  value={formData.newSkill}
                  onChange={handleInputChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#374151',
                      borderRadius: 2,
                      '& fieldset': { borderColor: '#4b5563' }
                    },
                    '& .MuiInputLabel-root': { color: '#9ca3af' }
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleAddSkill} sx={{ color: '#8b5cf6' }}>
                        <PlusIcon className="h-5 w-5" />
                      </IconButton>
                    ),
                  }}
                />
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onDelete={() => handleRemoveSkill(skill)}
                      sx={{
                        bgcolor: '#4b5563',
                        color: '#f3f4f6',
                        '& .MuiChip-deleteIcon': {
                          color: '#9ca3af',
                          '&:hover': { color: '#f3f4f6' }
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              <Typography variant="h6" sx={{ mb: 2, color: '#f3f4f6' }}>
                Interview Process
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{ color: '#9ca3af' }}>Interview Rounds</InputLabel>
                <Select
                  value={formData.interviewRounds || 1}
                  onChange={(e) => setFormData({ ...formData, interviewRounds: Number(e.target.value) })}
                  sx={{
                    bgcolor: '#374151',
                    borderRadius: 2,
                    '& .MuiSelect-select': { color: '#f3f4f6' }
                  }}
                >
                  {[1, 2, 3, 4, 5].map((round) => (
                    <MenuItem key={round} value={round}>{round} Round{round > 1 ? 's' : ''}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.codingChallenge || false}
                    onChange={(e) => setFormData({ ...formData, codingChallenge: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8b5cf6',
                        '& + .MuiSwitch-track': {
                          backgroundColor: '#6d28d9'
                        }
                      }
                    }}
                  />
                }
                label="Include Coding Challenge"
                sx={{ color: '#f3f4f6', mb: 2, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.systemDesign || false}
                    onChange={(e) => setFormData({ ...formData, systemDesign: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8b5cf6',
                        '& + .MuiSwitch-track': {
                          backgroundColor: '#6d28d9'
                        }
                      }
                    }}
                  />
                }
                label="Include System Design Round"
                sx={{ color: '#f3f4f6', mb: 2, display: 'block' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.pairProgramming || false}
                    onChange={(e) => setFormData({ ...formData, pairProgramming: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8b5cf6',
                        '& + .MuiSwitch-track': {
                          backgroundColor: '#6d28d9'
                        }
                      }
                    }}
                  />
                }
                label="Include Pair Programming Session"
                sx={{ color: '#f3f4f6', mb: 2, display: 'block' }}
              />
            </Box>
          )}

          {activeStep === 3 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#f3f4f6' }}>
                Invite Candidates
              </Typography>

              <TextField
                fullWidth
                label="Add Candidate Email"
                name="newCandidate"
                value={formData.newCandidate}
                onChange={handleInputChange}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#374151',
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#4b5563' }
                  },
                  '& .MuiInputLabel-root': { color: '#9ca3af' }
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleAddCandidate} sx={{ color: '#8b5cf6' }}>
                      <PlusIcon className="h-5 w-5" />
                    </IconButton>
                  ),
                }}
              />

              <Box sx={{ mb: 3 }}>
                {formData.candidates.map((candidate) => (
                  <Chip
                    key={candidate}
                    label={candidate}
                    onDelete={() => handleRemoveCandidate(candidate)}
                    sx={{
                      m: 0.5,
                      bgcolor: '#4b5563',
                      color: '#f3f4f6',
                      '& .MuiChip-deleteIcon': {
                        color: '#9ca3af',
                        '&:hover': { color: '#f3f4f6' }
                      }
                    }}
                  />
                ))}
              </Box>

              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                Candidates will receive an email invitation with:
              </Typography>
              <ul style={{ color: '#f3f4f6', paddingLeft: '1.5rem' }}>
                <li>Job description and requirements</li>
                <li>Interview scheduling options</li>
                <li>Technical assessment (if enabled)</li>
                <li>Application instructions</li>
              </ul>
            </Box>
          )}
        </Box>

        <Box sx={{ 
          p: 3, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex', 
          justifyContent: 'space-between'
        }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowLeftIcon className="h-5 w-5" />}
            sx={{
              color: '#9ca3af',
              '&:hover': { color: '#f3f4f6' }
            }}
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep === steps.length - 1 && (
              <Button
                onClick={handlePreview}
                startIcon={<EyeIcon className="h-5 w-5" />}
                sx={{
                  bgcolor: '#4b5563',
                  color: '#ffffff',
                  '&:hover': { bgcolor: '#374151' }
                }}
              >
                Preview
              </Button>
            )}
            <Button
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              endIcon={activeStep === steps.length - 1 ? null : <ArrowRightIcon className="h-5 w-5" />}
              sx={{
                bgcolor: '#8b5cf6',
                color: '#ffffff',
                px: 4,
                '&:hover': { bgcolor: '#7c3aed' }
              }}
            >
              {activeStep === steps.length - 1 ? 'Create Job' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateJobModal;