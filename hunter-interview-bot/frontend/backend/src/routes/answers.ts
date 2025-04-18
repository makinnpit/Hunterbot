// src/routes/questions.ts
import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import prisma from '../db';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

const router = express.Router();

router.post('/', authMiddleware, async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'APPLICANT') {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const { scheduleId, questionId, responseUrl } = req.body;
    
    if (!scheduleId || !questionId || !responseUrl) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const result = await prisma.answer.create({
            data: {
                scheduleId,
                questionId,
                responseUrl
            }
        });
        
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating answer:', error);
        res.status(500).json({ message: 'Failed to create answer' });
    }
});

export default router;