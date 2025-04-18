import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tabs,
  Tab,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Grid,
  Badge,
} from '@mui/material';
import {
  Mic,
  MicOff,
  Send,
  HelpOutline,
  Assessment,
  ExpandMore,
  Lightbulb,
  Timer,
  Psychology,
  EmojiEvents,
  Feedback,
  TipsAndUpdates,
  History,
  Timeline,
  TrendingUp,
  TrendingDown,
  Speed,
  PsychologyAlt,
  Group,
} from '@mui/icons-material';
import axios from 'axios';

interface JobDetails {
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
}

interface ApplicantDetails {
  name: string;
  experience: string;
  education: string;
  skills: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Analysis {
  technicalScore: number;
  communicationScore: number;
  culturalFitScore: number;
  strengths: string[];
  areasForImprovement: string[];
  overallAssessment: string;
  recommendation: 'Hire' | 'Consider' | 'Reject';
}

interface InterviewStage {
  name: 'introduction' | 'technical' | 'behavioral' | 'case_study' | 'system_design' | 'closing';
  description: string;
  duration: number;
  tips: string[];
}

interface HelpDialogContent {
  title: string;
  content: string;
  tips: string[];
}

interface FeedbackHistoryItem extends Analysis {
  timestamp: Date;
  question: string;
  response: string;
}

const interviewStages: InterviewStage[] = [
  {
    name: 'introduction',
    description: 'Initial introduction and background discussion',
    duration: 5,
    tips: [
      'Be concise and clear about your background',
      'Highlight relevant experience',
      'Show enthusiasm for the role',
    ],
  },
  {
    name: 'technical',
    description: 'Technical skills and knowledge assessment',
    duration: 15,
    tips: [
      'Think aloud while solving problems',
      'Ask clarifying questions if needed',
      'Explain your thought process',
    ],
  },
  {
    name: 'behavioral',
    description: 'Behavioral and situational questions',
    duration: 10,
    tips: [
      'Use the STAR method for responses',
      'Be specific with examples',
      'Show how you handle challenges',
    ],
  },
  {
    name: 'case_study',
    description: 'Case study and problem-solving',
    duration: 20,
    tips: [
      'Break down the problem systematically',
      'Consider multiple perspectives',
      'Propose practical solutions',
    ],
  },
  {
    name: 'system_design',
    description: 'System design and architecture discussion',
    duration: 25,
    tips: [
      'Start with high-level architecture',
      'Consider scalability and performance',
      'Discuss trade-offs and alternatives',
    ],
  },
  {
    name: 'closing',
    description: 'Final questions and wrap-up',
    duration: 5,
    tips: [
      'Ask thoughtful questions about the role',
      'Express your interest in the position',
      'Thank the interviewer for their time',
    ],
  },
];

const helpDialogContent: HelpDialogContent[] = [
  {
    title: 'Interview Tips',
    content: 'Here are some general tips to help you succeed in your interview:',
    tips: [
      'Prepare thoroughly by researching the company and role',
      'Practice common interview questions',
      'Dress professionally and maintain good posture',
      'Listen carefully to questions before responding',
      'Take a moment to think before answering complex questions',
      'Be honest and authentic in your responses',
      'Show enthusiasm and interest in the position',
    ],
  },
  {
    title: 'Technical Interview Guide',
    content: 'For technical interviews, keep these points in mind:',
    tips: [
      'Review fundamental concepts and algorithms',
      'Practice coding problems on a whiteboard or paper',
      'Explain your thought process clearly',
      'Write clean, efficient, and well-documented code',
      'Test your solutions with different inputs',
      'Consider edge cases and error handling',
      'Ask clarifying questions when needed',
    ],
  },
  {
    title: 'Behavioral Interview Guide',
    content: 'For behavioral interviews, follow these guidelines:',
    tips: [
      'Use the STAR method (Situation, Task, Action, Result)',
      'Prepare specific examples from your experience',
      'Focus on your role and contributions',
      'Highlight both successes and learning experiences',
      'Show how you handle challenges and conflicts',
      'Demonstrate your teamwork and leadership skills',
      'Be honest about your strengths and weaknesses',
    ],
  },
];

const stageSpecificTips: Record<string, string[]> = {
  introduction: [
    'Start with a brief personal introduction',
    'Highlight your most relevant experience',
    'Explain your interest in the role and company',
    'Be prepared to discuss your career goals',
    'Show enthusiasm and confidence',
  ],
  technical: [
    'Think aloud while solving problems',
    'Ask clarifying questions if needed',
    'Explain your thought process clearly',
    'Consider edge cases and error handling',
    'Write clean, efficient, and well-documented code',
    'Test your solutions with different inputs',
    'Discuss time and space complexity',
  ],
  behavioral: [
    'Use the STAR method (Situation, Task, Action, Result)',
    'Be specific with examples from your experience',
    'Focus on your role and contributions',
    'Highlight both successes and learning experiences',
    'Show how you handle challenges and conflicts',
    'Demonstrate your teamwork and leadership skills',
    'Be honest about your strengths and weaknesses',
  ],
  case_study: [
    'Break down the problem systematically',
    'Consider multiple perspectives and solutions',
    'Discuss trade-offs and alternatives',
    'Propose practical and scalable solutions',
    'Consider business impact and constraints',
    'Show your analytical and problem-solving skills',
    'Communicate your reasoning clearly',
  ],
  system_design: [
    'Start with high-level architecture',
    'Consider scalability and performance',
    'Discuss data models and relationships',
    'Address security and privacy concerns',
    'Consider failure scenarios and recovery',
    'Discuss monitoring and observability',
    'Show your understanding of distributed systems',
  ],
  closing: [
    'Ask thoughtful questions about the role',
    'Express your interest in the position',
    'Thank the interviewer for their time',
    'Ask about next steps in the process',
    'Show enthusiasm for the opportunity',
    'Be professional and courteous',
    'Follow up with a thank-you note',
  ],
};

const AIInterviewBot: React.FC<{
  jobDetails: JobDetails;
  applicantDetails: ApplicantDetails;
}> = ({ jobDetails, applicantDetails }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewStage, setInterviewStage] = useState<'introduction' | 'technical' | 'behavioral' | 'closing'>('introduction');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [helpTab, setHelpTab] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [stageProgress, setStageProgress] = useState<number>(0);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistoryItem[]>([]);
  const [showFeedbackHistory, setShowFeedbackHistory] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize interview with greeting
    const greeting = "Hello! I'm your AI interviewer. I'll be conducting your interview today. Are you ready to begin?";
    setMessages([{
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }]);
    generateNextQuestion();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize timer
    const currentStage = interviewStages.find(stage => stage.name === interviewStage);
    if (currentStage) {
      setTimeRemaining(currentStage.duration * 60);
      
      // Clear existing interval
      if (timerInterval) {
        clearInterval(timerInterval);
      }

      // Start new timer
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimerInterval(interval);
    }

