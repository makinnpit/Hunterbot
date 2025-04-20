
export interface User {
  uid: string;
  email: string;
  role: 'ADMIN' | 'RECRUITER' | 'APPLICANT' | null;
  name?: string;
  phone?: string;
  resumeUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  description: string;
  requirements: string[];
  skills: string[];
  createdAt: string;
  externalUrl?: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  status: 'PENDING' | 'REVIEWED' | 'INTERVIEW_SCHEDULED' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface Question {
  id: string;
  jobId: string;
  text: string;
  generatedBy?: 'MANUAL' | 'OPENAI';
}

export interface Schedule {
  id: string;
  applicationId: string;
  userId: string;
  jobId: string;
  date: string; // ISO string, e.g., "2025-05-01T10:00:00Z"
}
