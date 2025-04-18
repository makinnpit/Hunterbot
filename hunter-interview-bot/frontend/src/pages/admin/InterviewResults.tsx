import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

interface Evaluation {
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

const InterviewResults: React.FC<{ candidateId: number }> = ({ candidateId }) => {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluation();
  }, [candidateId]);

  const fetchEvaluation = async () => {
    try {
      const response = await fetch(`/api/admin/candidates/${candidateId}/evaluation`);
      if (!response.ok) {
        throw new Error('Failed to fetch evaluation');
      }
      const data = await response.json();
      setEvaluation(data);
    } catch (error) {
      console.error('Error fetching evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    // Implement PDF generation and download
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!evaluation) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No evaluation data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Interview Evaluation</Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadReport}
        >
          Download Report
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Scores Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Scores Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <ScoreCard
                  title="English Fluency"
                  score={evaluation.englishFluency}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ScoreCard
                  title="Technical Expertise"
                  score={evaluation.technicalExpertise}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ScoreCard
                  title="AI Experience"
                  score={evaluation.aiExperience}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ScoreCard
                  title="Team Fit"
                  score={evaluation.teamFit}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Strengths and Areas for Improvement */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Strengths
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {evaluation.strengths.map((strength, index) => (
                <Chip key={index} label={strength} color="success" />
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Areas for Improvement
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {evaluation.areasForImprovement.map((area, index) => (
                <Chip key={index} label={area} color="warning" />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Interview Transcript */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Interview Transcript
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Answer</TableCell>
                    <TableCell>Analysis</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evaluation.transcript.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.question}</TableCell>
                      <TableCell>{item.answer}</TableCell>
                      <TableCell>{item.analysis}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {evaluation.recommendations.map((recommendation, index) => (
                <Typography key={index} variant="body1">
                  • {recommendation}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const ScoreCard: React.FC<{ title: string; score: number }> = ({ title, score }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <Typography variant="subtitle1" gutterBottom>
      {title}
    </Typography>
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress
        variant="determinate"
        value={score}
        size={80}
        thickness={4}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" component="div" color="text.secondary">
          {`${Math.round(score)}%`}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

export default InterviewResults; 