import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import prisma from '../db';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('type').isIn(['Full-time', 'Part-time', 'Contract']).withMessage('Invalid job type'),
    body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
    body('requirements').optional().isArray().withMessage('Requirements must be an array'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    body('externalUrl').optional().isURL().withMessage('Invalid URL'),
  ],
  async (req: Request, res: Response) => {
    if (!['RECRUITER', 'ADMIN'].includes(req.user?.role || '')) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const {
      title,
      department,
      location,
      type,
      description,
      requirements,
      skills,
      externalUrl,
      status,
    } = req.body;

    try {
      const job = await prisma.job.create({
        data: {
          title,
          department,
          location,
          type,
          description,
          requirements: requirements || [],
          skills: skills || [],
          externalUrl,
          status,
        },
      });
      res.status(201).json(job);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create job' });
    }
  }
);

export default router;
