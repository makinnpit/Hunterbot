import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Candidate {
  id: number;
  name: string;
  jobTitle: string;
  status: 'PENDING' | 'INTERVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  interviewScore?: number;
  resumeUrl: string;
  lastUpdated: string;
}

interface CandidatesListProps {
  onSelectCandidate: (candidateId: number) => void;
}

const CandidatesList: React.FC<CandidatesListProps> = ({ onSelectCandidate }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, [selectedJob]);

  const fetchCandidates = async () => {
    try {
      const url = selectedJob === 'all' 
        ? '/api/admin/candidates'
        : `/api/admin/candidates?jobId=${selectedJob}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const handleView = (candidate: Candidate) => {
    onSelectCandidate(candidate.id);
    navigate(`/admin/candidates/${candidate.id}`);
  };

  const handleDownloadResume = async (candidate: Candidate) => {
    try {
      const response = await fetch(candidate.resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidate.name}-resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  const handleStatusChange = async (candidateId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/candidates/${candidateId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setCandidates(candidates.map(candidate =>
        candidate.id === candidateId
          ? { ...candidate, status: newStatus as Candidate['status'] }
          : candidate
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCompare = () => {
    if (selectedCandidates.length >= 2) {
      setCompareDialogOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'INTERVIEWED':
        return 'info';
      case 'SHORTLISTED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'HIRED':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Candidates</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Job</InputLabel>
            <Select
              value={selectedJob}
              label="Filter by Job"
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <MenuItem value="all">All Jobs</MenuItem>
              {/* Add job options here */}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCompare}
            disabled={selectedCandidates.length < 2}
          >
            Compare Candidates
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Job Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Interview Score</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.jobTitle}</TableCell>
                <TableCell>
                  <FormControl size="small">
                    <Select
                      value={candidate.status}
                      onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="INTERVIEWED">Interviewed</MenuItem>
                      <MenuItem value="SHORTLISTED">Shortlisted</MenuItem>
                      <MenuItem value="REJECTED">Rejected</MenuItem>
                      <MenuItem value="HIRED">Hired</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  {candidate.interviewScore !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={candidate.interviewScore}
                        sx={{ width: 100 }}
                      />
                      <Typography variant="body2">
                        {candidate.interviewScore}%
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell>{new Date(candidate.lastUpdated).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(candidate)} size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDownloadResume(candidate)} size="small">
                    <DownloadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Compare Candidates</DialogTitle>
        <DialogContent>
          {/* Add comparison content here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidatesList; 