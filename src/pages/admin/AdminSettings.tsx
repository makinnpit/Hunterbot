import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AdminSettings: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          System Settings
        </Typography>
        {/* Add settings content here */}
      </Paper>
    </Box>
  );
};

export default AdminSettings; 