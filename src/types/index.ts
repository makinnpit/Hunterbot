export interface QuestionSet {
  technical: string[];
  behavioral: string[];
  situational: string[];
}

export interface Job {
  id: number;
  title: string;
  department: string;
  description: string;
  requirements: string;
  skills: string[];
  questionSet: QuestionSet;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  jobId: number;
  status: 'PENDING' | 'INTERVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  interviewScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Evaluation {
  englishFluency: number;
  technicalExpertise: number;
  aiExperience: number;
  teamFit: number;
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  transcript: {
    question: string;
    answer: string;
    analysis: string;
  }[];
}

export interface OrganizationSettings {
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface AISettings {
  scoringWeights: {
    technical: number;
    communication: number;
    problemSolving: number;
    teamFit: number;
  };
  interviewTone: 'professional' | 'casual' | 'technical';
  questionTemplates: string[];
  autoEvaluation: boolean;
  feedbackLanguage: string;
}

export interface InterviewSession {
  id: number;
  candidateId: number;
  type: 'AI' | 'HUMAN' | 'HYBRID';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledAt?: string;
  completedAt?: string;
  transcript?: string;
  recordingUrl?: string;
  evaluation?: Evaluation;
} 