    // Cleanup
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [interviewStage]);

  useEffect(() => {
    // Update stage progress based on messages
    const currentStage = interviewStages.find(stage => stage.name === interviewStage);
    if (currentStage) {
      const stageMessages = messages.filter(msg => 
        msg.role === 'user' && 
        messages.indexOf(msg) >= messages.length - 3
      );
      setStageProgress((stageMessages.length / 3) * 100);
    }
  }, [messages, interviewStage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateNextQuestion = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await axios.post('/api/interview/generate-question', {
        jobDetails,
        applicantDetails,
        interviewStage,
        previousMessages: messages,
      });

      const question = response.data.question;
      setCurrentQuestion(question);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: question,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setError('Failed to generate question. Please try again.');
      console.error('Error generating question:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioResponse(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      setError('Failed to start recording. Please check your microphone permissions.');
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
    }
  };

  const processAudioResponse = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      setError(null);

      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('question', currentQuestion);
      formData.append('jobDetails', JSON.stringify(jobDetails));
      formData.append('applicantDetails', JSON.stringify(applicantDetails));
      formData.append('previousMessages', JSON.stringify(messages));

      const response = await axios.post('/api/interview/process-response', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { transcription, analysis, nextQuestion } = response.data;

      setMessages(prev => [...prev, {
        role: 'user',
        content: transcription,
        timestamp: new Date(),
      }]);

      setCurrentAnalysis(analysis);
      setCurrentQuestion(nextQuestion);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: nextQuestion,
        timestamp: new Date(),
      }]);

      // Update interview stage based on progress
      updateInterviewStage();
    } catch (err) {
      setError('Failed to process response. Please try again.');
      console.error('Error processing response:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextResponse = async () => {
    if (!textInput.trim()) return;

    try {
      setIsProcessing(true);
      setError(null);

      const response = await axios.post('/api/interview/process-text-response', {
        message: textInput,
        question: currentQuestion,
        jobDetails,
        applicantDetails,
      });

      const { analysis, nextQuestion } = response.data;

      setMessages(prev => [...prev, {
        role: 'user',
        content: textInput,
        timestamp: new Date(),
      }]);

      setCurrentAnalysis(analysis);
      setCurrentQuestion(nextQuestion);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: nextQuestion,
        timestamp: new Date(),
      }]);

      setTextInput('');
      updateInterviewStage();
    } catch (err) {
      setError('Failed to process response. Please try again.');
      console.error('Error processing text response:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateInterviewStage = () => {
    // Simple stage progression based on number of messages
    const messageCount = messages.length;
    if (messageCount < 3) {
      setInterviewStage('introduction');
    } else if (messageCount < 6) {
      setInterviewStage('technical');
    } else if (messageCount < 9) {
      setInterviewStage('behavioral');
    } else {
      setInterviewStage('closing');
    }
  };

  const handleHelpDialogOpen = () => {
    setShowHelpDialog(true);
  };

  const handleHelpDialogClose = () => {
    setShowHelpDialog(false);
  };

  const handleHelpTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setHelpTab(newValue);
  };

  const handleAnalysisComplete = (analysis: Analysis, question: string, response: string) => {
    setCurrentAnalysis(analysis);
    setFeedbackHistory(prev => [...prev, {
      ...analysis,
      timestamp: new Date(),
      question,
      response,
    }]);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            AI Interview Bot
          </Typography>
          <Box>
            <Tooltip title="View Analysis">
              <IconButton onClick={() => setShowAnalysis(!showAnalysis)}>
                <Assessment />
              </IconButton>
            </Tooltip>
            <Tooltip title="Help">
              <IconButton onClick={handleHelpDialogOpen}>
                <HelpOutline />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Chip
              label={`Stage: ${interviewStage.charAt(0).toUpperCase() + interviewStage.slice(1)}`}
              color="primary"
              icon={<Psychology />}
            />
            <Chip
              label={`Position: ${jobDetails.title}`}
              color="secondary"
              icon={<EmojiEvents />}
            />
            <Chip
              label={`Time: ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`}
              color="info"
              icon={<Timer />}
            />
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {interviewStages.find(stage => stage.name === interviewStage)?.description}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={stageProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            height: 400,
            overflowY: 'auto',
            mb: 2,
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                  color: message.role === 'user' ? 'primary.contrastText' : 'secondary.contrastText',
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {isProcessing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={isListening ? stopRecording : startRecording}
            color={isListening ? 'error' : 'primary'}
            disabled={isProcessing}
          >
            {isListening ? <MicOff /> : <Mic />}
          </IconButton>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your response..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTextResponse()}
            disabled={isProcessing}
          />

          <IconButton
            onClick={handleTextResponse}
            color="primary"
            disabled={isProcessing || !textInput.trim()}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>

      {showAnalysis && currentAnalysis && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Response Analysis
            </Typography>
            <Button
              variant="outlined"
              startIcon={<History />}
              onClick={() => setShowFeedbackHistory(!showFeedbackHistory)}
            >
              View History
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Speed />
                    </Avatar>
                  }
                  title="Technical Score"
                  subheader={`${currentAnalysis.technicalScore}/10`}
                />
                <CardContent>
                  <LinearProgress
                    variant="determinate"
                    value={currentAnalysis.technicalScore * 10}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <PsychologyAlt />
                    </Avatar>
                  }
                  title="Communication Score"
                  subheader={`${currentAnalysis.communicationScore}/10`}
                />
                <CardContent>
                  <LinearProgress
                    variant="determinate"
                    value={currentAnalysis.communicationScore * 10}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <Group />
                    </Avatar>
                  }
                  title="Cultural Fit Score"
                  subheader={`${currentAnalysis.culturalFitScore}/10`}
                />
                <CardContent>
                  <LinearProgress
                    variant="determinate"
                    value={currentAnalysis.culturalFitScore * 10}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="success" />
                <Typography variant="subtitle1">Strengths</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {currentAnalysis.strengths.map((strength, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Lightbulb color="success" />
                    </ListItemIcon>
                    <ListItemText primary={strength} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDown color="warning" />
                <Typography variant="subtitle1">Areas for Improvement</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {currentAnalysis.areasForImprovement.map((area, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <TipsAndUpdates color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={area} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Overall Assessment
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2">{currentAnalysis.overallAssessment}</Typography>
            </Paper>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Recommendation
            </Typography>
            <Chip
              label={currentAnalysis.recommendation}
              color={
                currentAnalysis.recommendation === 'Hire'
                  ? 'success'
                  : currentAnalysis.recommendation === 'Consider'
                  ? 'warning'
                  : 'error'
              }
              sx={{ fontSize: '1.1rem', padding: 1 }}
            />
          </Box>
        </Paper>
      )}

      <Dialog
        open={showFeedbackHistory}
        onClose={() => setShowFeedbackHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Feedback History</DialogTitle>
        <DialogContent>
          <List>
            {feedbackHistory.map((feedback, index) => (
              <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {feedback.timestamp.toLocaleString()}
                  </Typography>
                  <Chip
                    label={`Technical: ${feedback.technicalScore}/10`}
                    color={feedback.technicalScore >= 7 ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Q: {feedback.question}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  A: {feedback.response}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={`Communication: ${feedback.communicationScore}/10`}
                    color={feedback.communicationScore >= 7 ? 'success' : 'warning'}
                    size="small"
                  />
                  <Chip
                    label={`Cultural Fit: ${feedback.culturalFitScore}/10`}
                    color={feedback.culturalFitScore >= 7 ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <Divider sx={{ width: '100%', my: 1 }} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeedbackHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showHelpDialog}
        onClose={handleHelpDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Interview Help & Guidelines</DialogTitle>
        <DialogContent>
          <Tabs value={helpTab} onChange={handleHelpTabChange}>
            {helpDialogContent.map((content, index) => (
              <Tab key={index} label={content.title} />
            ))}
          </Tabs>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" paragraph>
              {helpDialogContent[helpTab].content}
            </Typography>
            <List>
              {helpDialogContent[helpTab].tips.map((tip, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <TipsAndUpdates color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={tip} />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHelpDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIInterviewBot; 