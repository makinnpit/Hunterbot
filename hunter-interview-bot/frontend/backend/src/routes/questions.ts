import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import prisma from '../db';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/:jobId/generate', authMiddleware, async (req: Request, res: Response) => {
  if (!['RECRUITER', 'ADMIN'].includes(req.user?.role || '')) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { jobId } = req.params;

  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, requirements: true, description: true },
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const prompt = `Generate 5 interview questions for a ${job.title} role. Consider the following requirements: ${job.requirements.join(', ') || 'None'}. Description: ${job.description || 'None'}. Ensure questions are concise and relevant to the role.`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const questionTexts = response.choices[0].message.content
      ?.split('\n')
      .map((q) => q.trim())
      .filter((q) => q && !q.match(/^\d+\./)) // Remove numbering
      .slice(0, 5); // Limit to 5 questions

    if (!questionTexts?.length) {
      return res.status(500).json({ message: 'Failed to generate questions' });
    }

    const questions = await prisma.question.createMany({
      data: questionTexts.map((text) => ({
        jobId,
        text,
        generatedBy: 'AI',
      })),
      skipDuplicates: true,
    });

    const createdQuestions = await prisma.question.findMany({
      where: { jobId, text: { in: questionTexts } },
      select: { id: true, text: true },
    });

    res.json(createdQuestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;