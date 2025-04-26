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
  Card,
  CardContent,
  Grid,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Paper,
  Checkbox,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PlusCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
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
  EyeIcon,
  ArrowPathRoundedSquareIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, doc, getDoc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

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
  postToLinkedIn: boolean; // New field for LinkedIn posting preference
  postToIndeed: boolean;   // New field for Indeed posting preference
}

interface ChatMessage {
  sender: 'User' | 'Bot';
  text: string;
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
      'SEO Project Manager',
    ],
  },
  {
    name: 'Google',
    jobs: ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer', 'Cloud Architect'],
  },
  {
    name: 'Microsoft',
    jobs: ['Software Developer', 'Cloud Engineer', 'Machine Learning Engineer', 'Program Manager', 'Full Stack Developer'],
  },
  {
    name: 'Amazon',
    jobs: ['Software Development Engineer', 'Solutions Architect', 'Technical Program Manager', 'Data Engineer', 'Frontend Engineer'],
  },
  {
    name: 'Meta',
    jobs: ['Software Engineer', 'Product Designer', 'Data Scientist', 'Security Engineer', 'AR/VR Developer'],
  },
  {
    name: 'Apple',
    jobs: ['iOS Developer', 'Machine Learning Engineer', 'Systems Engineer', 'Hardware Engineer', 'QA Engineer'],
  },
  {
    name: 'Tencent',
    jobs: ['Game Developer', 'AI Researcher', 'Backend Engineer', 'Product Manager', 'UI/UX Designer'],
  },
  {
    name: 'Alibaba',
    jobs: ['Cloud Engineer', 'E-commerce Specialist', 'Data Analyst', 'Software Engineer', 'Logistics Manager'],
  },
  {
    name: 'Samsung',
    jobs: ['Hardware Engineer', 'Mobile Software Developer', 'AI Engineer', 'Product Manager', 'Quality Assurance Engineer'],
  },
  {
    name: 'Toyota',
    jobs: ['Automotive Engineer', 'Software Developer', 'Data Analyst', 'Supply Chain Manager', 'Robotics Engineer'],
  },
  {
    name: 'Siemens',
    jobs: ['Industrial Engineer', 'Software Developer', 'Automation Engineer', 'Project Manager', 'Cybersecurity Specialist'],
  },
  {
    name: 'HSBC',
    jobs: ['Financial Analyst', 'Risk Manager', 'Data Scientist', 'Software Engineer', 'Compliance Officer'],
  },
  {
    name: 'Reliance Industries',
    jobs: ['Petroleum Engineer', 'Data Scientist', 'Software Developer', 'Retail Manager', 'Supply Chain Analyst'],
  },
  {
    name: 'Shopify',
    jobs: ['Frontend Developer', 'Backend Developer', 'Product Manager', 'UX Designer', 'Data Engineer'],
  },
  {
    name: 'NVIDIA',
    jobs: ['AI Engineer', 'GPU Software Developer', 'Systems Engineer', 'Data Scientist', 'Product Manager'],
  },
  {
    name: 'SAP',
    jobs: ['ERP Consultant', 'Software Developer', 'Cloud Architect', 'Data Analyst', 'Solution Architect'],
  },
  {
    name: 'Naspers',
    jobs: ['Software Engineer', 'Product Manager', 'Data Analyst', 'Digital Marketing Specialist', 'E-commerce Manager'],
  },
  {
    name: 'Atlassian',
    jobs: ['Software Engineer', 'Product Manager', 'DevOps Engineer', 'Technical Writer', 'UX Designer'],
  },
  {
    name: 'Novartis',
    jobs: ['Biomedical Engineer', 'Data Scientist', 'Clinical Research Manager', 'Regulatory Affairs Specialist', 'Software Developer'],
  },
  {
    name: 'Qantas',
    jobs: ['Aviation Engineer', 'Data Analyst', 'Software Developer', 'Customer Experience Manager', 'Operations Manager'],
  },
  {
    name: 'Accenture',
    jobs: ['Management Consultant', 'Software Engineer', 'Cloud Architect', 'Data Analyst', 'Cybersecurity Consultant', 'Digital Transformation Specialist'],
  },
  {
    name: 'Alliance',
    jobs: ['Actuarial Analyst', 'Risk Manager', 'Insurance Underwriter', 'Data Scientist', 'Software Developer', 'Claims Manager'],
  },
  {
    name: 'Lear',
    jobs: ['Automotive Engineer', 'Manufacturing Engineer', 'Supply Chain Manager', 'Quality Assurance Engineer', 'Embedded Software Developer'],
  },
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
    postToLinkedIn: false, // Initialize new fields
    postToIndeed: false,
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
  const [useAI, setUseAI] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'Bot', text: 'Hi! I\'m here to help you create a job posting. Just tell me the job role and company, for example: "I need a Software Engineer at Google" or "Looking for a Data Scientist position with Microsoft".' },
  ]);
  const [userPrompt, setUserPrompt] = useState('');
  const [awaitingClarification, setAwaitingClarification] = useState<'jobTitle' | 'company' | null>(null);

  // Mock user accounts (same as in AdminJobs for consistency)
  const userAccounts = {
    linkedIn: { username: 'john.doe@company.com' },
    indeed: { username: 'company.indeed@account.com' },
  };

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

      let parsedQuestions: GeneratedQuestion[] = [];
      
      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const generatedText = response.data.candidates[0].content.parts[0].text.trim();
        try {
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

          if (parsedQuestions.length === 0) {
            throw new Error('No questions were generated');
          }

          if (parsedQuestions.some(question => !question.question || question.question.trim() === '')) {
            throw new Error('Some questions are empty');
          }

          setGenerationProgress(100);
          return parsedQuestions;
        } catch (parseError) {
          throw new Error('Failed to parse generated questions. Please try again.');
        }
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error: unknown) {
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

  const generateJobDetailsWithGemini = async (jobTitle: string, company: string): Promise<{ description: string; skills: string[] }> => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_GEMINI_API_URL || '',
        {
          model: process.env.REACT_APP_GEMINI_MODEL,
          contents: [{
            role: "user",
            parts: [{
              text: `Generate a job description and a list of required skills for a ${jobTitle} position at ${company}. Return the result in JSON format only, with no additional text.

Expected JSON format:
{
  "description": "string",
  "skills": ["string"]
}

Requirements:
- The description should be 2-3 sentences long, professional, and tailored to the job title and company.
- The skills should be a list of 3-5 relevant skills for the job title.
- Do not include any other fields.`
            }]
          }],
          generationConfig: {
            temperature: 0.5,
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

      const generatedText = response.data.candidates[0].content.parts[0].text.trim();
      const parsed = JSON.parse(generatedText);

      if (!parsed.description || !Array.isArray(parsed.skills)) {
        throw new Error('Failed to generate job description or skills.');
      }

      return {
        description: parsed.description,
        skills: parsed.skills,
      };
    } catch (error) {
      throw new Error('Failed to generate job description and skills. Using defaults instead.');
    }
  };

  const extractJobAndCompany = (prompt: string): { jobTitle: string | null; company: string | null } => {
    const promptLower = prompt.toLowerCase();
    let jobTitle: string | null = null;
    let company: string | null = null;

    const companyNames = companies.map(c => c.name.toLowerCase());
    const allJobs = companies.flatMap(c => c.jobs.map(job => job.toLowerCase()));
    const jobSynonyms: { [key: string]: string } = {
      'software developer': 'Software Engineer',
      'sde': 'Software Engineer',
      'ml engineer': 'Machine Learning Engineer',
      'ux designer': 'Product Designer',
      'frontend engineer': 'Frontend Engineer',
    };

    for (const companyName of companyNames) {
      if (promptLower.includes(companyName)) {
        company = companies.find(c => c.name.toLowerCase() === companyName)?.name || null;
        break;
      }
    }

    for (const job of allJobs) {
      if (promptLower.includes(job)) {
        jobTitle = companies.flatMap(c => c.jobs).find(j => j.toLowerCase() === job) || null;
        break;
      }
    }

    if (!jobTitle) {
      for (const [synonym, actualJob] of Object.entries(jobSynonyms)) {
        if (promptLower.includes(synonym)) {
          jobTitle = actualJob;
          break;
        }
      }
    }

    if (company && !jobTitle) {
      const companyIndex = promptLower.indexOf(company.toLowerCase());
      const beforeCompany = promptLower.substring(0, companyIndex).trim();
      const afterCompany = promptLower.substring(companyIndex + company.length).trim();

      const prepositions = ['for a', 'as a', 'position at', 'role at', 'with', 'at'];
      for (const prep of prepositions) {
        if (beforeCompany.includes(prep)) {
          const potentialJob = beforeCompany.split(prep)[1]?.trim();
          if (potentialJob) {
            const matchedJob = allJobs.find(job => potentialJob.includes(job)) || Object.keys(jobSynonyms).find(syn => potentialJob.includes(syn));
            if (matchedJob) {
              jobTitle = allJobs.includes(matchedJob) 
                ? companies.flatMap(c => c.jobs).find(j => j.toLowerCase() === matchedJob) || null 
                : jobSynonyms[matchedJob] || null;
            }
          }
        }
        if (afterCompany.includes(prep)) {
          const potentialJob = afterCompany.split(prep)[0]?.trim();
          if (potentialJob) {
            const matchedJob = allJobs.find(job => potentialJob.includes(job)) || Object.keys(jobSynonyms).find(syn => potentialJob.includes(syn));
            if (matchedJob) {
              jobTitle = allJobs.includes(matchedJob) 
                ? companies.flatMap(c => c.jobs).find(j => j.toLowerCase() === matchedJob) || null 
                : jobSynonyms[matchedJob] || null;
            }
          }
        }
      }
    }

    if (jobTitle && !company) {
      const jobIndex = promptLower.indexOf(jobTitle.toLowerCase());
      const beforeJob = promptLower.substring(0, jobIndex).trim();
      const afterJob = promptLower.substring(jobIndex + jobTitle.length).trim();

      const companyIndicators = ['at', 'with', 'for'];
      for (const indicator of companyIndicators) {
        if (afterJob.includes(indicator)) {
          const potentialCompany = afterJob.split(indicator)[1]?.trim();
          if (potentialCompany && companyNames.includes(potentialCompany.toLowerCase())) {
            company = companies.find(c => c.name.toLowerCase() === potentialCompany.toLowerCase())?.name || null;
          }
        }
        if (beforeJob.includes(indicator)) {
          const potentialCompany = beforeJob.split(indicator)[1]?.trim();
          if (potentialCompany && companyNames.includes(potentialCompany.toLowerCase())) {
            company = companies.find(c => c.name.toLowerCase() === potentialCompany.toLowerCase())?.name || null;
          }
        }
      }
    }

    return { jobTitle, company };
  };

  const autoCreateJob = async (jobTitle: string, company: string) => {
    setLoadingAI(true);
    setChatMessages((prev) => [...prev, { sender: 'Bot', text: `Creating job posting for ${jobTitle} at ${company}...` }]);

    try {
      const jobs = companies.find(c => c.name === company)?.jobs || [];
      if (!jobs.includes(jobTitle)) {
        throw new Error(`Job title "${jobTitle}" is not available for ${company}. Available jobs: ${jobs.join(', ')}`);
      }
      setSelectedCompany(company);
      setAvailableJobs(jobs);

      setChatMessages((prev) => [...prev, { sender: 'Bot', text: 'Generating job description and requirements...' }]);
      let description = `We are looking for a ${jobTitle} to join ${company}. The ideal candidate will contribute to our mission of innovation and excellence.`;
      let skills = ['Teamwork', 'Communication', 'Problem-solving'];

      try {
        const generatedDetails = await generateJobDetailsWithGemini(jobTitle, company);
        description = generatedDetails.description;
        skills = generatedDetails.skills;

        if (!description.toLowerCase().includes(jobTitle.toLowerCase()) || !description.toLowerCase().includes(company.toLowerCase())) {
          throw new Error('Generated description does not match the job title or company.');
        }
      } catch (error) {
        setChatMessages((prev) => [...prev, { sender: 'Bot', text: 'Failed to generate description and skills. Using defaults.' }]);
      }

      const isSeniorRole = jobTitle.toLowerCase().includes('senior') || jobTitle.toLowerCase().includes('lead');
      const isTechGiant = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].includes(company);
      const salaryRange = isSeniorRole ? (isTechGiant ? '$150,000 - $200,000' : '$100,000 - $150,000') : (isTechGiant ? '$100,000 - $150,000' : '$80,000 - $120,000');
      const experienceLevel = isSeniorRole ? 'Senior' : 'Mid Level';
      const location = isTechGiant ? `${company} Headquarters` : 'Remote';

      const defaultFormData: FormData = {
        jobTitle,
        company,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        language: 'English',
        timezone: 'UTC',
        description,
        customQuestions: '',
        skills,
        experience: experienceLevel,
        salary: salaryRange,
        location,
        remote: true,
        assessment: false,
        candidates: [],
        newSkill: '',
        newCandidate: '',
        interviewRounds: 1,
        codingChallenge: false,
        systemDesign: false,
        pairProgramming: false,
        postToLinkedIn: false, // Default to false
        postToIndeed: false,
      };

      setFormData(defaultFormData);

      setChatMessages((prev) => [...prev, { sender: 'Bot', text: 'Generating interview questions...' }]);
      const generatedQuestions = await generateQuestionsWithGemini(
        jobTitle,
        ['technical', 'behavioral'],
        'intermediate',
        5,
        3
      );

      const formattedQuestions = generatedQuestions.map((q, index) =>
        `Question ${index + 1}:\n` +
        `[${q.category}] (${q.difficulty} Level, Complexity: ${q.complexity}/5)\n\n` +
        `${q.question}\n\n` +
        `Estimated Time: ${q.estimatedTime} minutes\n\n` +
        `Key Points to Look For:\n${q.keyPoints.map(point => `• ${point}`).join('\n')}\n` +
        `${'─'.repeat(50)}\n`
      ).join('\n');

      setQuestions(generatedQuestions.map(q => q.question));
      setFormData((prev) => ({
        ...prev,
        customQuestions: formattedQuestions,
      }));

      setChatMessages((prev) => [...prev, { sender: 'Bot', text: 'Saving job to database...' }]);
      const jobData = {
        job_title: jobTitle,
        company,
        deadline: defaultFormData.deadline,
        language: defaultFormData.language,
        timezone: defaultFormData.timezone,
        description,
        custom_questions: formattedQuestions,
        skills,
        experience: experienceLevel,
        salary: salaryRange,
        location,
        remote: true,
        assessment: false,
        candidates: [],
        interview_rounds: 1,
        coding_challenge: false,
        system_design: false,
        pair_programming: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        status: 'active',
      };

      const docRef = await addDoc(collection(db, 'createjobs'), jobData);
      const jobId = docRef.id;

      setChatMessages((prev) => [...prev, { sender: 'Bot', text: `Job created successfully! Job ID: ${jobId}` }]);
      setTimeout(() => {
        onClose();
        // Redirect with newJobId and posting preferences
        const params = new URLSearchParams({
          newJobId: jobId,
          postToLinkedIn: formData.postToLinkedIn.toString(),
          postToIndeed: formData.postToIndeed.toString(),
        });
        navigate(`/admin/jobs?${params.toString()}`);
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create job. Please try again.';
      setChatMessages((prev) => [...prev, { sender: 'Bot', text: errorMessage }]);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!userPrompt.trim()) return;

    setChatMessages((prev) => [...prev, { sender: 'User', text: userPrompt }]);

    if (awaitingClarification) {
      const allJobs = companies.flatMap(c => c.jobs);
      const companyNames = companies.map(c => c.name);

      if (awaitingClarification === 'jobTitle') {
        const jobTitle = userPrompt.trim();
        const jobSynonyms: { [key: string]: string } = {
          'software developer': 'Software Engineer',
          'sde': 'Software Engineer',
          'ml engineer': 'Machine Learning Engineer',
          'ux designer': 'Product Designer',
          'frontend engineer': 'Frontend Engineer',
        };
        let matchedJob = allJobs.find(job => job.toLowerCase() === jobTitle.toLowerCase());
        if (!matchedJob) {
          const synonymMatch = Object.keys(jobSynonyms).find(syn => jobTitle.toLowerCase().includes(syn));
          if (synonymMatch) matchedJob = jobSynonyms[synonymMatch];
        }

        if (matchedJob) {
          setAwaitingClarification(null);
          const companyMatch = chatMessages[chatMessages.length - 2].text.match(/company name \((.*?)\)/);
          const company = companyMatch ? companyMatch[1] : null;
          if (company) {
            await autoCreateJob(matchedJob, company);
          } else {
            setChatMessages((prev) => [...prev, { sender: 'Bot', text: 'I still need the company name. Which company is this job for?' }]);
            setAwaitingClarification('company');
          }
        } else {
          const similarJobs = allJobs.filter(job => job.toLowerCase().includes(jobTitle.toLowerCase()));
          const suggestion = similarJobs.length > 0 
            ? ` Did you mean one of these: ${similarJobs.join(', ')}?`
            : ` Available job titles are: ${allJobs.join(', ')}.`;
          setChatMessages((prev) => [...prev, { sender: 'Bot', text: `I couldn't find the job title "${jobTitle}" in my list.${suggestion} Please try again.` }]);
        }
      } else if (awaitingClarification === 'company') {
        const company = userPrompt.trim();
        const matchedCompany = companyNames.find(c => c.toLowerCase() === company.toLowerCase());
        if (matchedCompany) {
          setAwaitingClarification(null);
          const jobTitleMatch = chatMessages[chatMessages.length - 2].text.match(/job title \((.*?)\)/);
          const jobTitle = jobTitleMatch ? jobTitleMatch[1] : null;
          if (jobTitle) {
            await autoCreateJob(jobTitle, matchedCompany);
          } else {
            setChatMessages((prev) => [...prev, { sender: 'Bot', text: 'I still need the job title. What role are you creating this job for?' }]);
            setAwaitingClarification('jobTitle');
          }
        } else {
          const similarCompanies = companyNames.filter(c => c.toLowerCase().includes(company.toLowerCase()));
          const suggestion = similarCompanies.length > 0 
            ? ` Did you mean one of these: ${similarCompanies.join(', ')}?`
            : ` Available companies are: ${companyNames.join(', ')}.`;
          setChatMessages((prev) => [...prev, { sender: 'Bot', text: `I couldn't find the company "${company}" in my list.${suggestion} Please try again.` }]);
        }
      }
      setUserPrompt('');
      return;
    }

    const { jobTitle, company } = extractJobAndCompany(userPrompt);

    if (jobTitle && company) {
      await autoCreateJob(jobTitle, company);
    } else if (jobTitle) {
      setChatMessages((prev) => [...prev, { sender: 'Bot', text: `I understood the job title (${jobTitle}), but I need the company name. Which company is this job for?` }]);
      setAwaitingClarification('company');
    } else if (company) {
      setChatMessages((prev) => [...prev, { sender: 'Bot', text: `I understood the company name (${company}), but I need the job title. What role are you creating this job for?` }]);
      setAwaitingClarification('jobTitle');
    } else {
      const allJobs = companies.flatMap(c => c.jobs);
      const companyNames = companies.map(c => c.name);
      setChatMessages((prev) => [...prev, { sender: 'Bot', text: `I couldn't understand the job title or company from your message. Please provide both, for example: "I need a Software Engineer at Google". Available companies: ${companyNames.join(', ')}. Available job titles: ${allJobs.join(', ')}.` }]);
    }

    setUserPrompt('');
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!formData.jobTitle || !formData.deadline || !formData.language || !formData.timezone) {
        setError('Please fill in all required fields');
        return;
      }

      setIsLoading(true);
      setError(undefined);

      try {
        setIsGenerating(true);
        setGenerationProgress(10);

        const generatedQuestions = await generateQuestionsWithGemini(
          formData.jobTitle,
          selectedQuestionTypes,
          difficultyLevel,
          questionCount,
          questionComplexity
        );

        setGenerationProgress(50);

        const formattedQuestions = generatedQuestions.map((q, index) =>
          `Question ${index + 1}:\n` +
          `[${q.category}] (${q.difficulty} Level, Complexity: ${q.complexity}/5)\n\n` +
          `${q.question}\n\n` +
          `Estimated Time: ${q.estimatedTime} minutes\n\n` +
          `Key Points to Look For:\n${q.keyPoints.map(point => `• ${point}`).join('\n')}\n` +
          `${'─'.repeat(50)}\n`
        ).join('\n');

        setGenerationProgress(80);

        setQuestions(generatedQuestions.map(q => q.question));
        setFormData(prev => ({
          ...prev,
          customQuestions: formattedQuestions
        }));

        setGenerationProgress(100);
        setActiveStep(prevStep => prevStep + 1);
      } catch (error: unknown) {
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

      const jobData = {
        job_title: formData.jobTitle,
        company: selectedCompany,
        deadline: formData.deadline,
        language: formData.language,
        timezone: formData.timezone,
        description: formData.description,
        custom_questions: formData.customQuestions,
        skills: formData.skills,
        experience: formData.experience,
        salary: formData.salary,
        location: formData.location,
        remote: formData.remote,
        assessment: formData.assessment,
        candidates: formData.candidates,
        interview_rounds: formData.interviewRounds,
        coding_challenge: formData.codingChallenge,
        system_design: formData.systemDesign,
        pair_programming: formData.pairProgramming,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        status: 'active',
      };

      const docRef = await addDoc(collection(db, 'createjobs'), jobData);
      const jobId = docRef.id;

      setSuccessMessage('Job财富created successfully!');
      setTimeout(() => {
        onClose();
        // Redirect with newJobId and posting preferences
        const params = new URLSearchParams({
          newJobId: jobId,
          postToLinkedIn: formData.postToLinkedIn.toString(),
          postToIndeed: formData.postToIndeed.toString(),
        });
        navigate(`/admin/jobs?${params.toString()}`);
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <Typography variant="h6" sx={{ color: '#f3f4f6' }}>
            {useAI ? 'AI-Driven Job Creation' : steps[activeStep]}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useAI}
                  onChange={(e) => {
                    setUseAI(e.target.checked);
                    setActiveStep(0);
                    setChatMessages([{ sender: 'Bot', text: 'Hi! I\'m here to help you create a job posting. Just tell me the job role and company, for example: "I need a Software Engineer at Google" or "Looking for a Data Scientist position with Microsoft".' }]);
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8b5cf6',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#6d28d9',
                      },
                    },
                  }}
                />
              }
              label="Use AI to Create Job"
              sx={{ color: '#f3f4f6' }}
            />
            <IconButton onClick={onClose} sx={{ color: '#9ca3af' }}>
              <XMarkIcon className="h-6 w-6" />
            </IconButton>
          </Box>
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
          {useAI ? (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ color: '#f3f4f6', mb: 2 }}>
                Chat with Job Creation Bot
              </Typography>
              <Box
                sx={{
                  maxHeight: 400,
                  overflowY: 'auto',
                  mb: 3,
                  p: 2,
                  bgcolor: '#2d3748',
                  borderRadius: 2,
                }}
              >
                <List>
                  {chatMessages.map((msg, idx) => (
                    <ListItem key={idx} sx={{ flexDirection: msg.sender === 'Bot' ? 'row' : 'row-reverse' }}>
                      <Avatar
                        sx={{
                          bgcolor: msg.sender === 'Bot' ? '#8b5cf6' : '#4b5563',
                          mr: msg.sender === 'Bot' ? 2 : 0,
                          ml: msg.sender === 'User' ? 2 : 0,
                        }}
                      >
                        {msg.sender === 'Bot' ? <ArrowPathRoundedSquareIcon className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                      </Avatar>
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          bgcolor: msg.sender === 'Bot' ? '#374151' : '#4b5563',
                          color: '#f3f4f6',
                          borderRadius: 2,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        <ListItemText primary={msg.text} />
                      </Paper>
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder='Tell me the job role and company (e.g., "I need a Software Engineer at Google")'
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#374151',
                      borderRadius: 2,
                      '& fieldset': { borderColor: '#4b5563' },
                    },
                    '& .MuiInputLabel-root': { color: '#9ca3af' },
                  }}
                />
                <Button
                  onClick={handleChatSubmit}
                  disabled={loadingAI}
                  sx={{
                    bgcolor: '#8b5cf6',
                    color: '#ffffff',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#7c3aed' },
                  }}
                >
                  {loadingAI ? <CircularProgress size={20} /> : 'Send'}
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
                          color: '#9ca3af',
                          '&.Mui-active': { color: '#8b5cf6' },
                          '&.Mui-completed': { color: '#10b981' },
                        },
                        '& .MuiStepIcon-root': {
                          color: '#4b5563',
                          '&.Mui-active': { color: '#8b5cf6' },
                          '&.Mui-completed': { color: '#10b981' },
                        },
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
                                '& .MuiSelect-select': { color: '#f3f4f6' },
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
                                '& .MuiSelect-select': { color: '#f3f4f6' },
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
                                '& fieldset': { borderColor: '#4b5563' },
                              },
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
                                  '& .MuiSelect-select': { color: '#f3f4f6' },
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
                                  '& .MuiSelect-select': { color: '#f3f4f6' },
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
                                '& fieldset': { borderColor: '#4b5563' },
                              },
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
                          onChange={(event: React.MouseEvent<HTMLElement>, newTypes: string[]) => setSelectedQuestionTypes(newTypes)}
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
                          onChange={(event: Event, newValue: number | number[]) => setQuestionComplexity(newValue as number)}
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
                            '&:hover': { bgcolor: '#7c3aed' },
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
                                '&:hover': { bgcolor: '#2d3748' },
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
                                      '& fieldset': { borderColor: '#4b5563' },
                                    },
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
                        '& .MuiSelect-select': { color: '#f3f4f6' },
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
                        '& fieldset': { borderColor: '#4b5563' },
                      },
                      '& .MuiInputLabel-root': { color: '#9ca3af' },
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
                        '& fieldset': { borderColor: '#4b5563' },
                      },
                      '& .MuiInputLabel-root': { color: '#9ca3af' },
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
                          '& fieldset': { borderColor: '#4b5563' },
                        },
                        '& .MuiInputLabel-root': { color: '#9ca3af' },
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
                              '&:hover': { color: '#f3f4f6' },
                            },
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
                        '& .MuiSelect-select': { color: '#f3f4f6' },
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
                              backgroundColor: '#6d28d9',
                            },
                          },
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
                              backgroundColor: '#6d28d9',
                            },
                          },
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
                              backgroundColor: '#6d28d9',
                            },
                          },
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
                        '& fieldset': { borderColor: '#4b5563' },
                      },
                      '& .MuiInputLabel-root': { color: '#9ca3af' },
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
                            '&:hover': { color: '#f3f4f6' },
                          },
                        }}
                      />
                    ))}
                  </Box>

                  <Typography variant="body2" sx={{ color: '#9ca3af',
                  mb: 2 }}>
                  Candidates will receive an email invitation with:
                </Typography>
                <ul style={{ color: '#f3f4f6', paddingLeft: '1.5rem' }}>
                  <li>Job description and requirements</li>
                  <li>Interview scheduling options</li>
                  <li>Technical assessment (if enabled)</li>
                  <li>Application instructions</li>
                </ul>

                <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                <Typography variant="h6" sx={{ mb: 2, color: '#f3f4f6' }}>
                  Post Job to Job Boards
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                  Share this job posting on external platforms to reach more candidates. You can modify this later if needed.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.postToLinkedIn}
                        onChange={(e) => setFormData({ ...formData, postToLinkedIn: e.target.checked })}
                        sx={{
                          color: '#4b5563',
                          '&.Mui-checked': { color: '#8b5cf6' },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ color: '#f3f4f6', mr: 1 }}>
                          Post to LinkedIn
                        </Typography>
                        {userAccounts.linkedIn?.username && (
                          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                            (Logged in as {userAccounts.linkedIn.username})
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ color: '#f3f4f6' }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.postToIndeed}
                        onChange={(e) => setFormData({ ...formData, postToIndeed: e.target.checked })}
                        sx={{
                          color: '#4b5563',
                          '&.Mui-checked': { color: '#8b5cf6' },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ color: '#f3f4f6', mr: 1 }}>
                          Post to Indeed
                        </Typography>
                        {userAccounts.indeed?.username && (
                          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                            (Logged in as {userAccounts.indeed.username})
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ color: '#f3f4f6' }}
                  />
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      {!useAI && (
        <Box sx={{
          p: 3,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowLeftIcon className="h-5 w-5" />}
            sx={{
              color: '#9ca3af',
              '&:hover': { color: '#f3f4f6' },
            }}
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep === steps.length - 1 && (
              <Button
                onClick={() => {
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
                }}
                startIcon={<EyeIcon className="h-5 w-5" />}
                sx={{
                  bgcolor: '#4b5563',
                  color: '#ffffff',
                  '&:hover': { bgcolor: '#374151' },
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
                '&:hover': { bgcolor: '#7c3aed' },
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : activeStep === steps.length - 1 ? 'Create Job' : 'Next'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Preview Modal */}
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '80%',
            maxWidth: 800,
            maxHeight: '80vh',
            bgcolor: '#1f2937',
            borderRadius: 2,
            p: 3,
            overflowY: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ color: '#f3f4f6' }}>
              Job Posting Preview
            </Typography>
            <IconButton onClick={() => setShowPreview(false)} sx={{ color: '#9ca3af' }}>
              <XMarkIcon className="h-6 w-6" />
            </IconButton>
          </Box>
          {previewData && (
            <Box sx={{ color: '#f3f4f6' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {previewData.jobTitle} at {previewData.company}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {previewData.description}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Requirements
              </Typography>
              <Box sx={{ mb: 2 }}>
                {previewData.requirements.map((req: string, index: number) => (
                  <Chip
                    key={index}
                    label={req}
                    sx={{
                      m: 0.5,
                      bgcolor: '#4b5563',
                      color: '#f3f4f6',
                    }}
                  />
                ))}
              </Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Interview Questions
              </Typography>
              {previewData.questions.map((question: string, index: number) => (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  {index + 1}. {question}
                </Typography>
              ))}
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Interview Process
              </Typography>
              <Typography variant="body2">
                Rounds: {previewData.interviewProcess.rounds}
              </Typography>
              <Typography variant="body2">
                Coding Challenge: {previewData.interviewProcess.codingChallenge ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2">
                System Design: {previewData.interviewProcess.systemDesign ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2">
                Pair Programming: {previewData.interviewProcess.pairProgramming ? 'Yes' : 'No'}
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  </Modal>
);
};

export default CreateJobModal;