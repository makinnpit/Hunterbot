import express, { Request, Response } from 'express';
import pool from '../db';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { applicationId, userId, jobId, date } = req.body;

  if (!applicationId || !userId || !jobId || !date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Verify application exists
    const appCheck = await pool.query('SELECT * FROM applications WHERE id = $1', [applicationId]);
    if (appCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify user role
    if (req.user?.role === 'APPLICANT' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(
      'INSERT INTO schedules (application_id, user_id, job_id, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [applicationId, userId, jobId, date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    let queryText = 'SELECT * FROM schedules';
    const params: string[] = [];
    
    if (req.user?.role === 'APPLICANT') {
      queryText += ' WHERE user_id = $1';
      params.push(req.user.id);
    }

    const result = await pool.query(queryText, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
