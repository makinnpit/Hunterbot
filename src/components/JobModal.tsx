import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Chip, Box } from '@mui/material';
import { BriefcaseIcon, BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Job } from '../types';

interface JobModalProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onApply: () => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, open, onClose, onApply }) => {
  if (!job) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{job.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip icon={<BuildingOfficeIcon className="h-5 w-5" />} label={job.department} sx={{ bgcolor: 'primary.light' }} />
          <Chip icon={<MapPinIcon className="h-5 w-5" />} label={job.location} sx={{ bgcolor: 'primary.light' }} />
          <Chip icon={<BriefcaseIcon className="h-5 w-5" />} label={job.type.replace('_', ' ')} sx={{ bgcolor: 'primary.light' }} />
        </Box>
        <Typography variant="body1" paragraph>{job.description}</Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1 }}>Requirements:</Typography>
        <ul>
          {job.requirements.map((req, index) => (
            <li key={index}><Typography variant="body2">{req}</Typography></li>
          ))}
        </ul>
        <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mt: 2, mb: 1 }}>Skills:</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {job.skills.map((skill, index) => (
            <Chip key={index} label={skill} sx={{ bgcolor: 'grey.200' }} />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onApply} sx={{ borderRadius: 2 }}>Apply Now</Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobModal;
