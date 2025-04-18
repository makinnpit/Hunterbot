import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import uploadRouter from './routes/upload';
import jobsRouter from './routes/jobs';
import interviewsRouter from './routes/interview';
import applicationsRouter from './routes/applications';
import questionsRouter from './routes/questions';
import path from 'path';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../Uploads')));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/questions', questionsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
