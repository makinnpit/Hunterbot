import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import multer from 'multer';
import type { Multer } from 'multer';
import { Readable } from 'stream';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const upload: Multer = multer();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Extend Express Request type to include file
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

// Generate interview question
router.post('/generate-question', async (req: Request, res: Response) => {
  try {
    const { jobDetails, applicantDetails, interviewStage, previousMessages } = req.body;

    const prompt = `
      You are an AI interviewer for the position of ${jobDetails.title}.
      Job Description: ${jobDetails.description}
      Required Skills: ${jobDetails.skills.join(', ')}
      
      Applicant Details:
      Name: ${applicantDetails.name}
      Experience: ${applicantDetails.experience}
      Education: ${applicantDetails.education}
      Skills: ${applicantDetails.skills.join(', ')}
      
      Current Interview Stage: ${interviewStage}
      
      Previous Conversation:
      ${previousMessages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}
      
      Generate an appropriate question for this stage of the interview.
      The question should be relevant to the job requirements and the applicant's background.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an experienced technical interviewer." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const question = completion.choices[0].message.content;

    res.json({ question });
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Process audio response
router.post('/process-response', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const { question, jobDetails, applicantDetails } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Convert audio to text using OpenAI Whisper
    const audioStream = Readable.from(audioFile.buffer);
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream as any,
      model: 'whisper-1',
    });

    const responseText = transcription.text;

    // Analyze the response
    const analysis = await analyzeResponse(
      responseText,
      question,
      jobDetails,
      applicantDetails
    );

    // Generate next question
    const nextQuestion = await generateNextQuestion(
      jobDetails,
      applicantDetails,
      [...JSON.parse(req.body.previousMessages || '[]'), 
       { role: 'user', content: responseText }]
    );

    res.json({
      transcription: responseText,
      analysis,
      nextQuestion,
    });
  } catch (error) {
    console.error('Error processing response:', error);
    res.status(500).json({ error: 'Failed to process response' });
  }
});

// Process text response
router.post('/process-text-response', async (req: Request, res: Response) => {
  try {
    const { message, question, jobDetails, applicantDetails } = req.body;

    // Analyze the response
    const analysis = await analyzeResponse(
      message,
      question,
      jobDetails,
      applicantDetails
    );

    // Generate next question
    const nextQuestion = await generateNextQuestion(
      jobDetails,
      applicantDetails,
      [{ role: 'user', content: message }]
    );

    res.json({
      analysis,
      nextQuestion,
    });
  } catch (error) {
    console.error('Error processing text response:', error);
    res.status(500).json({ error: 'Failed to process response' });
  }
});

// Helper function to analyze responses
async function analyzeResponse(
  response: string,
  question: string,
  jobDetails: any,
  applicantDetails: any
) {
  const prompt = `
    Analyze the following interview response:
    
    Question: ${question}
    Response: ${response}
    
    Job Details:
    Title: ${jobDetails.title}
    Requirements: ${jobDetails.requirements.join(', ')}
    Skills: ${jobDetails.skills.join(', ')}
    
    Applicant Details:
    Experience: ${applicantDetails.experience}
    Education: ${applicantDetails.education}
    Skills: ${applicantDetails.skills.join(', ')}
    
    Provide a detailed analysis including:
    1. Technical knowledge assessment (score 1-10)
    2. Communication skills assessment (score 1-10)
    3. Cultural fit assessment (score 1-10)
    4. Key strengths demonstrated
    5. Areas for improvement
    6. Overall assessment
    7. Recommendation (Hire/Consider/Reject)
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are an experienced hiring manager analyzing interview responses." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
  });

  const analysisText = completion.choices[0].message.content || '';

  // Parse the analysis text into structured data
  const analysis = {
    technicalScore: extractScore(analysisText, 'Technical knowledge assessment'),
    communicationScore: extractScore(analysisText, 'Communication skills assessment'),
    culturalFitScore: extractScore(analysisText, 'Cultural fit assessment'),
    strengths: extractList(analysisText, 'Key strengths demonstrated'),
    areasForImprovement: extractList(analysisText, 'Areas for improvement'),
    overallAssessment: extractSection(analysisText, 'Overall assessment'),
    recommendation: extractRecommendation(analysisText),
  };

  return analysis;
}

// Helper function to generate next question
async function generateNextQuestion(
  jobDetails: any,
  applicantDetails: any,
  previousMessages: any[]
) {
  const prompt = `
    Generate the next interview question based on:
    
    Job: ${jobDetails.title}
    Previous conversation:
    ${previousMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
    
    The question should:
    1. Be relevant to the job requirements
    2. Build upon previous responses
    3. Help assess the candidate's fit for the role
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are an experienced interviewer." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

// Helper functions to parse analysis text
function extractScore(text: string | null, section: string): number {
  if (!text) return 0;
  const regex = new RegExp(`${section}.*?(\\d+)/10`, 'i');
  const match = text.match(regex);
  return match ? parseInt(match[1]) : 0;
}

function extractList(text: string | null, section: string): string[] {
  if (!text) return [];
  const regex = new RegExp(`${section}:(.*?)(?=\\n\\d|\n\n|$)`, 'is');
  const match = text.match(regex);
  if (!match) return [];
  
  return match[1]
    .split('\n')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

function extractSection(text: string | null, section: string): string {
  if (!text) return '';
  const regex = new RegExp(`${section}:(.*?)(?=\\n\\d|\n\n|$)`, 'is');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function extractRecommendation(text: string | null): 'Hire' | 'Consider' | 'Reject' {
  if (!text) return 'Consider';
  const regex = /Recommendation:\s*(Hire|Consider|Reject)/i;
  const match = text.match(regex);
  return (match ? match[1] : 'Consider') as 'Hire' | 'Consider' | 'Reject';
}

export default router; 