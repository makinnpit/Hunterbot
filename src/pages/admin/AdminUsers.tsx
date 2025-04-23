import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AdminUsers: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        {/* Add user management content here */}
      </Paper>
    </Box>
  );
};

export default AdminUsers; 